import { prisma } from '../../lib/prisma';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../lib/errors';
import { PERMISSIONS, LEGACY_SYSTEM_ROLE_PERMISSIONS } from '../../lib/permissions';

// Serialize a role with its permissions and limits for API responses.
export function serializeRole(role: {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isDefault: boolean;
  isProtected: boolean;
  permissions?: { permission: { key: string; group: string } }[];
  limits?: {
    maxDiscountPercent: any;
    allowUnlimitedDiscount: boolean;
    refundApprovalRequired: boolean;
    maxRefundAmount: any;
    canApproveRefund: boolean;
    canOverridePrice: boolean;
    canChangePrice: boolean;
  } | null;
  _count?: { users: number };
}) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    type: role.type,
    isDefault: role.isDefault,
    isProtected: role.isProtected,
    permissions: (role.permissions ?? []).map((p) => p.permission.key),
    permissionGroups: (role.permissions ?? []).map((p) => p.permission.group),
    limits: role.limits
      ? {
          maxDiscountPercent: role.limits.maxDiscountPercent != null ? Number(role.limits.maxDiscountPercent) : null,
          allowUnlimitedDiscount: role.limits.allowUnlimitedDiscount,
          refundApprovalRequired: role.limits.refundApprovalRequired,
          maxRefundAmount: role.limits.maxRefundAmount != null ? Number(role.limits.maxRefundAmount) : null,
          canApproveRefund: role.limits.canApproveRefund,
          canOverridePrice: role.limits.canOverridePrice,
          canChangePrice: role.limits.canChangePrice,
        }
      : null,
    staffCount: role._count?.users ?? 0,
  };
}

export async function listRoles(shopId: string) {
  const roles = await prisma.role.findMany({
    where: { shopId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    include: {
      permissions: { include: { permission: { select: { key: true, group: true } } } },
      limits: true,
      _count: { select: { users: true } },
    },
  });
  return roles.map(serializeRole);
}

export async function getRole(shopId: string, roleId: string) {
  const role = await prisma.role.findFirst({
    where: { id: roleId, shopId },
    include: {
      permissions: { include: { permission: { select: { key: true, group: true } } } },
      limits: true,
      _count: { select: { users: true } },
    },
  });
  if (!role) throw new NotFoundError('Role not found');
  return serializeRole(role);
}

// Resolve permission ids from keys, validating against the global catalog.
async function permissionIdsFromKeys(keys: string[]) {
  if (!keys || keys.length === 0) return [];
  const found = await prisma.permission.findMany({
    where: { key: { in: keys } },
    select: { id: true, key: true },
  });
  const map = new Map(found.map((p) => [p.key, p.id]));
  const ids: string[] = [];
  for (const k of keys) {
    const id = map.get(k);
    if (!id) throw new ValidationError(`Unknown permission: ${k}`);
    ids.push(id);
  }
  return ids;
}

export async function createRole(
  shopId: string,
  input: { name: string; description?: string | null; permissions?: string[]; limits?: any },
) {
  const existing = await prisma.role.findFirst({ where: { shopId, name: input.name } });
  if (existing) throw new ConflictError('A role with this name already exists in this business');

  const permIds = await permissionIdsFromKeys(input.permissions ?? []);

  const role = await prisma.role.create({
    data: {
      shopId,
      name: input.name,
      description: input.description ?? null,
      type: 'CUSTOM',
      permissions: { create: permIds.map((permissionId) => ({ permissionId })) },
      limits: input.limits
        ? {
            create: {
              maxDiscountPercent: input.limits.maxDiscountPercent ?? undefined,
              allowUnlimitedDiscount: input.limits.allowUnlimitedDiscount ?? false,
              refundApprovalRequired: input.limits.refundApprovalRequired ?? false,
              maxRefundAmount: input.limits.maxRefundAmount ?? undefined,
              canApproveRefund: input.limits.canApproveRefund ?? false,
              canOverridePrice: input.limits.canOverridePrice ?? false,
              canChangePrice: input.limits.canChangePrice ?? false,
            },
          }
        : undefined,
    },
    include: {
      permissions: { include: { permission: { select: { key: true, group: true } } } },
      limits: true,
      _count: { select: { users: true } },
    },
  });

  return serializeRole(role);
}

export async function updateRole(
  shopId: string,
  roleId: string,
  input: { name?: string; description?: string | null; permissions?: string[]; limits?: any },
) {
  const role = await prisma.role.findFirst({ where: { id: roleId, shopId }, include: { _count: { select: { users: true } } } });
  if (!role) throw new NotFoundError('Role not found');

  // A protected role (Owner) cannot have its access reduced below dangerous
  // levels. Owner keeps all permissions. Guard edits accordingly.
  if (input.permissions && role.isProtected) {
    const keys = new Set(input.permissions);
    // Owner must always retain staff management + settings + roles management.
    const critical = [
      PERMISSIONS.STAFF_VIEW,
      PERMISSIONS.STAFF_EDIT,
      PERMISSIONS.STAFF_DEACTIVATE,
      PERMISSIONS.MANAGER_ROLES,
      PERMISSIONS.ROLES_EDIT,
      PERMISSIONS.SETTINGS_EDIT,
    ];
    const missingCritical = critical.filter((c) => !keys.has(c));
    if (missingCritical.length > 0) {
      throw new ValidationError(
        'The Owner/Admin role must retain staff, roles and settings management to prevent lockout.',
      );
    }
  }

  if (input.name) {
    const dup = await prisma.role.findFirst({ where: { shopId, name: input.name, id: { not: roleId } } });
    if (dup) throw new ConflictError('A role with this name already exists in this business');
  }

  if (input.permissions) {
    const permIds = await permissionIdsFromKeys(input.permissions);
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      await tx.rolePermission.createMany({
        data: permIds.map((permissionId) => ({ roleId, permissionId })),
      });
    });
  }

  await prisma.role.update({
    where: { id: roleId },
    data: {
      name: input.name,
      description: input.description !== undefined ? input.description ?? null : undefined,
    },
  });

  if (input.limits) {
    const limitsData: any = {
      maxDiscountPercent: input.limits.maxDiscountPercent ?? undefined,
      allowUnlimitedDiscount: input.limits.allowUnlimitedDiscount,
      refundApprovalRequired: input.limits.refundApprovalRequired,
      maxRefundAmount: input.limits.maxRefundAmount ?? undefined,
      canApproveRefund: input.limits.canApproveRefund,
      canOverridePrice: input.limits.canOverridePrice,
      canChangePrice: input.limits.canChangePrice,
    };
    await prisma.roleLimit.upsert({
      where: { roleId },
      update: limitsData,
      create: { roleId, ...limitsData },
    });
  }

  const updated = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    include: {
      permissions: { include: { permission: { select: { key: true, group: true } } } },
      limits: true,
      _count: { select: { users: true } },
    },
  });

  return serializeRole(updated);
}

