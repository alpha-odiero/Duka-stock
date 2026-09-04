import { prisma } from '../lib/prisma';
import {
  ALL_PERMISSIONS,
  LEGACY_SYSTEM_ROLE_PERMISSIONS,
  PERMISSIONS,
  seedPermissions,
  type Permission,
  type PermissionKey,
} from '../lib/permissions';

// Ensures the global Permission catalog exists (idempotent). Called at server
// startup and whenever a new business is created, so everyone has a consistent
// permission key set.
export async function ensurePermissionCatalog(): Promise<void> {
  const rows = await seedPermissions();
  for (const row of rows) {
    await prisma.permission.upsert({
      where: { key: row.key },
      update: { name: row.name, group: row.group, description: row.description, sortOrder: row.sortOrder },
      create: { key: row.key, name: row.name, group: row.group, description: row.description, sortOrder: row.sortOrder },
    });
  }
}

// Looks up the Permission table rows for a set of keys, throwing if missing.
async function permissionRows(keys: PermissionKey[]) {
  const found = await prisma.permission.findMany({
    where: { key: { in: keys as string[] } },
    select: { id: true, key: true },
  });
  const map = new Map(found.map((p) => [p.key, p.id]));
  return keys.map((k) => map.get(k)).filter((id): id is string => Boolean(id));
}

// Definition of the default roles created for every new business.
export interface DefaultRoleDef {
  key: string; // name
  permissions: Permission[];
  protected: boolean;
  limits?: {
    maxDiscountPercent?: number | null;
    allowUnlimitedDiscount?: boolean;
    refundApprovalRequired?: boolean;
    maxRefundAmount?: number | null;
    canApproveRefund?: boolean;
    canOverridePrice?: boolean;
    canChangePrice?: boolean;
  };
  description?: string;
}

export const DEFAULT_ROLES: DefaultRoleDef[] = [
  {
    key: 'Owner/Admin',
    permissions: ALL_PERMISSIONS,
    protected: true,
    description: 'Full access to every part of the business.',
    limits: { allowUnlimitedDiscount: true, canApproveRefund: true, canOverridePrice: true, canChangePrice: true },
  },
  {
    key: 'Manager',
    permissions: LEGACY_SYSTEM_ROLE_PERMISSIONS.MANAGER,
    protected: true,
    description: 'Operational management and approvals.',
    limits: { maxDiscountPercent: 20, canApproveRefund: true, maxRefundAmount: 10000, canOverridePrice: true, canChangePrice: false },
  },
  {
    key: 'Cashier',
    permissions: LEGACY_SYSTEM_ROLE_PERMISSIONS.CASHIER,
    protected: true,
    description: 'Handles customer sales and POS operations.',
    limits: { maxDiscountPercent: 5, canApproveRefund: false, canOverridePrice: false, canChangePrice: false },
  },
  {
    key: 'Accountant',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.SALES_VIEW_ALL,
      PERMISSIONS.SALES_EXPORT,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_SALES,
      PERMISSIONS.REPORTS_PROFIT,
      PERMISSIONS.REPORTS_FINANCIAL,
      PERMISSIONS.REPORTS_INVENTORY,
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_EDIT,
      PERMISSIONS.PAYMENTS_MANAGE,
      PERMISSIONS.RETURNS_VIEW,
      PERMISSIONS.TAX_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
    protected: false,
    description: 'Financial and accounting-related access.',
  },
  {
    key: 'Sales Staff',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.POS_ACCESS,
      PERMISSIONS.POS_HOLD,
      PERMISSIONS.POS_PRINT_RECEIPT,
      PERMISSIONS.POS_DISCOUNT,
      PERMISSIONS.SALES_VIEW,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
    protected: false,
    description: 'Customer-facing sales access.',
    limits: { maxDiscountPercent: 5, canApproveRefund: false },
  },
  {
    key: 'Storekeeper',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.VARIANT_VIEW,
      PERMISSIONS.VARIANT_MANAGE,
      PERMISSIONS.BATCH_VIEW,
      PERMISSIONS.BATCH_MANAGE,
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_EDIT,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_EDIT,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.INVENTORY_RECEIVE,
      PERMISSIONS.PURCHASES_VIEW,
      PERMISSIONS.PURCHASES_CREATE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_INVENTORY,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
    protected: false,
    description: 'Inventory-focused access.',
  },
  {
    key: 'Inventory Manager',
    permissions: LEGACY_SYSTEM_ROLE_PERMISSIONS.INVENTORY,
    protected: false,
    description: 'Advanced inventory permissions.',
  },
  {
    key: 'Supervisor',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.POS_ACCESS,
      PERMISSIONS.POS_HOLD,
      PERMISSIONS.POS_PRINT_RECEIPT,
      PERMISSIONS.POS_REPRINT_ANY,
      PERMISSIONS.POS_DISCOUNT,
      PERMISSIONS.SALES_VIEW_ALL,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_REFUND,
      PERMISSIONS.SALES_APPROVE_REFUND,
      PERMISSIONS.RETURNS_VIEW,
      PERMISSIONS.RETURNS_CREATE,
      PERMISSIONS.RETURNS_APPROVE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.VARIANT_VIEW,
      PERMISSIONS.BATCH_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_SALES,
      PERMISSIONS.STAFF_VIEW,
      PERMISSIONS.SHIFTS_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
    protected: false,
    description: 'Operational monitoring and approvals.',
    limits: { maxDiscountPercent: 15, canApproveRefund: true, maxRefundAmount: 5000, canOverridePrice: true, canChangePrice: false },
  },
  {
    key: 'Procurement Officer',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.VARIANT_VIEW,
      PERMISSIONS.BATCH_VIEW,
      PERMISSIONS.BATCH_MANAGE,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_EDIT,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.PURCHASES_VIEW,
      PERMISSIONS.PURCHASES_CREATE,
      PERMISSIONS.PURCHASES_EDIT,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_INVENTORY,
      PERMISSIONS.NOTIFICATIONS_VIEW,
    ],
    protected: false,
    description: 'Purchases and supplier management.',
  },
];

