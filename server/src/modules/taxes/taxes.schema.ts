import { z } from 'zod';

const decimalString = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
  .refine((v) => Number(v) >= 0, 'Rate must be zero or more');

export const taxRateCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  rate: decimalString.refine((v) => Number(v) <= 100, 'Rate cannot exceed 100'),
  type: z.enum(['INCLUSIVE', 'EXCLUSIVE']).default('EXCLUSIVE'),
  category: z.enum(['TAXABLE', 'TAX_EXEMPT', 'ZERO_RATED', 'STANDARD']).default('TAXABLE'),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

export const taxRateUpdateSchema = taxRateCreateSchema.partial();