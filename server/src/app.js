import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import facultyRoutes from './routes/facultyRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './ai/routes.js';
import { applicationController } from './controllers/applicationController.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ScholarSync API', timestamp: new Date().toISOString() });
});

// Route Mounts
app.use('/api/faculty', facultyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/applications', applicationRoutes);
app.get('/api/mentorships', applicationController.mentorshipBoard);
app.use('/api/bookings', bookingRoutes);

// AI Router Mount (Agent 3 integration point)
app.use('/api/ai', aiRoutes);

// Centralized Error Handler (must be last)
app.use(errorHandler);

export default app;
