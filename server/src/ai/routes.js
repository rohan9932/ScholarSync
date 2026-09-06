import { Router } from 'express';
import { processChatMessage } from './chatAgent.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, facultyId, currentDate, history } = req.body;
    const response = await processChatMessage({ message, facultyId, currentDate, history });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/embed-test (Debug endpoint)
router.post('/embed-test', async (req, res, next) => {
  try {
    const { text } = req.body;
    res.json({ message: 'Embedding debug endpoint stub', text });
  } catch (error) {
    next(error);
  }
});

export default router;
