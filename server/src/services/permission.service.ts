import { prisma } from '../lib/prisma';
import {
  LEGACY_SYSTEM_ROLE_PERMISSIONS,
  type ResolvedPermissions,
} from '../lib/permissions';

export interface LoadedUserPermissions {
  roleId: string | null;
  roleName: string | null;
}

// Default limits used for accounts that predate the roles system (no Role row
// assigned yet). These mirror the legacy system-role behaviour so existing
// owners/admins keep full control and cashiers keep restricted control.
function legacyLimits(role: string): ResolvedPermissions['limits'] {
  const owner = role === 'OWNER' || role === 'ADMIN';
  if (owner) {
    return {
      maxDiscountPercent: null,
      allowUnlimitedDiscount: true,
      refundApprovalRequired: false,
      maxRefundAmount: null,
      canApproveRefund: true,
      canOverridePrice: true,
      canChangePrice: true,
    };
  }
  if (role === 'MANAGER') {
    return {
      maxDiscountPercent: 20,
      allowUnlimitedDiscount: false,
      refundApprovalRequired: false,
      maxRefundAmount: 10000,
      canApproveRefund: true,
      canOverridePrice: true,
      canChangePrice: false,
    };
  }
  return {
    maxDiscountPercent: 5,
    allowUnlimitedDiscount: false,
    refundApprovalRequired: false,
    maxRefundAmount: null,
    canApproveRefund: false,
    canOverridePrice: false,
    canChangePrice: false,
  };
}

// Resolve a user's effective permission set from their DB role + any per-user
// overrides. Returns a Set of permission keys plus their role limits.
//
// Backward compatibility: accounts created before the roles migration have no
// RoleId. For those we fall back to the legacy system-role permissions derived
// from their enum role so existing staff keep working while new accounts use
// the DB-driven roles.
export async function resolveUserPermissions(
  userId: string,
): Promise<{ permissions: Set<string>; info: ResolvedPermissions }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      roleId: true,
      roleRef: { select: { id: true, name: true, permissions: { select: { permission: { select: { key: true } } } }, limits: true } },
      permissionOverrides: { select: { granted: true, permission: { select: { key: true } } } },
    },
  });

  if (!user) {
    return { permissions: new Set<string>(), info: { permissions: new Set(), limits: null, roleId: null, roleName: null } };
  }

  const permissions = new Set<string>();

  // 1) Permissions from the assigned DB role, or the legacy fallback.
  if (user.roleRef?.permissions) {
    for (const rp of user.roleRef.permissions) {
      if (rp.permission) permissions.add(rp.permission.key);
    }
  } else {
    const legacyKeys = LEGACY_SYSTEM_ROLE_PERMISSIONS[user.role] ?? [];
    for (const key of legacyKeys) permissions.add(key);
  }

  // 2) Apply per-user overrides (grants add, explicit denies remove).
  for (const ov of user.permissionOverrides ?? []) {
    const key = ov.permission?.key;
    if (!key) continue;
    if (ov.granted) {
      permissions.add(key);
    } else {
      permissions.delete(key);
    }
  }

  // 3) Limits from the DB role, or the legacy defaults.
  let limits: ResolvedPermissions['limits'] = null;
  if (user.roleRef?.limits) {
    limits = {
      maxDiscountPercent: user.roleRef.limits.maxDiscountPercent != null ? Number(user.roleRef.limits.maxDiscountPercent) : null,
      allowUnlimitedDiscount: user.roleRef.limits.allowUnlimitedDiscount,
      refundApprovalRequired: user.roleRef.limits.refundApprovalRequired,
      maxRefundAmount: user.roleRef.limits.maxRefundAmount != null ? Number(user.roleRef.limits.maxRefundAmount) : null,
      canApproveRefund: user.roleRef.limits.canApproveRefund,
      canOverridePrice: user.roleRef.limits.canOverridePrice,
      canChangePrice: user.roleRef.limits.canChangePrice,
    };
  } else if (!user.roleId) {
    limits = legacyLimits(user.role);
  }

  return {
    permissions,
    info: {
      permissions,
      limits,
      roleId: user.roleId ?? null,
      roleName: user.roleRef?.name ?? null,
    },
  };
}
