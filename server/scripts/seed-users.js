import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

async function seedUsers() {
  console.log('🌱 Seeding demo accounts for Teacher and Student...');

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Teacher account linked to fac-001
  const faculty = await prisma.faculty.findUnique({
    where: { id: 'fac-001' },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@aust.edu' },
    update: {
      passwordHash: teacherPassword,
      name: faculty ? faculty.name : 'Prof. Dr. S.M.A. Al-Mamun',
      role: 'TEACHER',
      facultyId: 'fac-001',
    },
    create: {
      email: 'teacher@aust.edu',
      passwordHash: teacherPassword,
      name: faculty ? faculty.name : 'Prof. Dr. S.M.A. Al-Mamun',
      role: 'TEACHER',
      facultyId: 'fac-001',
    },
  });

  console.log(`👨‍🏫 Teacher account ready: ${teacher.email} (Linked to ${teacher.facultyId})`);

  // 2. Student account
  const student = await prisma.user.upsert({
    where: { email: 'student@aust.edu' },
    update: {
      passwordHash: studentPassword,
      name: 'Rafi Ahmed',
      role: 'STUDENT',
      facultyId: null,
    },
    create: {
      email: 'student@aust.edu',
      passwordHash: studentPassword,
      name: 'Rafi Ahmed',
      role: 'STUDENT',
      facultyId: null,
    },
  });

  console.log(`🎓 Student account ready: ${student.email}`);
  console.log('\n🎉 Demo accounts successfully seeded!');
  await prisma.$disconnect();
}

seedUsers().catch((err) => {
  console.error('Error seeding users:', err);
  process.exit(1);
});
