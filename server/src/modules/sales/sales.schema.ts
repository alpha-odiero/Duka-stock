import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().uuid('Invalid product'),
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
  variantId: z.string().uuid('Invalid variant').optional().nullable(),
  batchId: z.string().uuid('Invalid batch').optional().nullable(),
});

export const salePaymentSchema = z.object({
  method: z.enum(['CASH', 'MPESA', 'CARD', 'BANK', 'CREDIT', 'OTHER']),
  amount: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/)]),
  reference: z.string().trim().max(100).optional().nullable(),
});

export const createSaleSchema = z
  .object({
    items: z.array(saleItemSchema).min(1, 'Add at least one item to the sale'),
    paymentMethod: z.enum(['CASH', 'MPESA', 'CARD', 'BANK', 'CREDIT', 'OTHER']).default('CASH'),
    // Split payments: one entry per payment instrument. When present, the sum
    // must cover the sale total (excess is returned as change).
    payments: z.array(salePaymentSchema).max(5, 'At most 5 payment methods per sale').optional().nullable(),
    source: z.enum(['POS', 'ONLINE']).default('POS'),
    customerId: z.string().uuid('Invalid customer').optional().nullable(),
    // Fixed discount amount in shop currency, OR a percentage discount.
    discount: z
      .union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d{1,2})?$/)])
      .optional()
      .nullable(),
    discountPercent: z.number().min(0).max(100).optional().nullable(),
    // Payment / receipt details. amountPaid is optional; when provided (usually
    // for cash), the server computes the change due. paymentReference holds e.g.
    // an M-Pesa transaction code. registerId must belong to the shop and is
    // validated server-side (never trusting the frontend).
    paymentReference: z.string().trim().max(100).optional().nullable(),
    amountPaid: z
      .union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d{1,2})?$/)])
      .optional()
      .nullable(),
    registerId: z.string().uuid('Invalid register').optional().nullable(),
  })
  .refine((v) => !(v.discount && v.discountPercent), {
    message: 'Provide either a fixed discount or a percentage, not both',
    path: ['discount'],
  });

export const saleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  paymentMethod: z.enum(['CASH', 'MPESA', 'CARD', 'OTHER']).optional(),
  source: z.enum(['POS', 'ONLINE']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  period: z.enum(['today', 'yesterday', 'week', 'month', 'all']).optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
