import { z } from 'zod';

export const integrationSchema = z.object({
  provider: z.enum(['MPESA', 'CLOUDINARY', 'EMAIL', 'SMS', 'SHIPPING', 'WEBSITE', 'ACCOUNTING', 'ANALYTICS', 'WEBHOOKS', 'OTHER']),
  label: z.string().trim().min(2).max(60),
  description: z.string().trim().max(200).nullish(),
  // Secret field — stored encrypted at rest, never returned verbatim.
  credential: z.string().nullish(),
  // Non-secret config (provider-specific, safe to display/send to frontend).
  config: z.record(z.string(), z.unknown()).nullish(),
});

export const integrationUpdateSchema = z
  .object({
    label: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(200).nullish().optional(),
    credential: z.string().nullish().optional(),
    config: z.record(z.string(), z.unknown()).nullish().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export const disconnectSchema = z.object({}).optional();
