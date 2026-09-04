import { z } from 'zod';

const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const emailSchema = z.string().trim().toLowerCase().email('Please enter a valid email');
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{7,20}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100);

export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  shopName: z.string().trim().min(2, 'Shop name is required').max(100),
  shopLocation: z.string().trim().min(2, 'Shop location is required').max(200).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
