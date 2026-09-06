import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding } from '../src/services/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const facultyJsonPath = path.resolve(__dirname, '../../faculty.json');
  const scheduleJsonPath = path.resolve(__dirname, '../../schedule.json');

  if (!fs.existsSync(facultyJsonPath) || !fs.existsSync(scheduleJsonPath)) {
    console.warn('⚠️ faculty.json or schedule.json not found in repository root yet.');
    console.log('Please ensure data files are placed at root or configured path.');
    return;
  }

  const faculties = JSON.parse(fs.readFileSync(facultyJsonPath, 'utf-8'));
  const schedules = JSON.parse(fs.readFileSync(scheduleJsonPath, 'utf-8'));

  console.log(`Loaded ${faculties.length} faculties and ${schedules.length} schedules.`);

  // Agent 1 will complete the pipeline per Phase 1.4
  console.log('✅ Seed template executed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
