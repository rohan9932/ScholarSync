import prisma from '../src/config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseTimeTo24H(timeStr) {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time format: ${timeStr}`);
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3].toUpperCase();
  if (meridian === 'AM' && hours === 12) hours = 0;
  if (meridian === 'PM' && hours !== 12) hours += 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

async function syncSchedules() {
  const count = await prisma.scheduleSlot.count();
  console.log(`Current schedule slots in DB: ${count}`);

  if (count === 1538) {
    console.log('✅ Schedule slots are already fully populated (1538 slots).');
    await prisma.$disconnect();
    return;
  }

  console.log('⏳ Restoring schedule slots from schedule.json...');
  const schedulePath = path.resolve(__dirname, '../../schedule.json');
  const facultyPath = path.resolve(__dirname, '../../faculty.json');

  const faculties = JSON.parse(fs.readFileSync(facultyPath, 'utf-8'));
  const schedules = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));

  const facultyMap = new Map(faculties.map((f) => [f.name.trim(), f.id]));

  // Clear existing seed slots cleanly
  await prisma.scheduleSlot.deleteMany({ where: { source: 'seed' } });

  const allSlots = [];
  for (const s of schedules) {
    const facultyId = facultyMap.get(s.faculty_name.trim());
    if (!facultyId) continue;

    for (const dayObj of s.schedule) {
      const day = dayObj.day.toUpperCase();
      if (dayObj.busy_slots) {
        for (const slotStr of dayObj.busy_slots) {
          const parts = slotStr.split('-');
          if (parts.length === 2) {
            allSlots.push({
              facultyId,
              day,
              startTime: parseTimeTo24H(parts[0]),
              endTime: parseTimeTo24H(parts[1]),
              type: 'BUSY',
              source: 'seed',
            });
          }
        }
      }
      if (dayObj.free_slots) {
        for (const slotStr of dayObj.free_slots) {
          const parts = slotStr.split('-');
          if (parts.length === 2) {
            allSlots.push({
              facultyId,
              day,
              startTime: parseTimeTo24H(parts[0]),
              endTime: parseTimeTo24H(parts[1]),
              type: 'FREE',
              source: 'seed',
            });
          }
        }
      }
    }
  }

  console.log(`Inserting ${allSlots.length} schedule slots in batches...`);
  // Insert in batches of 200 for maximum reliability
  const BATCH_SIZE = 200;
  for (let i = 0; i < allSlots.length; i += BATCH_SIZE) {
    const batch = allSlots.slice(i, i + BATCH_SIZE);
    await prisma.scheduleSlot.createMany({ data: batch });
  }

  const finalCount = await prisma.scheduleSlot.count();
  console.log(`✅ Schedule slots restored: ${finalCount} slots.`);
  await prisma.$disconnect();
}

syncSchedules().catch((err) => {
  console.error('Error syncing schedules:', err);
  process.exit(1);
});
