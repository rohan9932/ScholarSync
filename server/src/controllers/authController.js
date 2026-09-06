import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateToken } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user (Teacher or Student)
   */
  register: async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.format(),
        });
      }

      const { email, password, name, role, facultyId } = parsed.data;

      // 1. Check if user email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }

      // 2. If Teacher, validate facultyId if provided
      if (role === 'TEACHER' && facultyId) {
        const faculty = await prisma.faculty.findUnique({
          where: { id: facultyId },
          include: { user: true },
        });

        if (!faculty) {
          return res.status(404).json({ error: `Faculty with ID '${facultyId}' does not exist.` });
        }

        if (faculty.user) {
          return res.status(409).json({
            error: `Faculty profile '${faculty.name}' is already linked to another user account.`,
          });
        }
      }

      // 3. Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // 4. Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: name.trim(),
          role,
          facultyId: role === 'TEACHER' ? facultyId || null : null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          facultyId: true,
          faculty: {
            select: {
              id: true,
              name: true,
              designation: true,
              email: true,
            },
          },
        },
      });

      // 5. Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Authenticate user with email and password
   */
  login: async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.format(),
        });
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
              designation: true,
              email: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        facultyId: user.facultyId,
        faculty: user.faculty,
      };

      const token = generateToken(userPayload);

      res.json({
        message: 'Login successful',
        token,
        user: userPayload,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Get currently authenticated user profile
   */
  me: async (req, res, next) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  },
};
