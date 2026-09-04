import { z } from 'zod';

export const shopUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  businessPin: z.string().trim().max(50).optional().or(z.literal('')),
  website: z.string().trim().max(200).optional().or(z.literal('')),
  logo: z.string().trim().url('Logo must be a valid URL').optional().or(z.literal('')),
  currency: z.enum(['KES', 'USD', 'UGX', 'TZS', 'RWF']).optional(),
  timezone: z.string().trim().max(100).optional().or(z.literal('')),
  registerName: z.string().trim().max(100).optional().or(z.literal('')),
  receiptFooter: z.string().trim().max(500).optional().or(z.literal('')),
});
