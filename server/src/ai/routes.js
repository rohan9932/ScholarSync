import { Router } from 'express';
import { processChatMessage } from './chatAgent.js';
import { getEmbedding } from '../services/embeddings.js';

const router = Router();

/**
 * POST /api/ai/chat
 * Conversational scheduling assistant endpoint
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, facultyId, currentDate, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Field "message" is required and cannot be empty.' });
    }

    const response = await processChatMessage({
      message: message.trim(),
      facultyId: facultyId || undefined,
      currentDate: currentDate || undefined,
      history: Array.isArray(history) ? history : [],
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/embed-test
 * Debug & verification endpoint for vector embeddings
 */
router.post('/embed-test', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Field "text" is required and must be a string.' });
    }

    const embedding = await getEmbedding(text);

    res.json({
      success: true,
      text,
      dimensions: embedding.length,
      preview: embedding.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
