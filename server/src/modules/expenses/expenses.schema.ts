import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'RENT',
  'ELECTRICITY',
  'TRANSPORT',
  'INTERNET',
  'SALARIES',
  'PACKAGING',
  'REPAIRS',
  'OTHER',
] as const;

export const expenseCreateSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().trim().min(2, 'Description is required').max(500),
  amount: z
    .union([z.string().regex(/^\d+(\.\d{1,2})?$/), z.number()])
    .refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  expenseDate: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
