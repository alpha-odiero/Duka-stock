import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product'),
  quantity: z.number().int().positive('Quantity must be a positive whole number'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Add at least one item to the order'),
  paymentMethod: z.enum(['CASH', 'MPESA', 'CARD', 'OTHER']).default('MPESA'),
  source: z.enum(['POS', 'ONLINE']).default('ONLINE'),
  customerId: z.string().uuid('Invalid customer').optional().nullable(),
  customer: z
    .object({
      name: z.string().trim().max(200).optional(),
      phone: z.string().trim().max(30).optional(),
      email: z.string().email('Invalid email').optional().or(z.literal('')),
      address: z.string().trim().max(500).optional(),
    })
    .optional(),
  deliveryAddress: z.string().trim().max(500).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  discount: z
    .union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d{1,2})?$/)])
    .optional()
    .nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  source: z.enum(['POS', 'ONLINE']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().trim().max(100).optional().or(z.literal('')),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
