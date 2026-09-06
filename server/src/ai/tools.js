import prisma from '../config/prisma.js';

const DAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Gemini Function Calling Declarations
 */
export const schedulingToolDeclarations = [
  {
    name: 'get_schedule',
    description:
      'Get faculty class schedule slots (busy and free), existing tasks, and bookings for a specific date (YYYY-MM-DD). Academic week has classes SUN-THU, and FRI-SAT is the weekend in Bangladesh.',
    parameters: {
      type: 'OBJECT',
      properties: {
        facultyId: {
          type: 'STRING',
          description: 'The faculty ID (e.g. fac-001)',
        },
        date: {
          type: 'STRING',
          description: 'Target date in YYYY-MM-DD format (e.g. 2026-09-06)',
        },
      },
      required: ['facultyId', 'date'],
    },
  },
  {
    name: 'find_free_slot',
    description:
      'Find available free time windows of at least durationMinutes for a faculty member on a specific date, accounting for classes, tasks, and bookings.',
    parameters: {
      type: 'OBJECT',
      properties: {
        facultyId: {
          type: 'STRING',
          description: 'The faculty ID (e.g. fac-001)',
        },
        date: {
          type: 'STRING',
          description: 'Target date in YYYY-MM-DD format (e.g. 2026-09-06)',
        },
        durationMinutes: {
          type: 'INTEGER',
          description: 'Minimum required free duration in minutes (e.g. 30, 50, 60)',
        },
      },
      required: ['facultyId', 'date'],
    },
  },
  {
    name: 'create_task',
    description:
      'Create and schedule a new task or calendar block for a faculty member on their schedule.',
    parameters: {
      type: 'OBJECT',
      properties: {
        facultyId: {
          type: 'STRING',
          description: 'The faculty ID (e.g. fac-001)',
        },
        title: {
          type: 'STRING',
          description: 'Title of the task (e.g. "Review Paper", "Consultation", "Meeting")',
        },
        startTime: {
          type: 'STRING',
          description: 'Start time in ISO-8601 format (e.g. "2026-09-07T10:00:00Z")',
        },
        endTime: {
          type: 'STRING',
          description: 'End time in ISO-8601 format (e.g. "2026-09-07T11:00:00Z")',
        },
        description: {
          type: 'STRING',
          description: 'Optional notes or task details',
        },
      },
      required: ['facultyId', 'title', 'startTime', 'endTime'],
    },
  },
  {
    name: 'update_task',
    description: 'Update an existing task title, time, status, or description.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: {
          type: 'STRING',
          description: 'The ID of the task to update',
        },
        title: { type: 'STRING', description: 'New task title' },
        startTime: { type: 'STRING', description: 'New start time ISO-8601' },
        endTime: { type: 'STRING', description: 'New end time ISO-8601' },
        status: {
          type: 'STRING',
          description: 'Task status: PENDING, IN_PROGRESS, DONE, or CANCELLED',
        },
        description: { type: 'STRING', description: 'New description' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete or remove a scheduled task by ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: {
          type: 'STRING',
          description: 'The ID of the task to delete',
        },
      },
      required: ['taskId'],
    },
  },
];

// Helper to parse date string into DayOfWeek and start/end of day
function parseDateInfo(dateStr) {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const dayNum = parseInt(dayStr, 10);

  const targetDate = new Date(Date.UTC(year, month, dayNum));
  const dayOfWeek = DAY_MAP[targetDate.getUTCDay()];
  const startOfDay = new Date(Date.UTC(year, month, dayNum, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, dayNum, 23, 59, 59, 999));

  return { targetDate, dayOfWeek, startOfDay, endOfDay };
}

