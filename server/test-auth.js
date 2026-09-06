import app from './src/app.js';
import prisma from './src/config/prisma.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
    passed++;
  }
}

async function runAuthTests() {
  console.log('🧪 Starting Role-Based Authentication Test Suite...\n');

  const server = app.listen(5098);
  const BASE_URL = 'http://localhost:5098/api/auth';

  try {
    // 1. Clean up any previous test user
    await prisma.user.deleteMany({
      where: {
        email: { in: ['teststudent@aust.edu', 'testteacher@aust.edu'] },
      },
    });

    // 2. Test Student Registration
    console.log('--- Test 1: Student Registration ---');
    const studentRegRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@aust.edu',
        password: 'password123',
        name: 'Sadia Rahman',
        role: 'STUDENT',
      }),
    });
    assert(studentRegRes.status === 201, `Student registration returned 201 Created (got ${studentRegRes.status})`);
    const studentData = await studentRegRes.json();
    assert(!!studentData.token, 'Token generated for new student');
    assert(studentData.user.role === 'STUDENT', 'User role is STUDENT');
    assert(studentData.user.facultyId === null, 'Student has no facultyId');

    // 3. Duplicate Email Prevention
    console.log('\n--- Test 2: Duplicate Email Prevention ---');
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@aust.edu',
        password: 'password123',
        name: 'Sadia Rahman',
        role: 'STUDENT',
      }),
    });
    assert(dupRes.status === 409, `Duplicate email rejected with 409 Conflict (got ${dupRes.status})`);

    // 4. Test Teacher Registration with Faculty Link
    console.log('\n--- Test 3: Teacher Registration with Faculty Link ---');
    const teacherRegRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testteacher@aust.edu',
        password: 'password123',
        name: 'Prof. Dr. Kazi A Kalpoma',
        role: 'TEACHER',
        facultyId: 'fac-002',
      }),
    });
    assert(teacherRegRes.status === 201, `Teacher registration returned 201 Created (got ${teacherRegRes.status})`);
    const teacherData = await teacherRegRes.json();
    assert(teacherData.user.role === 'TEACHER', 'User role is TEACHER');
    assert(teacherData.user.facultyId === 'fac-002', 'User linked to faculty fac-002');

    // 5. Test Invalid Login
    console.log('\n--- Test 4: Invalid Password Rejection ---');
    const badLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@aust.edu',
        password: 'wrongpassword',
      }),
    });
    assert(badLoginRes.status === 401, `Invalid credentials rejected with 401 Unauthorized (got ${badLoginRes.status})`);

    // 6. Test Demo Teacher Login
    console.log('\n--- Test 5: Demo Teacher Login ---');
    const teacherLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@aust.edu',
        password: 'teacher123',
      }),
    });
    assert(teacherLoginRes.status === 200, 'Teacher login successful (200 OK)');
    const teacherLoginData = await teacherLoginRes.json();
    assert(teacherLoginData.user.role === 'TEACHER', 'Role is TEACHER');
    assert(teacherLoginData.user.facultyId === 'fac-001', 'Teacher is linked to fac-001');
    assert(!!teacherLoginData.token, 'Teacher JWT token received');

    // 7. Test Demo Student Login
    console.log('\n--- Test 6: Demo Student Login ---');
    const studentLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@aust.edu',
        password: 'student123',
      }),
    });
    assert(studentLoginRes.status === 200, 'Student login successful (200 OK)');
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginData.user.role === 'STUDENT', 'Role is STUDENT');

    // 8. Test Protected /api/auth/me
    console.log('\n--- Test 7: Protected /api/auth/me ---');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${teacherLoginData.token}`,
      },
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK with valid token');
    const meData = await meRes.json();
    assert(meData.user.email === 'teacher@aust.edu', 'Returns correct authenticated user');
    assert(meData.user.role === 'TEACHER', 'Returns user role');

    // 9. Unauthorized /api/auth/me without token
    console.log('\n--- Test 8: Unauthorized Request Handling ---');
    const unauthRes = await fetch(`${BASE_URL}/me`);
    assert(unauthRes.status === 401, 'GET /api/auth/me returns 401 when token is missing');

    // Cleanup test accounts
    await prisma.user.deleteMany({
      where: {
        email: { in: ['teststudent@aust.edu', 'testteacher@aust.edu'] },
      },
    });

    console.log(`\n==========================================`);
    console.log(`Auth Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==========================================\n`);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAuthTests();
