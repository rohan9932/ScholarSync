/**
 * Faculty Controller
 *
 * Owned by: Agent 2
 */
export const facultyController = {
  list: async (req, res, next) => {
    try {
      res.json([]);
    } catch (err) {
      next(err);
    }
  },
  getOne: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({ id, message: 'Faculty profile stub' });
    } catch (err) {
      next(err);
    }
  },
  getSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({ facultyId: id, slots: [] });
    } catch (err) {
      next(err);
    }
  },
  getFreeSlots: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date } = req.query;
      res.json({ facultyId: id, date, freeSlots: [] });
    } catch (err) {
      next(err);
    }
  }
};
