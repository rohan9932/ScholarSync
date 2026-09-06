/**
 * Booking Controller
 *
 * Owned by: Agent 2
 */
export const bookingController = {
  list: async (req, res, next) => {
    try {
      const { facultyId } = req.query;
      res.json([]);
    } catch (err) {
      next(err);
    }
  },
  create: async (req, res, next) => {
    try {
      res.status(201).json({
        id: 'booking-stub-' + Date.now(),
        ...req.body,
        status: 'PENDING'
      });
    } catch (err) {
      next(err);
    }
  },
  decide: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      res.json({ id, status });
    } catch (err) {
      next(err);
    }
  }
};
