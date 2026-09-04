import { z } from 'zod';

export const supplierCreateSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name is required').max(200),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email('Invalid email').optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();
