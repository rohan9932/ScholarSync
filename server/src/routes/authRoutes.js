import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

export default router;
