import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(100),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    shopName: z.string().trim().min(2, 'Shop name is required').max(100),
    shopLocation: z.string().trim().max(200).optional(),
  })
  .refine((d) => d.password.length >= 8, { path: ['password'], message: 'Password must be at least 8 characters' });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const shopSchema = z.object({
  name: z.string().trim().min(2, 'Shop name is required').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  currency: z.string().min(1, 'Select a currency'),
});

const positivePrice = z
  .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
  .refine((v) => Number(v) >= 0, 'Must be zero or more');

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(200),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  supplierId: z.string().uuid().optional().or(z.literal('')),
  sku: z.string().trim().max(50).optional().or(z.literal('')),
  barcode: z.string().trim().max(50).optional().or(z.literal('')),
  buyingPrice: positivePrice.refine((v) => Number(v) > 0, 'Buying price must be greater than zero'),
  sellingPrice: positivePrice.refine((v) => Number(v) > 0, 'Selling price must be greater than zero'),
  lowStockThreshold: z.coerce.number().int().min(0, 'Must be zero or more').default(5),
  unit: z.string().trim().max(20).default('piece'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name is required').max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const expenseSchema = z.object({
  category: z.string().min(1, 'Select a category'),
  description: z.string().trim().min(2, 'Description is required').max(500),
  amount: positivePrice.refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  expenseDate: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(50),
});

export const stockInSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be a positive whole number'),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});

export const stockOutSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be a positive whole number'),
  type: z.enum(['DAMAGE', 'EXPIRED', 'LOST', 'ADJUSTMENT']),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});
