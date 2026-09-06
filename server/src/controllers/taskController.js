import prisma from '../config/prisma.js';

/**
 * Task Controller
 * Owned by: Agent 2
 */
export const taskController = {
  /**
   * GET /api/tasks?facultyId=
   * List tasks for a faculty member
   */
  list: async (req, res, next) => {
    try {
      const { facultyId } = req.query;

      const where = {};
      if (facultyId) {
        where.facultyId = facultyId;
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: {
          faculty: {
            select: { id: true, name: true },
          },
        },
      });

      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tasks
   * Create a new task
   */
  create: async (req, res, next) => {
    try {
      const { facultyId, title, description, startTime, endTime, status } = req.body;

      // Verify faculty exists
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return res.status(404).json({ error: `Faculty with ID '${facultyId}' not found` });
      }

      const newTask = await prisma.task.create({
        data: {
          facultyId,
          title: title.trim(),
          description: description?.trim() || null,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: status || 'PENDING',
        },
      });

      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/tasks/:id
   * Update an existing task
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, startTime, endTime, status } = req.body;

      const existing = await prisma.task.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: `Task with ID '${id}' not found` });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description ? description.trim() : null;
      if (startTime !== undefined) updateData.startTime = new Date(startTime);
      if (endTime !== undefined) updateData.endTime = new Date(endTime);
      if (status !== undefined) updateData.status = status;

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
      });

      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;

      const existing = await prisma.task.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: `Task with ID '${id}' not found` });
      }

      await prisma.task.delete({
        where: { id },
      });

      res.json({ success: true, id, message: 'Task deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
