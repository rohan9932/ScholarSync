import prisma from '../config/prisma.js';

/**
 * Booking Controller
 * Owned by: Agent 2
 */
export const bookingController = {
  /**
   * GET /api/bookings?facultyId=
   * List bookings for a faculty member
   */
  list: async (req, res, next) => {
    try {
      const { facultyId } = req.query;

      const where = {};
      if (facultyId) {
        where.facultyId = facultyId;
      }

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: { slotStart: 'asc' },
        include: {
          faculty: {
            select: { id: true, name: true, designation: true },
          },
        },
      });

      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/bookings
   * Student requests a slot (matches a free_slot or flags isCustom)
   */
  create: async (req, res, next) => {
    try {
      const { facultyId, studentName, studentEmail, slotStart, slotEnd, isCustom } = req.body;

      // Verify faculty exists
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${facultyId}' not found` });
      }

      const booking = await prisma.booking.create({
        data: {
          facultyId,
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim().toLowerCase(),
          slotStart: new Date(slotStart),
          slotEnd: new Date(slotEnd),
          isCustom: Boolean(isCustom),
          status: 'PENDING',
        },
      });

      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/bookings/:id
   * Faculty approves or rejects a booking request
   */
  decide: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: "Status must be either 'APPROVED' or 'REJECTED'" });
      }

      const existing = await prisma.booking.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: `Booking with ID '${id}' not found` });
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          faculty: {
            select: { id: true, name: true },
          },
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
