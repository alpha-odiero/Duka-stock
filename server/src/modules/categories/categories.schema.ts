import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(50),
  description: z.string().trim().max(300).nullish(),
  imageUrl: z.string().url().nullish().or(z.literal('').transform(() => null)),
  imagePublicId: z.string().nullish(),
  displayOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    description: z.string().trim().max(300).nullish(),
    imageUrl: z.string().url().nullish().or(z.literal('').transform(() => null)),
    imagePublicId: z.string().nullish(),
    displayOrder: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export const categoryReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
