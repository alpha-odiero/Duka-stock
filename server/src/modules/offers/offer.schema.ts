import { z } from 'zod';

export const offerCreateSchema = z.object({
  name: z.string().trim().min(2, 'Offer name is required').max(100),
  description: z.string().trim().max(500).nullish(),
  imageUrl: z.string().url().nullish().or(z.literal('').transform(() => null)),
  imagePublicId: z.string().nullish(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  minimumPurchase: z.coerce.number().nonnegative().nullish(),
  maximumDiscount: z.coerce.number().nonnegative().nullish(),
  promoCode: z.string().trim().max(50).nullish(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'DISABLED']).optional(),
  visible: z.boolean().optional(),
  productIds: z.array(z.string().min(1)).nullish(),
  categoryIds: z.array(z.string().min(1)).nullish(),
});

export const offerUpdateSchema = offerCreateSchema.partial().refine((d) => Object.keys(d).length > 0, {
  message: 'No fields to update',
});

export const offerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.string().optional(),
});
