import prisma from './src/config/prisma.js';
import { getEmbedding } from './src/services/embeddings.js';
import { evaluateApplication } from './src/ai/matching.js';
import { executeToolCall, schedulingToolDeclarations } from './src/ai/tools.js';
import { processChatMessage } from './src/ai/chatAgent.js';

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

async function runTests() {
  console.log('🧪 Starting Phase 3 Automated Test Suite...\n');

  // ==========================================
  // Test 1: getEmbedding generates 768-dim vector
  // ==========================================
  console.log('--- Test 1: Embedding Service ---');
  try {
    const text = 'Autonomous robotics, reinforcement learning, and computer vision.';
    const embedding = await getEmbedding(text);
    assert(Array.isArray(embedding), 'Embedding is an array');
    assert(embedding.length === 768, `Embedding dimension is exactly 768 (got ${embedding.length})`);
    assert(typeof embedding[0] === 'number', 'Embedding values are floats');
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }

  // ==========================================
  // Test 2: AI Tools Execution
  // ==========================================
  console.log('\n--- Test 2: AI Tools Execution ---');
  let createdTaskId = null;
  try {
    // 2a. Tool declarations check
    assert(schedulingToolDeclarations.length === 5, 'Defined 5 tool declarations for Gemini');

    // 2b. get_schedule
    const scheduleRes = await executeToolCall('get_schedule', {
      facultyId: 'fac-001',
      date: '2026-09-06', // Sunday
    });
    assert(scheduleRes.day === 'SUN', 'get_schedule correctly identifies Sunday');
    assert(Array.isArray(scheduleRes.classSlots), 'get_schedule returns classSlots array');

    // 2c. Weekend handling in get_schedule
    const weekendRes = await executeToolCall('get_schedule', {
      facultyId: 'fac-001',
      date: '2026-09-11', // Friday
    });
    assert(weekendRes.isWeekend === true, 'get_schedule detects Friday as weekend');

    // 2d. find_free_slot
    const freeSlotRes = await executeToolCall('find_free_slot', {
      facultyId: 'fac-001',
      date: '2026-09-07', // Monday
      durationMinutes: 40,
    });
    assert(typeof freeSlotRes.found === 'boolean', 'find_free_slot returns boolean found flag');
    if (freeSlotRes.found) {
      assert(freeSlotRes.matchedSlot.durationMinutes >= 40, 'matched slot has duration >= 40 mins');
    }

    // 2e. create_task
    const taskRes = await executeToolCall('create_task', {
      facultyId: 'fac-001',
      title: 'AI Automated Test Task',
      startTime: '2026-09-07T14:00:00.000Z',
      endTime: '2026-09-07T15:00:00.000Z',
      description: 'Automated test task creation by ScholarSync AI test suite',
    });
    assert(taskRes.success === true, 'create_task successfully creates task');
    assert(taskRes.task && taskRes.task.id, 'create_task returns created task ID');
    createdTaskId = taskRes.task.id;

    // 2f. update_task
    const updateRes = await executeToolCall('update_task', {
      taskId: createdTaskId,
      status: 'IN_PROGRESS',
      title: 'AI Automated Test Task (Updated)',
    });
    assert(updateRes.success === true, 'update_task updates task status');
    assert(updateRes.task.status === 'IN_PROGRESS', 'task status is IN_PROGRESS');

    // 2g. delete_task
    const deleteRes = await executeToolCall('delete_task', {
      taskId: createdTaskId,
    });
    assert(deleteRes.success === true, 'delete_task deletes the task');
    createdTaskId = null; // Cleaned up
  } catch (err) {
    console.error('Test 2 failed:', err.message);
    if (createdTaskId) {
      await prisma.task.delete({ where: { id: createdTaskId } }).catch(() => {});
    }
  }

  // ==========================================
  // Test 3: evaluateApplication RAG Pipeline
  // ==========================================
  console.log('\n--- Test 3: Application Evaluation Pipeline ---');
  let testAppId = null;
  try {
    // Pick a faculty with research interests
    const faculty = await prisma.faculty.findFirst({
      where: { researchInterests: { isEmpty: false } },
    });
    assert(!!faculty, `Found faculty with research interests: ${faculty?.name}`);

    // Create a student application
    const app = await prisma.application.create({
      data: {
        facultyId: faculty.id,
        studentName: 'Zubair Al-Mahmud',
        studentEmail: 'zubair.test@aust.edu',
        studentContact: '+8801700000000',
        pitchText:
          'I am eager to work on deep reinforcement learning algorithms applied to multi-robot coordination and autonomous navigation, inspired by your published papers in intelligent robotics.',
        status: 'PENDING',
      },
    });
    testAppId = app.id;

    // Run evaluation
    const evalResult = await evaluateApplication(app.id);
    assert(evalResult && typeof evalResult.matchScore === 'number', `Application scored: ${evalResult.matchScore}%`);
    assert(evalResult.matchScore >= 0 && evalResult.matchScore <= 100, 'Match score is bounded between 0 and 100');
    assert(evalResult.matchSummary && evalResult.matchSummary.length > 10, 'Generated informative match summary');

    // Verify database record
    const updatedApp = await prisma.application.findUnique({
      where: { id: app.id },
    });
    assert(updatedApp.matchScore !== null, 'DB record updated with matchScore');
    assert(updatedApp.matchSummary !== null, 'DB record updated with matchSummary');

    // Clean up test application
    await prisma.application.delete({ where: { id: testAppId } });
    testAppId = null;
  } catch (err) {
    console.error('Test 3 failed:', err.message);
    if (testAppId) {
      await prisma.application.delete({ where: { id: testAppId } }).catch(() => {});
    }
  }

  // ==========================================
  // Test 4: Chat Agent Multi-turn Orchestration
  // ==========================================
  console.log('\n--- Test 4: Conversational Chat Agent ---');
  try {
    const chatResult = await processChatMessage({
      facultyId: 'fac-001',
      currentDate: '2026-09-06',
      message: 'Hello! Can you check what classes or commitments I have scheduled for today, Sunday?',
    });

    assert(typeof chatResult.reply === 'string' && chatResult.reply.length > 0, 'Chat agent produced text reply');
    assert(Array.isArray(chatResult.toolCalls), 'Chat agent returned toolCalls array');
    console.log('  💬 Agent Reply sample:', chatResult.reply.slice(0, 140) + '...');
    console.log('  🛠️ Tools executed count:', chatResult.toolCalls.length);
  } catch (err) {
    console.error('Test 4 failed:', err.message);
  }

  console.log(`\n==========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`==========================================\n`);

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