function toHHmm(date) {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const mins = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function calculateSlotDurationMinutes(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/**
 * Execute Tool Implementation against Prisma DB
 *
 * @param {string} name - Tool name
 * @param {object} args - Tool arguments
 * @returns {Promise<object>} Tool execution result
 */
export async function executeToolCall(name, args) {
  try {
    switch (name) {
      case 'get_schedule': {
        const { facultyId, date } = args;
        const faculty = await prisma.faculty.findUnique({
          where: { id: facultyId },
          select: { id: true, name: true },
        });

        if (!faculty) {
          return { error: `Faculty with ID '${facultyId}' not found.` };
        }

        const slotCount = await prisma.scheduleSlot.count({
          where: { facultyId },
        });

        if (slotCount === 0) {
          return {
            hasSchedule: false,
            message: `Faculty ${faculty.name} has no timetable schedule on file.`,
          };
        }

        const { dayOfWeek, startOfDay, endOfDay } = parseDateInfo(date);

        if (dayOfWeek === 'FRI' || dayOfWeek === 'SAT') {
          return {
            hasSchedule: true,
            isWeekend: true,
            day: dayOfWeek,
            date,
            message: `Date ${date} falls on ${dayOfWeek} (Bangladesh academic weekend). There are no regular university classes scheduled.`,
          };
        }

        const slots = await prisma.scheduleSlot.findMany({
          where: { facultyId, day: dayOfWeek },
          orderBy: { startTime: 'asc' },
        });

        const tasks = await prisma.task.findMany({
          where: {
            facultyId,
            status: { not: 'CANCELLED' },
            startTime: { lte: endOfDay },
            endTime: { gte: startOfDay },
          },
          orderBy: { startTime: 'asc' },
        });

        const bookings = await prisma.booking.findMany({
          where: {
            facultyId,
            status: 'APPROVED',
            slotStart: { lte: endOfDay },
            slotEnd: { gte: startOfDay },
          },
          orderBy: { slotStart: 'asc' },
        });

        return {
          facultyName: faculty.name,
          date,
          day: dayOfWeek,
          classSlots: slots.map((s) => ({
            type: s.type,
            time: `${s.startTime} - ${s.endTime}`,
          })),
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            time: `${toHHmm(t.startTime)} - ${toHHmm(t.endTime)}`,
            status: t.status,
          })),
          bookings: bookings.map((b) => ({
            id: b.id,
            studentName: b.studentName,
            time: `${toHHmm(b.slotStart)} - ${toHHmm(b.slotEnd)}`,
          })),
        };
      }

      case 'find_free_slot': {
        const { facultyId, date, durationMinutes = 30 } = args;

        const faculty = await prisma.faculty.findUnique({
          where: { id: facultyId },
          select: { id: true, name: true },
        });

        if (!faculty) {
          return { error: `Faculty with ID '${facultyId}' not found.` };
        }

        const slotCount = await prisma.scheduleSlot.count({
          where: { facultyId },
        });

        if (slotCount === 0) {
          return {
            hasSchedule: false,
            message: `Faculty ${faculty.name} has no timetable schedule on file. Cannot determine free class slots.`,
          };
        }

        const { dayOfWeek, startOfDay, endOfDay } = parseDateInfo(date);

        if (dayOfWeek === 'FRI' || dayOfWeek === 'SAT') {
          return {
            isWeekend: true,
            day: dayOfWeek,
            date,
            message: `${dayOfWeek} is a weekend day. No classes are held. The entire day is outside normal class hours.`,
          };
        }

        // Get free slots from schedule
        const freeSlots = await prisma.scheduleSlot.findMany({
          where: {
            facultyId,
            day: dayOfWeek,
            type: 'FREE',
          },
          orderBy: { startTime: 'asc' },
        });

        // Get conflicting tasks and bookings
        const tasks = await prisma.task.findMany({
          where: {
            facultyId,
            status: { not: 'CANCELLED' },
            startTime: { lte: endOfDay },
            endTime: { gte: startOfDay },
          },
        });

        const bookings = await prisma.booking.findMany({
          where: {
            facultyId,
            status: 'APPROVED',
            slotStart: { lte: endOfDay },
            slotEnd: { gte: startOfDay },
          },
        });

        const blockedIntervals = [
          ...tasks.map((t) => ({ start: toHHmm(t.startTime), end: toHHmm(t.endTime) })),
          ...bookings.map((b) => ({ start: toHHmm(b.slotStart), end: toHHmm(b.slotEnd) })),
        ];

        // Filter and find candidates
        const candidates = [];
        for (const slot of freeSlots) {
          const hasCollision = blockedIntervals.some(
            (b) => slot.startTime < b.end && slot.endTime > b.start
          );
          if (!hasCollision) {
            const slotDuration = calculateSlotDurationMinutes(slot.startTime, slot.endTime);
            if (slotDuration >= durationMinutes) {
              candidates.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
                durationMinutes: slotDuration,
                date,
                isoStart: `${date}T${slot.startTime}:00Z`,
                isoEnd: `${date}T${slot.endTime}:00Z`,
              });
            }
          }
        }

        if (candidates.length > 0) {
          return {
            found: true,
            matchedSlot: candidates[0],
            allAvailableSlots: candidates,
          };
        }

        return {
          found: false,
          message: `No free window of at least ${durationMinutes} minutes available on ${date} (${dayOfWeek}).`,
        };
      }

      case 'create_task': {
        const { facultyId, title, startTime, endTime, description } = args;

        const faculty = await prisma.faculty.findUnique({
          where: { id: facultyId },
        });

        if (!faculty) {
          return { error: `Faculty with ID '${facultyId}' not found.` };
        }

        const task = await prisma.task.create({
          data: {
            facultyId,
            title,
            description: description || null,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: 'PENDING',
          },
        });

        return {
          success: true,
          message: `Task "${task.title}" successfully scheduled from ${toHHmm(task.startTime)} to ${toHHmm(task.endTime)}.`,
          task: {
            id: task.id,
            title: task.title,
            startTime: task.startTime.toISOString(),
            endTime: task.endTime.toISOString(),
            status: task.status,
          },
        };
      }

      case 'update_task': {
        const { taskId, title, startTime, endTime, status, description } = args;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);

        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: updateData,
        });

        return {
          success: true,
          message: `Task "${updatedTask.title}" updated successfully.`,
          task: {
            id: updatedTask.id,
            title: updatedTask.title,
            status: updatedTask.status,
            startTime: updatedTask.startTime.toISOString(),
            endTime: updatedTask.endTime.toISOString(),
          },
        };
      }

      case 'delete_task': {
        const { taskId } = args;
        await prisma.task.delete({
          where: { id: taskId },
        });

        return {
          success: true,
          message: `Task ${taskId} was successfully deleted.`,
          deletedTaskId: taskId,
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error(`[AI Tools] Error executing tool ${name}:`, err);
    return { error: err.message || 'Error occurred while executing tool.' };
  }
}
