import { z } from 'zod';

export const stockInSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});

export const stockOutSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
  type: z.enum(['DAMAGE', 'EXPIRED', 'LOST', 'ADJUSTMENT']).default('ADJUSTMENT'),
});
