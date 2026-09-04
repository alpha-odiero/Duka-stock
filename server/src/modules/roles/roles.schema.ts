import { z } from 'zod';

const nameSchema = z.string().trim().min(2, 'Role name must be at least 2 characters').max(100);

export const createRoleSchema = z.object({
  name: nameSchema,
  description: z.string().trim().max(500).optional().nullable(),
  permissions: z.array(z.string()).max(300).optional(),
  limits: z
    .object({
      maxDiscountPercent: z.number().min(0).max(100).optional().nullable(),
      allowUnlimitedDiscount: z.boolean().optional(),
      refundApprovalRequired: z.boolean().optional(),
      maxRefundAmount: z.number().min(0).optional().nullable(),
      canApproveRefund: z.boolean().optional(),
      canOverridePrice: z.boolean().optional(),
      canChangePrice: z.boolean().optional(),
    })
    .optional(),
});

export const updateRoleSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  permissions: z.array(z.string()).max(300).optional(),
  limits: z
    .object({
      maxDiscountPercent: z.number().min(0).max(100).optional().nullable(),
      allowUnlimitedDiscount: z.boolean().optional(),
      refundApprovalRequired: z.boolean().optional(),
      maxRefundAmount: z.number().min(0).optional().nullable(),
      canApproveRefund: z.boolean().optional(),
      canOverridePrice: z.boolean().optional(),
      canChangePrice: z.boolean().optional(),
    })
    .optional(),
});

export const createOverrideSchema = z.object({
  permissionKey: z.string(),
  granted: z.boolean().optional().default(true),
  // optional: replace all overrides for the staff member with this list
  permissions: z.array(z.string()).optional(),
});

export const setOverridesSchema = z.object({
  granted: z.array(z.string()).max(300).optional(),
  denied: z.array(z.string()).max(300).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type SetOverridesInput = z.infer<typeof setOverridesSchema>;
