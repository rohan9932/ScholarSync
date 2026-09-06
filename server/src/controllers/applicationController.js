import { evaluateApplication } from '../ai/matching.js';

/**
 * Application Controller
 *
 * Owned by: Agent 2
 */
export const applicationController = {
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
      const applicationId = 'app-stub-' + Date.now();
      // Contract: evaluateApplication called asynchronously (unawaited or queued)
      evaluateApplication(applicationId).catch((err) =>
        console.error('[Application Evaluation Error]', err)
      );

      // Return 202 Accepted immediately as per contract §2.2
      res.status(202).json({
        id: applicationId,
        status: 'PENDING',
        matchScore: null,
        message: 'Application received. Scoring in progress.'
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
  },
  mentorshipBoard: async (req, res, next) => {
    try {
      const { facultyId } = req.query;
      res.json([]);
    } catch (err) {
      next(err);
    }
  }
};
