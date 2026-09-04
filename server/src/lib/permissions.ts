import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from './errors';

// ===== Permission catalog =====
// The single source of truth for every possible permission (resource.action).
// These keys are seeded into the Permission table and referenced by roles.
// The catalog is shared conceptually with the client so both sides agree on the
// same permission keys.

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  POS_ACCESS: 'pos.access',
  POS_HOLD: 'pos.hold',
  POS_RESUME: 'pos.resume',
  POS_CANCEL: 'pos.cancel',
  POS_PRINT_RECEIPT: 'pos.print_receipt',
  POS_REPRINT_OWN: 'pos.reprint_own',
  POS_REPRINT_ANY: 'pos.reprint_any',
  POS_DISCOUNT: 'pos.discount',
  POS_DISCOUNT_ABOVE_LIMIT: 'pos.discount_above_limit',

  SALES_VIEW: 'sales.view',
  SALES_VIEW_ALL: 'sales.view_all',
  SALES_CREATE: 'sales.create',
  SALES_EDIT: 'sales.edit',
  SALES_VOID: 'sales.void',
  SALES_REFUND: 'sales.refund',
  SALES_APPROVE_REFUND: 'sales.approve_refund',
  SALES_EXPORT: 'sales.export',

  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_IMPORT: 'products.import',
  PRODUCTS_EXPORT: 'products.export',
  PRODUCTS_CHANGE_PRICE: 'products.change_price',
  PRODUCTS_DISCOUNT: 'products.discount',
  PRODUCTS_OVERRIDE_PRICE: 'products.override_price',

  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_EDIT: 'categories.edit',
  CATEGORIES_DELETE: 'categories.delete',

  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_CREATE: 'suppliers.create',
  SUPPLIERS_EDIT: 'suppliers.edit',
  SUPPLIERS_DELETE: 'suppliers.delete',

  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_RECEIVE: 'inventory.receive',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_WRITEOFF: 'inventory.writeoff',
  INVENTORY_DELETE_MOVEMENT: 'inventory.delete_movement',

  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',

  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_EDIT: 'purchases.edit',
  PURCHASES_DELETE: 'purchases.delete',

  ORDERS_VIEW: 'orders.view',
  ORDERS_UPDATE: 'orders.update',

  REPORTS_VIEW: 'reports.view',
  REPORTS_SALES: 'reports.sales',
  REPORTS_PROFIT: 'reports.profit',
  REPORTS_INVENTORY: 'reports.inventory',
  REPORTS_FINANCIAL: 'reports.financial',

  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_EDIT: 'expenses.edit',
  EXPENSES_DELETE: 'expenses.delete',

  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_EDIT: 'staff.edit',
  STAFF_DEACTIVATE: 'staff.deactivate',
  STAFF_INVITE: 'staff.invite',
  MANAGER_ROLES: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',

  REGISTERS_VIEW: 'registers.view',
  REGISTERS_CREATE: 'registers.create',
  REGISTERS_EDIT: 'registers.edit',
  REGISTERS_DELETE: 'registers.delete',
  SHIFTS_VIEW: 'shifts.view',
  SHIFTS_MANAGE: 'shifts.manage',
  SHIFTS_APPROVE: 'shifts.approve',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  PAYMENTS_MANAGE: 'payments.manage',
  PAYMENTS_REFUNDS: 'payments.refunds',

  RETURNS_VIEW: 'returns.view',
  RETURNS_CREATE: 'returns.create',
  RETURNS_APPROVE: 'returns.approve',

  VARIANT_VIEW: 'variants.view',
  VARIANT_MANAGE: 'variants.manage',

  BATCH_VIEW: 'batches.view',
  BATCH_MANAGE: 'batches.manage',

  TAX_VIEW: 'tax.view',
  TAX_MANAGE: 'tax.manage',

  NOTIFICATIONS_VIEW: 'notifications.view',

  AUDIT_VIEW: 'audit.view',

  CUSTOMERS_EXPORT: 'customers.export',
  PRODUCTS_MANAGE: 'products.manage',

  OFFERS_VIEW: 'offers.view',
  OFFERS_MANAGE: 'offers.manage',

  INTEGRATIONS_VIEW: 'integrations.view',
  INTEGRATIONS_MANAGE: 'integrations.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type PermissionKey = Permission;

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

