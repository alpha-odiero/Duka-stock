import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  period: z.enum(['today', 'yesterday', 'week', 'month', 'all']).optional(),
});

export const salesReportSchema = dateRangeSchema.extend({
  source: z.enum(['POS', 'ONLINE']).optional(),
  paymentMethod: z.enum(['CASH', 'MPESA', 'CARD', 'OTHER']).optional(),
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});
