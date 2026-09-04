import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const ROLE_VALUES = Object.values(UserRole) as [string, ...string[]];
export const STATUS_VALUES = Object.values(UserStatus) as [string, ...string[]];

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

const roleSchema = z.enum(ROLE_VALUES as [UserRole, ...UserRole[]]);
const statusSchema = z.enum(STATUS_VALUES as [UserStatus, ...UserStatus[]]);

export const createStaffSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    userName: z.string().trim().max(50).optional().or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
    role: roleSchema.optional(),
    roleId: z.string().uuid('Invalid role').optional().nullable(),
    status: statusSchema.optional(),
    registerId: z.string().uuid('Invalid register').optional().nullable(),
    invite: z.boolean().optional(),
    avatar: z.string().trim().url('Avatar must be a valid URL').optional().nullable().or(z.literal('')),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateStaffSchema = z.object({
  fullName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  userName: z.string().trim().max(50).optional().nullable(),
  role: roleSchema.optional(),
  roleId: z.string().uuid('Invalid role').optional().nullable(),
  status: statusSchema.optional(),
  registerId: z.string().uuid('Invalid register').optional().nullable(),
  avatar: z.string().trim().url('Avatar must be a valid URL').optional().nullable(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const staffQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const staffSalesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PAID', 'PENDING', 'PARTIALLY_PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOID', 'CANCELLED'])
    .optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
