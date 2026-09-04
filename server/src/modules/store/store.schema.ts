import { z } from 'zod';

export const storeProductsQuerySchema = z.object({
  shop: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional().or(z.literal('')),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  curated: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});
