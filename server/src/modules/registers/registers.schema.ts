import { z } from 'zod';
import { RegisterStatus } from '@prisma/client';

export const STATUS_VALUES = Object.values(RegisterStatus) as [string, ...string[]];
const statusSchema = z.enum(STATUS_VALUES as [RegisterStatus, ...RegisterStatus[]]);

export const createRegisterSchema = z.object({
  name: z.string().trim().min(1, 'Register name is required').max(100),
  status: statusSchema.optional(),
  assignedUserId: z.string().uuid('Invalid staff').optional().nullable(),
});

export const updateRegisterSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  status: statusSchema.optional(),
  assignedUserId: z.string().uuid('Invalid staff').optional().nullable(),
});

export type CreateRegisterInput = z.infer<typeof createRegisterSchema>;
export type UpdateRegisterInput = z.infer<typeof updateRegisterSchema>;
