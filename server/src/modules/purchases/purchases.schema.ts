import { z } from 'zod';

export const purchaseItemSchema = z.object({
  productId: z.string().uuid('Invalid product'),
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
  unitCost: z
    .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
    .refine((v) => Number(v) >= 0, 'Unit cost must be zero or more'),
  variantId: z.string().uuid('Invalid variant').optional().nullable(),
  // When provided, the received stock is batched with an expiry date.
  batchNumber: z.string().trim().max(100).optional().or(z.literal('')),
  expiryDate: z.string().datetime().optional().nullable(),
  manufacturingDate: z.string().datetime().optional().nullable(),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier').optional().nullable(),
  purchaseDate: z.string().optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});

export const purchaseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  supplierId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