// Creates all default roles for a shop (idempotent by name within the shop) and
// returns the created owner role so the owner user can be linked to it. Should
// be called within the same transaction as shop creation where possible.
export async function bootstrapRolesForShop(shopId: string) {
  await ensurePermissionCatalog();

  const created: Record<string, string> = {};
  for (const def of DEFAULT_ROLES) {
    const permIds = await permissionRows(def.permissions);
    const role = await prisma.role.upsert({
      where: { shopId_name: { shopId, name: def.key } },
      update: {},
      create: {
        shopId,
        name: def.key,
        description: def.description,
        type: 'SYSTEM',
        isDefault: true,
        isProtected: def.protected,
        permissions: { create: permIds.map((permissionId) => ({ permissionId })) },
        limits: def.limits
          ? {
              create: {
                maxDiscountPercent: def.limits.maxDiscountPercent ?? undefined,
                allowUnlimitedDiscount: def.limits.allowUnlimitedDiscount ?? false,
                refundApprovalRequired: def.limits.refundApprovalRequired ?? false,
                maxRefundAmount: def.limits.maxRefundAmount ?? undefined,
                canApproveRefund: def.limits.canApproveRefund ?? false,
                canOverridePrice: def.limits.canOverridePrice ?? false,
                canChangePrice: def.limits.canChangePrice ?? false,
              },
            }
          : undefined,
      },
    });
    created[def.key] = role.id;
  }
  return created;
}

// Link the primary owner to the "Owner/Admin" role for a shop.
export async function assignOwnerRole(shopId: string, ownerId: string) {
  const ownerRole = await prisma.role.findFirst({ where: { shopId, name: 'Owner/Admin' } });
  if (ownerRole) {
    await prisma.user.update({ where: { id: ownerId }, data: { roleId: ownerRole.id } });
  }
}

// Reconcile every shop's system roles against the current DEFAULT_ROLES catalog.
// Roles are only ever granted newly-added permissions (never revoked), because
// staff may have been granted system-role permissions beyond the defaults and we
// must not silently strip access. This runs at server startup so that permissions
// added to the catalog after a shop was created (e.g. staff.view) are picked up
// by pre-existing roles, preventing spurious 403s.
export async function reconcileSystemRoles(): Promise<void> {
  await ensurePermissionCatalog();

  const roles = await prisma.role.findMany({
    where: { type: 'SYSTEM' },
    select: {
      id: true,
      name: true,
      permissions: { select: { permissionId: true, permission: { select: { key: true } } } },
    },
  });

  const defByName = new Map(DEFAULT_ROLES.map((d) => [d.key, d]));

  for (const role of roles) {
    const def = defByName.get(role.name);
    if (!def) continue;

    const have = new Set(role.permissions.map((p) => p.permission.key));
    const missing = def.permissions.filter((p) => !have.has(p));
    if (missing.length === 0) continue;

    const permIds = await permissionRows(missing);
    if (permIds.length === 0) continue;

    const existing = new Set(role.permissions.map((p) => p.permissionId));
    const toCreate = permIds.filter((permissionId) => !existing.has(permissionId));

    if (toCreate.length > 0) {
      await prisma.rolePermission.createMany({
        data: toCreate.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      });
    }
  }
}
