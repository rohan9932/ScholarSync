import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'scholarsync-super-secret-jwt-token-key-2026';

/**
 * Authentication Middleware
 * Validates the Bearer JWT token from the Authorization header
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control Middleware
 *
 * @param  {...string} allowedRoles - e.g. 'TEACHER', 'STUDENT'
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to ${allowedRoles.join(' or ')} accounts.`,
      });
    }

    next();
  };
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      facultyId: user.facultyId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