// Human-friendly label + group for each permission, used by the permission
// builder UI and the seeded Permission catalog.
export interface PermissionMeta {
  key: Permission;
  label: string;
  group: string;
  description?: string;
}

export const PERMISSION_META: Record<Permission, { label: string; group: string; description?: string }> = {
  [PERMISSIONS.DASHBOARD_VIEW]: { label: 'View Dashboard', group: 'Dashboard' },
  [PERMISSIONS.POS_ACCESS]: { label: 'Access POS', group: 'POS' },
  [PERMISSIONS.POS_HOLD]: { label: 'Hold Sale', group: 'POS' },
  [PERMISSIONS.POS_RESUME]: { label: 'Resume Sale', group: 'POS' },
  [PERMISSIONS.POS_CANCEL]: { label: 'Cancel Own Sale', group: 'POS' },
  [PERMISSIONS.POS_PRINT_RECEIPT]: { label: 'Print Receipt', group: 'POS' },
  [PERMISSIONS.POS_REPRINT_OWN]: { label: 'Reprint Own Receipt', group: 'POS' },
  [PERMISSIONS.POS_REPRINT_ANY]: { label: 'Reprint Any Receipt', group: 'POS' },
  [PERMISSIONS.POS_DISCOUNT]: { label: 'Apply Discount', group: 'POS' },
  [PERMISSIONS.POS_DISCOUNT_ABOVE_LIMIT]: { label: 'Apply Discount Above Limit', group: 'POS' },
  [PERMISSIONS.SALES_VIEW]: { label: 'View Own Sales', group: 'Sales' },
  [PERMISSIONS.SALES_VIEW_ALL]: { label: 'View All Sales', group: 'Sales' },
  [PERMISSIONS.SALES_CREATE]: { label: 'Create Sale', group: 'Sales' },
  [PERMISSIONS.SALES_EDIT]: { label: 'Edit Sale', group: 'Sales' },
  [PERMISSIONS.SALES_VOID]: { label: 'Void Sale', group: 'Sales' },
  [PERMISSIONS.SALES_REFUND]: { label: 'Refund Sale', group: 'Sales' },
  [PERMISSIONS.SALES_APPROVE_REFUND]: { label: 'Approve Refund', group: 'Sales' },
  [PERMISSIONS.SALES_EXPORT]: { label: 'Export Sales', group: 'Sales' },
  [PERMISSIONS.PRODUCTS_VIEW]: { label: 'View Products', group: 'Products' },
  [PERMISSIONS.PRODUCTS_CREATE]: { label: 'Add Product', group: 'Products' },
  [PERMISSIONS.PRODUCTS_EDIT]: { label: 'Edit Product', group: 'Products' },
  [PERMISSIONS.PRODUCTS_DELETE]: { label: 'Delete Product', group: 'Products' },
  [PERMISSIONS.PRODUCTS_IMPORT]: { label: 'Import Products', group: 'Products' },
  [PERMISSIONS.PRODUCTS_EXPORT]: { label: 'Export Products', group: 'Products' },
  [PERMISSIONS.PRODUCTS_CHANGE_PRICE]: { label: 'Change Selling Price', group: 'Products' },
  [PERMISSIONS.PRODUCTS_DISCOUNT]: { label: 'Discount Products', group: 'Products' },
  [PERMISSIONS.PRODUCTS_OVERRIDE_PRICE]: { label: 'Override Price', group: 'Products' },
  [PERMISSIONS.PRODUCTS_MANAGE]: { label: 'Manage Products', group: 'Products' },
  [PERMISSIONS.CATEGORIES_VIEW]: { label: 'View Categories', group: 'Categories' },
  [PERMISSIONS.CATEGORIES_CREATE]: { label: 'Create Categories', group: 'Categories' },
  [PERMISSIONS.CATEGORIES_EDIT]: { label: 'Edit Categories', group: 'Categories' },
  [PERMISSIONS.CATEGORIES_DELETE]: { label: 'Delete Categories', group: 'Categories' },
  [PERMISSIONS.SUPPLIERS_VIEW]: { label: 'View Suppliers', group: 'Suppliers' },
  [PERMISSIONS.SUPPLIERS_CREATE]: { label: 'Create Suppliers', group: 'Suppliers' },
  [PERMISSIONS.SUPPLIERS_EDIT]: { label: 'Edit Suppliers', group: 'Suppliers' },
  [PERMISSIONS.SUPPLIERS_DELETE]: { label: 'Delete Suppliers', group: 'Suppliers' },
  [PERMISSIONS.INVENTORY_VIEW]: { label: 'View Stock', group: 'Inventory' },
  [PERMISSIONS.INVENTORY_ADJUST]: { label: 'Adjust Stock', group: 'Inventory' },
  [PERMISSIONS.INVENTORY_RECEIVE]: { label: 'Receive Stock', group: 'Inventory' },
  [PERMISSIONS.INVENTORY_TRANSFER]: { label: 'Transfer Stock', group: 'Inventory' },
  [PERMISSIONS.INVENTORY_WRITEOFF]: { label: 'Write Off Stock', group: 'Inventory' },
  [PERMISSIONS.INVENTORY_DELETE_MOVEMENT]: { label: 'Delete Stock Movement', group: 'Inventory' },
  [PERMISSIONS.CUSTOMERS_VIEW]: { label: 'View Customers', group: 'Customers' },
  [PERMISSIONS.CUSTOMERS_CREATE]: { label: 'Add Customer', group: 'Customers' },
  [PERMISSIONS.CUSTOMERS_EDIT]: { label: 'Edit Customer', group: 'Customers' },
  [PERMISSIONS.CUSTOMERS_DELETE]: { label: 'Delete Customer', group: 'Customers' },
  [PERMISSIONS.CUSTOMERS_EXPORT]: { label: 'Export Customers', group: 'Customers' },
  [PERMISSIONS.PURCHASES_VIEW]: { label: 'View Purchases', group: 'Purchases' },
  [PERMISSIONS.PURCHASES_CREATE]: { label: 'Create Purchase', group: 'Purchases' },
  [PERMISSIONS.PURCHASES_EDIT]: { label: 'Edit Purchase', group: 'Purchases' },
  [PERMISSIONS.PURCHASES_DELETE]: { label: 'Delete Purchase', group: 'Purchases' },
  [PERMISSIONS.ORDERS_VIEW]: { label: 'View Orders', group: 'Orders' },
  [PERMISSIONS.ORDERS_UPDATE]: { label: 'Update Order Status', group: 'Orders' },
  [PERMISSIONS.REPORTS_VIEW]: { label: 'View Reports', group: 'Reports' },
  [PERMISSIONS.REPORTS_SALES]: { label: 'View Sales Reports', group: 'Reports' },
  [PERMISSIONS.REPORTS_PROFIT]: { label: 'View Profit Reports', group: 'Reports' },
  [PERMISSIONS.REPORTS_INVENTORY]: { label: 'View Inventory Reports', group: 'Reports' },
  [PERMISSIONS.REPORTS_FINANCIAL]: { label: 'View Financial Reports', group: 'Reports' },
  [PERMISSIONS.EXPENSES_VIEW]: { label: 'View Expenses', group: 'Expenses' },
  [PERMISSIONS.EXPENSES_CREATE]: { label: 'Add Expense', group: 'Expenses' },
  [PERMISSIONS.EXPENSES_EDIT]: { label: 'Edit Expense', group: 'Expenses' },
  [PERMISSIONS.EXPENSES_DELETE]: { label: 'Delete Expense', group: 'Expenses' },
  [PERMISSIONS.STAFF_VIEW]: { label: 'View Staff', group: 'Staff' },
  [PERMISSIONS.STAFF_CREATE]: { label: 'Add Staff', group: 'Staff' },
  [PERMISSIONS.STAFF_EDIT]: { label: 'Edit Staff', group: 'Staff' },
  [PERMISSIONS.STAFF_DEACTIVATE]: { label: 'Deactivate Staff', group: 'Staff' },
  [PERMISSIONS.STAFF_INVITE]: { label: 'Invite Staff', group: 'Staff' },
  [PERMISSIONS.MANAGER_ROLES]: { label: 'View Roles', group: 'Staff' },
  [PERMISSIONS.ROLES_CREATE]: { label: 'Create Role', group: 'Staff' },
  [PERMISSIONS.ROLES_EDIT]: { label: 'Edit Role', group: 'Staff' },
  [PERMISSIONS.ROLES_DELETE]: { label: 'Delete Role', group: 'Staff' },
  [PERMISSIONS.REGISTERS_VIEW]: { label: 'View Registers', group: 'Registers' },
  [PERMISSIONS.REGISTERS_CREATE]: { label: 'Create Register', group: 'Registers' },
  [PERMISSIONS.REGISTERS_EDIT]: { label: 'Edit Register', group: 'Registers' },
  [PERMISSIONS.REGISTERS_DELETE]: { label: 'Delete Register', group: 'Registers' },
  [PERMISSIONS.SHIFTS_VIEW]: { label: 'View Shifts', group: 'Registers' },
  [PERMISSIONS.SHIFTS_MANAGE]: { label: 'Manage Shifts', group: 'Registers' },
  [PERMISSIONS.SHIFTS_APPROVE]: { label: 'Approve Shifts', group: 'Registers' },
  [PERMISSIONS.SETTINGS_VIEW]: { label: 'View Settings', group: 'Business Settings' },
  [PERMISSIONS.SETTINGS_EDIT]: { label: 'Edit Settings', group: 'Business Settings' },
  [PERMISSIONS.PAYMENTS_MANAGE]: { label: 'Manage Payment Settings', group: 'Payments' },
  [PERMISSIONS.PAYMENTS_REFUNDS]: { label: 'Process Refunds', group: 'Payments' },
  [PERMISSIONS.RETURNS_VIEW]: { label: 'View Returns', group: 'Returns & Refunds' },
  [PERMISSIONS.RETURNS_CREATE]: { label: 'Process Returns', group: 'Returns & Refunds' },
  [PERMISSIONS.RETURNS_APPROVE]: { label: 'Approve Returns & Refunds', group: 'Returns & Refunds' },
  [PERMISSIONS.VARIANT_VIEW]: { label: 'View Product Variants', group: 'Product Variants' },
  [PERMISSIONS.VARIANT_MANAGE]: { label: 'Manage Product Variants', group: 'Product Variants' },
  [PERMISSIONS.BATCH_VIEW]: { label: 'View Stock Batches', group: 'Batches & Expiry' },
  [PERMISSIONS.BATCH_MANAGE]: { label: 'Manage Stock Batches', group: 'Batches & Expiry' },
  [PERMISSIONS.TAX_VIEW]: { label: 'View Tax Settings', group: 'Tax & Compliance' },
  [PERMISSIONS.TAX_MANAGE]: { label: 'Manage Tax Settings', group: 'Tax & Compliance' },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { label: 'View Notifications', group: 'Notifications' },
  [PERMISSIONS.AUDIT_VIEW]: { label: 'View Audit Logs', group: 'Audit Logs' },
  [PERMISSIONS.OFFERS_VIEW]: { label: 'View Offers & Promotions', group: 'Offers & Promotions' },
  [PERMISSIONS.OFFERS_MANAGE]: { label: 'Manage Offers & Promotions', group: 'Offers & Promotions' },
  [PERMISSIONS.INTEGRATIONS_VIEW]: { label: 'View API & Integrations', group: 'API & Integrations' },
  [PERMISSIONS.INTEGRATIONS_MANAGE]: { label: 'Manage API & Integrations', group: 'API & Integrations' },
};

