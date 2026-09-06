import { z } from 'zod';

export const createTaskSchema = z
  .object({
    facultyId: z.string().min(1, 'facultyId is required'),
    title: z.string().min(1, 'title is required'),
    description: z.string().optional().nullable(),
    startTime: z.string().datetime({ offset: true, message: 'startTime must be a valid ISO 8601 datetime' }),
    endTime: z.string().datetime({ offset: true, message: 'endTime must be a valid ISO 8601 datetime' }),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'startTime must be before endTime',
    path: ['endTime'],
  });

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    startTime: z.string().datetime({ offset: true }).optional(),
    endTime: z.string().datetime({ offset: true }).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: 'startTime must be before endTime',
      path: ['endTime'],
    }
  );

export const createApplicationSchema = z.object({
  facultyId: z.string().min(1, 'facultyId is required'),
  studentName: z.string().min(1, 'studentName is required'),
  studentEmail: z.string().email('studentEmail must be a valid email'),
  studentContact: z.string().optional().nullable(),
  pitchText: z.string().min(5, 'pitchText must be at least 5 characters'),
});

export const decideApplicationSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const createBookingSchema = z
  .object({
    facultyId: z.string().min(1, 'facultyId is required'),
    studentName: z.string().min(1, 'studentName is required'),
    studentEmail: z.string().email('studentEmail must be a valid email'),
    slotStart: z.string().datetime({ offset: true, message: 'slotStart must be a valid ISO 8601 datetime' }),
    slotEnd: z.string().datetime({ offset: true, message: 'slotEnd must be a valid ISO 8601 datetime' }),
    isCustom: z.boolean().optional(),
  })
  .refine((data) => new Date(data.slotStart) < new Date(data.slotEnd), {
    message: 'slotStart must be before slotEnd',
    path: ['slotEnd'],
  });

export const decideBookingSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
