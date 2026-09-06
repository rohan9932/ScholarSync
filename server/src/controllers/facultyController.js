import prisma from '../config/prisma.js';

const DAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_ORDER = { SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7 };

/**
 * Faculty Controller
 * Owned by: Agent 2
 */
export const facultyController = {
  /**
   * GET /api/faculty
   * List all faculty members
   */
  list: async (req, res, next) => {
    try {
      const faculties = await prisma.faculty.findMany({
        select: {
          id: true,
          name: true,
          designation: true,
          email: true,
          profileUrl: true,
          researchInterests: true,
        },
        orderBy: { id: 'asc' },
      });

      res.json(faculties);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/faculty/:id
   * Get single faculty profile with research interests
   */
  getOne: async (req, res, next) => {
    try {
      const { id } = req.params;
      const faculty = await prisma.faculty.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          designation: true,
          email: true,
          profileUrl: true,
          researchInterests: true,
        },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${id}' not found` });
      }

      res.json(faculty);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/faculty/:id/schedule
   * Get all schedule slots for a faculty member sorted by day and time
   */
  getSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;

      const faculty = await prisma.faculty.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${id}' not found` });
      }

      const rawSlots = await prisma.scheduleSlot.findMany({
        where: { facultyId: id },
      });

      // Sort slots by Day (SUN -> THU) then by startTime
      const sortedSlots = rawSlots.sort((a, b) => {
        const dayDiff = (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });

      res.json({
        facultyId: id,
        facultyName: faculty.name,
        totalSlots: sortedSlots.length,
        hasSchedule: sortedSlots.length > 0,
        slots: sortedSlots,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/faculty/:id/free-slots?date=YYYY-MM-DD
   * Computed free windows for a given date (derives from seeded FREE slots, filtered by overlapping tasks and bookings)
   */
  getFreeSlots: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          error: "A valid 'date' query parameter in YYYY-MM-DD format is required (e.g. ?date=2026-09-06)",
        });
      }

      const faculty = await prisma.faculty.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${id}' not found` });
      }

      // Check if faculty has ANY schedule data (34 of 64 faculty have no schedule on file)
      const slotCount = await prisma.scheduleSlot.count({
        where: { facultyId: id },
      });

      if (slotCount === 0) {
        return res.json({
          facultyId: id,
          facultyName: faculty.name,
          date,
          hasSchedule: false,
          isWeekend: false,
          message: 'Schedule not available on file for this faculty member',
          freeSlots: [],
        });
      }

      // Parse date and day of week
      const [yearStr, monthStr, dayStr] = date.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const dayNum = parseInt(dayStr, 10);
      const targetDate = new Date(Date.UTC(year, month, dayNum));

      const dayOfWeek = DAY_MAP[targetDate.getUTCDay()];

      // Weekend handling: Bangladesh academic week has no classes on FRI and SAT
      if (dayOfWeek === 'FRI' || dayOfWeek === 'SAT') {
        return res.json({
          facultyId: id,
          facultyName: faculty.name,
          date,
          day: dayOfWeek,
          hasSchedule: true,
          isWeekend: true,
          message: 'No class-day schedule on Friday/Saturday (Bangladesh academic weekend)',
          freeSlots: [],
        });
      }

      // 1. Fetch seeded FREE slots for this faculty on this day
      const seededFreeSlots = await prisma.scheduleSlot.findMany({
        where: {
          facultyId: id,
          day: dayOfWeek,
          type: 'FREE',
        },
        orderBy: { startTime: 'asc' },
      });

      // 2. Fetch any Tasks for this faculty on this date
      const startOfDay = new Date(Date.UTC(year, month, dayNum, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, dayNum, 23, 59, 59, 999));

      const tasks = await prisma.task.findMany({
        where: {
          facultyId: id,
          status: { not: 'CANCELLED' },
          startTime: { lte: endOfDay },
          endTime: { gte: startOfDay },
        },
      });

      // 3. Fetch any APPROVED Bookings for this faculty on this date
      const bookings = await prisma.booking.findMany({
        where: {
          facultyId: id,
          status: 'APPROVED',
          slotStart: { lte: endOfDay },
          slotEnd: { gte: startOfDay },
        },
      });

      // Helper to convert Date to "HH:mm" in UTC
      const toHHmm = (d) => {
        const hours = d.getUTCHours().toString().padStart(2, '0');
        const mins = d.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
      };

      // Blocked intervals on this date
      const blockedIntervals = [
        ...tasks.map((t) => ({
          start: toHHmm(t.startTime),
          end: toHHmm(t.endTime),
          source: 'task',
          title: t.title,
        })),
        ...bookings.map((b) => ({
          start: toHHmm(b.slotStart),
          end: toHHmm(b.slotEnd),
          source: 'booking',
          title: `Booking with ${b.studentName}`,
        })),
      ];

      // Filter seeded free slots that do not collide with any task or booking
      const availableFreeSlots = seededFreeSlots
        .filter((slot) => {
          const hasCollision = blockedIntervals.some((block) => {
            // Overlap condition: slot.startTime < block.end && slot.endTime > block.start
            return slot.startTime < block.end && slot.endTime > block.start;
          });
          return !hasCollision;
        })
        .map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          day: s.day,
        }));

      res.json({
        facultyId: id,
        facultyName: faculty.name,
        date,
        day: dayOfWeek,
        hasSchedule: true,
        isWeekend: false,
        totalAvailable: availableFreeSlots.length,
        freeSlots: availableFreeSlots,
      });
    } catch (err) {
      next(err);
    }
  },
};
