import { z } from 'zod';

export const openShiftSchema = z.object({
  registerId: z.string().uuid('Invalid register'),
  openingCash: z.number().min(0).default(0),
  notes: z.string().trim().max(500).optional(),
});

export const closeShiftSchema = z.object({
  actualCash: z.number().min(0),
  cashWithdrawals: z.number().min(0).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const approveShiftSchema = z.object({
  approved: z.boolean(),
  notes: z.string().trim().max(500).optional(),
});
