import { z } from 'zod';

const decimalString = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
  .refine((v) => Number(v) >= 0, 'Price must be zero or more');

const positiveInt = z.number().int().min(0, 'Quantity must be zero or more');

export const variantInputSchema = z.object({
  name: z.string().trim().min(1, 'Variant name is required').max(200),
  sku: z.string().trim().max(50).optional().or(z.literal('')),
  barcode: z.string().trim().max(50).optional().or(z.literal('')),
  buyingPrice: decimalString.optional(),
  sellingPrice: decimalString.optional(),
  quantity: positiveInt.optional().default(0),
  lowStockThreshold: positiveInt.optional().default(5),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(200),
  categoryId: z.string().uuid('Invalid category').optional().nullable(),
  supplierId: z.string().uuid('Invalid supplier').optional().nullable(),
  taxRateId: z.string().uuid('Invalid tax rate').optional().nullable(),
  sku: z.string().trim().max(50).optional().or(z.literal('')),
  barcode: z.string().trim().max(50).optional().or(z.literal('')),
  buyingPrice: decimalString,
  sellingPrice: decimalString,
  quantity: positiveInt.default(0),
  lowStockThreshold: positiveInt.default(5),
  unit: z.string().trim().max(20).default('piece'),
  imageUrl: z.string().trim().url('Invalid image URL').optional().or(z.literal('')),
  cloudinaryPublicId: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  variants: z.array(variantInputSchema).max(50).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.enum(['low', 'out', 'in_stock']).optional(),
  sort: z
    .enum([
      'name_asc',
      'name_desc',
      'price_asc',
      'price_desc',
      'quantity_asc',
      'quantity_desc',
      'created_desc',
    ])
    .default('created_desc'),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
