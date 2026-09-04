import { z } from 'zod';

export const returnItemSchema = z.object({
  saleItemId: z.string().uuid('Invalid sale item'),
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
  condition: z.enum(['MINT', 'GOOD', 'FAIR', 'DAMAGED']).optional().default('GOOD'),
});

export const createReturnSchema = z.object({
  saleId: z.string().uuid('Invalid sale'),
  items: z.array(returnItemSchema).min(1, 'Add at least one item to return'),
  refundMethod: z
    .enum(['ORIGINAL', 'CASH', 'MPESA', 'CARD', 'BANK', 'STORE_CREDIT'])
    .optional()
    .default('ORIGINAL'),
  registerId: z.string().uuid('Invalid register').optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const approveReturnSchema = z.object({
  approved: z.boolean(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const returnQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;