export async function deleteRole(shopId: string, roleId: string, _actorId: string) {
  const role = await prisma.role.findFirst({ where: { id: roleId, shopId }, include: { users: true } });
  if (!role) throw new NotFoundError('Role not found');
  if (role.isProtected) throw new ForbiddenError('This system role cannot be deleted');

  // Cannot delete a role still assigned to active staff. Reassign them first.
  if (role.users.length > 0) {
    throw new ValidationError(
      `This role is assigned to ${role.users.length} staff member(s). Reassign them before deleting.`,
    );
  }

  await prisma.role.delete({ where: { id: roleId } });
  return { id: roleId };
}

// ---- Per-user permission overrides ----

export async function getStaffPermissionSummary(shopId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, shopId },
    include: {
      roleRef: {
        include: { permissions: { include: { permission: { select: { key: true, group: true } } } } },
      },
      permissionOverrides: { include: { permission: { select: { key: true, name: true, group: true } } } },
    },
  });
  if (!user) throw new NotFoundError('Staff member not found');

  const roleKeys = new Set<string>((user.roleRef?.permissions ?? []).map((p) => p.permission.key));
  const overrides = user.permissionOverrides ?? [];

  // Effective permissions = role perms adjusted by overrides.
  const effective = new Map<string, string>(); // key -> group
  for (const p of user.roleRef?.permissions ?? []) effective.set(p.permission.key, p.permission.group);
  const added: { key: string; name: string; group: string }[] = [];
  const removed: { key: string; name: string; group: string }[] = [];
  for (const ov of overrides) {
    const key = ov.permission.key;
    if (ov.granted) {
      if (!effective.has(key)) {
        effective.set(key, ov.permission.group);
        added.push({ key, name: ov.permission.name, group: ov.permission.group });
      }
    } else {
      if (effective.has(key)) {
        effective.delete(key);
        removed.push({ key, name: ov.permission.name, group: ov.permission.group });
      }
    }
  }

  return {
    userId: user.id,
    fullName: user.fullName,
    roleId: user.roleId,
    roleName: user.roleRef?.name ?? null,
    rolePermissions: Array.from(roleKeys),
    overrides: overrides.map((o) => ({ permissionKey: o.permission.key, granted: o.granted, name: o.permission.name })),
    addedPermissions: added,
    removedPermissions: removed,
    effectivePermissions: Array.from(effective.keys()),
    effectiveGroups: Array.from(new Set(effective.values())),
  };
}

export async function setOverrides(
  shopId: string,
  targetUserId: string,
  input: { granted?: string[]; denied?: string[] },
) {
  const target = await prisma.user.findFirst({ where: { id: targetUserId, shopId } });
  if (!target) throw new NotFoundError('Staff member not found');

  const granted = input.granted ?? [];
  const denied = input.denied ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.userPermissionOverride.deleteMany({ where: { userId: targetUserId } });

    if (granted.length > 0) {
      const ids = await permissionIdsFromKeys(granted);
      await tx.userPermissionOverride.createMany({
        data: ids.map((permissionId) => ({ userId: targetUserId, permissionId, granted: true })),
      });
    }
    if (denied.length > 0) {
      const ids = await permissionIdsFromKeys(denied);
      await tx.userPermissionOverride.createMany({
        data: ids.map((permissionId) => ({ userId: targetUserId, permissionId, granted: false })),
      });
    }
  });

  return getStaffPermissionSummary(shopId, targetUserId);
}

// Backwards-compat helper: return which legacy role's permission set is the
// "template" for a system default role name.
export { LEGACY_SYSTEM_ROLE_PERMISSIONS };
