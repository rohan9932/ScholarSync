import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['TEACHER', 'STUDENT'], {
    errorMap: () => ({ message: "Role must be either 'TEACHER' or 'STUDENT'" }),
  }),
  facultyId: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
