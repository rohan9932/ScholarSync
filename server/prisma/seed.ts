import { PrismaClient, DayOfWeek, SlotType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding } from '../src/services/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

/**
 * Converts 12-hour "hh:mm AM/PM" to 24-hour "HH:mm"
 * e.g., "01:00 PM" -> "13:00", "08:00 AM" -> "08:00", "12:15 PM" -> "12:15"
 */
function parseTimeTo24H(timeStr: string): string {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    throw new Error(`Invalid time string format: "${timeStr}"`);
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3].toUpperCase();

  if (meridian === 'AM') {
    if (hours === 12) {
      hours = 0;
    }
  } else if (meridian === 'PM') {
    if (hours !== 12) {
      hours += 12;
    }
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function findDataFile(filename: string): string | null {
  const possiblePaths = [
    path.resolve(__dirname, '../../', filename),          // Root: e:\ScholarSync\<filename>
    path.resolve(__dirname, '../', filename),             // Server: e:\ScholarSync\server\<filename>
    path.resolve(__dirname, '../../data', filename),      // Root data: e:\ScholarSync\data\<filename>
    path.resolve(__dirname, filename),                    // Prisma: e:\ScholarSync\server\prisma\<filename>
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

interface RawFaculty {
  id: string;
  name: string;
  designation: string;
  email: string;
  research_interests: string[];
  profile_url?: string;
}

interface DaySchedule {
  day: string;
  busy_slots?: string[];
  free_slots?: string[];
}

interface RawSchedule {
  faculty_name: string;
  schedule: DaySchedule[];
}

async function main() {
  console.log('🌱 Starting ScholarSync database seed...');

  const facultyJsonPath = findDataFile('faculty.json');
  const scheduleJsonPath = findDataFile('schedule.json');

  if (!facultyJsonPath || !scheduleJsonPath) {
    console.error('❌ Data files missing!');
    console.log(`faculty.json found: ${facultyJsonPath ? 'YES (' + facultyJsonPath + ')' : 'NO'}`);
    console.log(`schedule.json found: ${scheduleJsonPath ? 'YES (' + scheduleJsonPath + ')' : 'NO'}`);
    console.log('\nPlease place faculty.json and schedule.json in the project root: e:\\ScholarSync\\');
    process.exit(1);
  }

  console.log(`📂 Using faculty file: ${facultyJsonPath}`);
  console.log(`📂 Using schedule file: ${scheduleJsonPath}`);

  const facultiesData: RawFaculty[] = JSON.parse(fs.readFileSync(facultyJsonPath, 'utf-8'));
  const schedulesData: RawSchedule[] = JSON.parse(fs.readFileSync(scheduleJsonPath, 'utf-8'));

  console.log(`📊 Found ${facultiesData.length} faculty entries and ${schedulesData.length} schedule entries.`);

  // 1. Seed Faculty
  console.log('⏳ Seeding Faculty table...');
  const facultyNameMap = new Map<string, string>(); // name -> id

  for (const f of facultiesData) {
    facultyNameMap.set(f.name.trim(), f.id);

    await prisma.faculty.upsert({
      where: { id: f.id },
      update: {
        name: f.name.trim(),
        designation: f.designation,
        email: f.email.trim(),
        profileUrl: f.profile_url || null,
        researchInterests: Array.isArray(f.research_interests) ? f.research_interests : [],
      },
      create: {
        id: f.id,
        name: f.name.trim(),
        designation: f.designation,
        email: f.email.trim(),
        profileUrl: f.profile_url || null,
        researchInterests: Array.isArray(f.research_interests) ? f.research_interests : [],
      },
    });
  }
  console.log(`✅ Seeded ${facultiesData.length} faculty records.`);

  // 2. Seed ScheduleSlots
  console.log('⏳ Seeding ScheduleSlot records...');
  // Clear existing seed schedule slots to make seed idempotent
  await prisma.scheduleSlot.deleteMany({
    where: { source: 'seed' },
  });

  let totalSlotsInserted = 0;
  let matchedFacultyCount = 0;
  const allSlotRecords: any[] = [];

  for (const s of schedulesData) {
    const facultyId = facultyNameMap.get(s.faculty_name.trim());
    if (!facultyId) {
      console.warn(`⚠️ Schedule faculty_name "${s.faculty_name}" did not match any faculty record! Skipping.`);
      continue;
    }

    matchedFacultyCount++;

    const slotRecords: Array<{
      facultyId: string;
      day: DayOfWeek;
      startTime: string;
      endTime: string;
      type: SlotType;
      source: string;
    }> = [];

    for (const dayObj of s.schedule) {
      const day = dayObj.day.toUpperCase() as DayOfWeek;
      if (!Object.values(DayOfWeek).includes(day)) {
        console.warn(`Unknown day: ${dayObj.day}`);
        continue;
      }

      // Busy slots
      if (Array.isArray(dayObj.busy_slots)) {
        for (const slotStr of dayObj.busy_slots) {
          const parts = slotStr.split('-');
          if (parts.length === 2) {
            slotRecords.push({
              facultyId,
              day,
              startTime: parseTimeTo24H(parts[0]),
              endTime: parseTimeTo24H(parts[1]),
              type: SlotType.BUSY,
              source: 'seed',
            });
          }
        }
      }

      // Free slots
      if (Array.isArray(dayObj.free_slots)) {
        for (const slotStr of dayObj.free_slots) {
          const parts = slotStr.split('-');
          if (parts.length === 2) {
            slotRecords.push({
              facultyId,
              day,
              startTime: parseTimeTo24H(parts[0]),
              endTime: parseTimeTo24H(parts[1]),
              type: SlotType.FREE,
              source: 'seed',
            });
          }
        }
      }
    }

    if (slotRecords.length > 0) {
      allSlotRecords.push(...slotRecords);
    }
  }

  // Insert in batches of 200
  for (let i = 0; i < allSlotRecords.length; i += 200) {
    const batch = allSlotRecords.slice(i, i + 200);
    await prisma.scheduleSlot.createMany({ data: batch });
    totalSlotsInserted += batch.length;
  }

  console.log(`✅ Seeded ${totalSlotsInserted} schedule slots across ${matchedFacultyCount} faculty.`);
  console.log(`ℹ️ ${facultiesData.length - matchedFacultyCount} faculty have no schedule data (expected).`);

  // 3. Embedding Backfill (Phase 3 lands)
  console.log('⏳ Checking faculty research interest vector embeddings...');
  const existingEmbeddings = await prisma.$queryRawUnsafe<{ id: string; hasEmbedding: boolean }[]>(
    'SELECT id, (embedding IS NOT NULL) as "hasEmbedding" FROM faculties'
  );
  const embeddedMap = new Map(existingEmbeddings.map((r) => [r.id, r.hasEmbedding]));

  let updatedCount = 0;
  let alreadyEmbeddedCount = 0;
  let totalWithInterests = 0;

  for (const f of facultiesData) {
    if (f.research_interests && f.research_interests.length > 0) {
      totalWithInterests++;
      if (embeddedMap.get(f.id)) {
        alreadyEmbeddedCount++;
        continue;
      }
      const joinedText = f.research_interests.join(', ');
      try {
        const embedding = await getEmbedding(joinedText);
        if (embedding && embedding.length === 768) {
          const vectorStr = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE faculties SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            f.id
          );
          updatedCount++;
          if (updatedCount % 10 === 0) {
            console.log(`  ↪ Embedded ${updatedCount} new faculty research profiles...`);
          }
        }
      } catch (err: any) {
        console.warn(`  ⚠️ Failed to generate embedding for faculty ${f.id} (${f.name}):`, err.message);
      }
    }
  }

  console.log(`✅ Faculty embeddings verified: ${alreadyEmbeddedCount + updatedCount}/${totalWithInterests} faculty embedded (${alreadyEmbeddedCount} existing, ${updatedCount} newly created).`);
  console.log(`ℹ️ ${facultiesData.length - totalWithInterests} faculty have no research interests (embeddings left NULL as per contract).`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
