import { Prisma } from '@prisma/client';

/**
 * Centralized Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Resource not found',
        details: err.meta?.cause || 'The requested record does not exist.',
      });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict: Unique constraint violation',
        details: `Field ${(err.meta?.target || []).join(', ')} already exists.`,
      });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Foreign key constraint failed',
        details: err.meta?.field_name || 'Referenced resource does not exist.',
      });
    }
  }

  // Handle Prisma Validation Errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Database validation error',
      details: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
