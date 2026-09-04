import { z } from 'zod';

const decimalString = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
  .refine((v) => Number(v) >= 0, 'Price must be zero or more');

const positiveInt = z.number().int().min(0, 'Quantity must be zero or more');

export const variantCreateSchema = z.object({
  name: z.string().trim().min(1, 'Variant name is required').max(200),
  sku: z.string().trim().max(50).optional().or(z.literal('')),
  barcode: z.string().trim().max(50).optional().or(z.literal('')),
  buyingPrice: decimalString,
  sellingPrice: decimalString,
  quantity: positiveInt.optional().default(0),
  lowStockThreshold: positiveInt.optional().default(5),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
});

export const variantUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  sku: z.string().trim().max(50).optional().or(z.literal('')),
  barcode: z.string().trim().max(50).optional().or(z.literal('')),
  buyingPrice: decimalString.optional(),
  sellingPrice: decimalString.optional(),
  lowStockThreshold: positiveInt.optional(),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const variantQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  productId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional().or(z.literal('')),
});