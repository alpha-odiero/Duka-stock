import type { UserRole } from '@/types';

// Client-side mirror of the server's role->permission map. Used ONLY for
// deciding what to show in the navigation — the backend independently enforces
// every permission on its routes, so hiding an item here never grants access.
export const PERMISSIONS = {
  POS_ACCESS: 'pos.access',
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_REFUND: 'sales.refund',
  SALES_VOID: 'sales.void',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_EDIT: 'purchases.edit',
  REPORTS_VIEW: 'reports.view',
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_EDIT: 'staff.edit',
  STAFF_DEACTIVATE: 'staff.deactivate',
  REGISTERS_VIEW: 'registers.view',
  REGISTERS_MANAGE: 'registers.manage',
  RETURNS_VIEW: 'returns.view',
  RETURNS_CREATE: 'returns.create',
  RETURNS_APPROVE: 'returns.approve',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  OFFERS_VIEW: 'offers.view',
  OFFERS_MANAGE: 'offers.manage',
  INTEGRATIONS_VIEW: 'integrations.view',
  INTEGRATIONS_MANAGE: 'integrations.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL: Permission[] = Object.values(PERMISSIONS);

const MANAGER_PERMS: Permission[] = [
  PERMISSIONS.POS_ACCESS,
  PERMISSIONS.SALES_VIEW,
  PERMISSIONS.SALES_CREATE,
  PERMISSIONS.SALES_REFUND,
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.PRODUCTS_CREATE,
  PERMISSIONS.PRODUCTS_EDIT,
  PERMISSIONS.INVENTORY_VIEW,
  PERMISSIONS.INVENTORY_ADJUST,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.CUSTOMERS_CREATE,
  PERMISSIONS.CUSTOMERS_EDIT,
  PERMISSIONS.PURCHASES_VIEW,
  PERMISSIONS.PURCHASES_CREATE,
  PERMISSIONS.PURCHASES_EDIT,
  PERMISSIONS.REPORTS_VIEW,
  PERMISSIONS.STAFF_VIEW,
  PERMISSIONS.RETURNS_VIEW,
  PERMISSIONS.RETURNS_CREATE,
  PERMISSIONS.RETURNS_APPROVE,
  PERMISSIONS.OFFERS_VIEW,
  PERMISSIONS.OFFERS_MANAGE,
  PERMISSIONS.INTEGRATIONS_VIEW,
  PERMISSIONS.INTEGRATIONS_MANAGE,
];

const CASHIER_PERMS: Permission[] = [
  PERMISSIONS.POS_ACCESS,
  PERMISSIONS.SALES_VIEW,
  PERMISSIONS.SALES_CREATE,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.CUSTOMERS_CREATE,
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.RETURNS_VIEW,
  PERMISSIONS.RETURNS_CREATE,
];

const INVENTORY_PERMS: Permission[] = [
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.PRODUCTS_CREATE,
  PERMISSIONS.INVENTORY_VIEW,
  PERMISSIONS.INVENTORY_ADJUST,
  PERMISSIONS.PURCHASES_VIEW,
  PERMISSIONS.PURCHASES_CREATE,
  PERMISSIONS.REPORTS_VIEW,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: ALL,
  ADMIN: ALL,
  MANAGER: MANAGER_PERMS,
  CASHIER: CASHIER_PERMS,
  INVENTORY: INVENTORY_PERMS,
  ATTENDANT: CASHIER_PERMS,
};

export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
