/**
 * Task Controller
 *
 * Owned by: Agent 2
 */
export const taskController = {
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
      res.status(201).json({ id: 'task-stub', ...req.body, status: 'PENDING' });
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({ id, ...req.body });
    } catch (err) {
      next(err);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  }
};
