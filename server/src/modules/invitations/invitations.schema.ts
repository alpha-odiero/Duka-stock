import { z } from 'zod';

const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const emailSchema = z.string().trim().toLowerCase().email('Please enter a valid email');

export const createInvitationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  roleId: z.string().uuid('Invalid role'),
});

export const acceptInvitationSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(1),
  fullName: z.string().trim().min(2).max(100).optional(),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