// Group display order for the permission builder UI.
export const PERMISSION_GROUPS: { group: string; perms: Permission[] }[] = (() => {
  const groups = new Map<string, Permission[]>();
  for (const key of ALL_PERMISSIONS) {
    const meta = PERMISSION_META[key];
    if (!groups.has(meta.group)) groups.set(meta.group, []);
    groups.get(meta.group)!.push(key);
  }
  return Array.from(groups.entries()).map(([group, perms]) => ({ group, perms }));
})();

// Backwards-compatible role->permission defaults used to seed system roles when
// a business is created. Legacy enum roles map to a corresponding role name.
export type LegacyRole = import('@prisma/client').UserRole;

const ALL: Permission[] = ALL_PERMISSIONS;

export const LEGACY_SYSTEM_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ALL,
  ADMIN: ALL,
  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_HOLD,
    PERMISSIONS.POS_RESUME,
    PERMISSIONS.POS_PRINT_RECEIPT,
    PERMISSIONS.POS_REPRINT_OWN,
    PERMISSIONS.POS_REPRINT_ANY,
    PERMISSIONS.SALES_VIEW_ALL,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.SALES_APPROVE_REFUND,
    PERMISSIONS.RETURNS_VIEW,
    PERMISSIONS.RETURNS_CREATE,
    PERMISSIONS.RETURNS_APPROVE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.VARIANT_VIEW,
    PERMISSIONS.VARIANT_MANAGE,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.BATCH_MANAGE,
    PERMISSIONS.TAX_VIEW,
    PERMISSIONS.TAX_MANAGE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_CREATE,
    PERMISSIONS.SUPPLIERS_EDIT,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_RECEIVE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_EDIT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_SALES,
    PERMISSIONS.REPORTS_PROFIT,
    PERMISSIONS.REPORTS_INVENTORY,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_INVITE,
    PERMISSIONS.MANAGER_ROLES,
    PERMISSIONS.REGISTERS_VIEW,
    PERMISSIONS.SHIFTS_VIEW,
    PERMISSIONS.SHIFTS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OFFERS_VIEW,
    PERMISSIONS.OFFERS_MANAGE,
    PERMISSIONS.INTEGRATIONS_VIEW,
    PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  CASHIER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_HOLD,
    PERMISSIONS.POS_RESUME,
    PERMISSIONS.POS_PRINT_RECEIPT,
    PERMISSIONS.POS_REPRINT_OWN,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.RETURNS_VIEW,
    PERMISSIONS.RETURNS_CREATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  INVENTORY: [
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
  ATTENDANT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_HOLD,
    PERMISSIONS.POS_RESUME,
    PERMISSIONS.POS_PRINT_RECEIPT,
    PERMISSIONS.POS_REPRINT_OWN,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.RETURNS_VIEW,
    PERMISSIONS.RETURNS_CREATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

// ---- DB-backed permission resolution ----
// Since we no longer hard-code permissions purely on an enum, resolving a user's
// effective permissions requires a DB round-trip. To keep request-time auth
// cheap, requireAuth loads a serialized permission map once and attaches it to
// req.permissions. Guards read from that.

export interface ResolvedPermissions {
  permissions: Set<string>;
  limits: {
    maxDiscountPercent: number | null;
    allowUnlimitedDiscount: boolean;
    refundApprovalRequired: boolean;
    maxRefundAmount: number | null;
    canApproveRefund: boolean;
    canOverridePrice: boolean;
    canChangePrice: boolean;
  } | null;
  roleId: string | null;
  roleName: string | null;
}

// Build the full permission catalog rows for seeding the Permission table.
export async function seedPermissions(): Promise<
  { key: string; name: string; group: string; description: string | null; sortOrder: number }[]
> {
  let order = 0;
  return ALL_PERMISSIONS.map((key) => {
    const meta = PERMISSION_META[key];
    order += 1;
    return {
      key,
      name: meta.label,
      group: meta.group,
      description: meta.description ?? null,
      sortOrder: order,
    };
  });
}

// ===== Express middleware =====
// requirePermission: the authenticated session must carry ALL of the given raw
// permission strings (resolved by requireAuth into req.permissions.permissions).
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    const allowed = req.permissions ?? new Set<string>();
    const missing = permissions.find((p) => !allowed.has(p));
    if (missing) return next(new ForbiddenError('You do not have permission to perform this action'));
    next();
  };
}

// hasAnyPermission: granted if the user holds at least one of the given perms.
export function respondIfHasAnyPermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    const allowed = req.permissions ?? new Set<string>();
    if (permissions.some((p) => allowed.has(p))) return next();
    return next(new ForbiddenError('You do not have permission to perform this action'));
  };
}

// Legacy role check kept for routes that have not yet been migrated to the
// permission system. New code should prefer requirePermission.
export function hasRole(role: import('@prisma/client').UserRole, expected: import('@prisma/client').UserRole): boolean {
  return role === expected;
}
