import { z } from 'zod';

const decimalString = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
  .refine((v) => Number(v) >= 0, 'Cost must be zero or more');

const positiveInt = z.number().int().min(0, 'Quantity must be zero or more');

export const bulkCreateBatchSchema = z.object({
  productId: z.string().uuid('Invalid product'),
  variantId: z.string().uuid('Invalid variant').optional().nullable(),
  batchNumber: z.string().trim().min(1).max(100),
  supplierId: z.string().uuid('Invalid supplier').optional().nullable(),
  purchaseId: z.string().uuid('Invalid purchase').optional().nullable(),
  manufacturingDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime(),
  quantity: positiveInt.refine((v) => v > 0, 'Quantity must be greater than zero'),
  costPerUnit: decimalString,
});

export const adjustBatchSchema = z.object({
  newQuantity: z.number().int().min(0, 'Quantity must be zero or more'),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});

export const batchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED']).optional(),
  search: z.string().trim().max(100).optional().or(z.literal('')),
});