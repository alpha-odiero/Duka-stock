import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  ClipboardList,
  Contact,
  DollarSign,
  FolderOpen,
  Home,
  Monitor,
  Package,
  Plug,
  Receipt,
  RotateCcw,
  Send,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
} from 'lucide-react';
import { PERMISSIONS, type Permission } from '@/lib/permissions';
import type { IconColor } from '@/lib/icon-colors';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  match?: string;
  perm?: Permission;
  tone?: IconColor;
}

// Primary bottom-nav (mobile) + sidebar (desktop) items.
export const primaryNav: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: Home, tone: 'orange' },
  { to: '/dashboard/products', label: 'Products', icon: Package, match: '/dashboard/products', tone: 'purple' },
  { to: '/dashboard/sales', label: 'Sales', icon: ShoppingCart, match: '/dashboard/sales', tone: 'orange' },
  { to: '/dashboard/stock', label: 'Stock', icon: Boxes, match: '/dashboard/stock', tone: 'amber' },
];

// Secondary items shown on desktop sidebar and the "More" menu on mobile.
export const secondaryNav: NavItem[] = [
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, match: '/dashboard/orders', tone: 'blue' },
  { to: '/dashboard/returns', label: 'Returns & Refunds', icon: RotateCcw, match: '/dashboard/returns', perm: PERMISSIONS.RETURNS_VIEW, tone: 'red' },
  { to: '/dashboard/customers', label: 'Customers', icon: Contact, match: '/dashboard/customers', tone: 'teal' },
  { to: '/dashboard/categories', label: 'Categories', icon: FolderOpen, match: '/dashboard/categories', tone: 'teal' },
  { to: '/dashboard/purchases', label: 'Purchases', icon: Truck, match: '/dashboard/purchases', tone: 'blue' },
  { to: '/dashboard/suppliers', label: 'Suppliers', icon: Users, match: '/dashboard/suppliers', tone: 'slate' },
  { to: '/dashboard/expenses', label: 'Expenses', icon: DollarSign, match: '/dashboard/expenses', tone: 'red' },
  { to: '/dashboard/reports', label: 'Reports', icon: ClipboardList, match: '/dashboard/reports', tone: 'blue' },
  { to: '/dashboard/registers', label: 'Registers', icon: Monitor, match: '/dashboard/registers', perm: PERMISSIONS.REGISTERS_VIEW, tone: 'slate' },
  { to: '/dashboard/storefront', label: 'Storefront', icon: Send, match: '/dashboard/storefront', tone: 'orange' },
  { to: '/dashboard/offers', label: 'Offers & Promotions', icon: BadgePercent, match: '/dashboard/offers', perm: PERMISSIONS.OFFERS_VIEW, tone: 'red' },
  { to: '/dashboard/integrations', label: 'API & Integrations', icon: Plug, match: '/dashboard/integrations', perm: PERMISSIONS.INTEGRATIONS_VIEW, tone: 'blue' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: AlertTriangle, match: '/dashboard/notifications', tone: 'amber' },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, match: '/dashboard/settings', tone: 'slate' },
];

export const allNav: NavItem[] = [
  ...primaryNav,
  ...secondaryNav,
  { to: '/dashboard/history', label: 'Sales History', icon: Receipt, match: '/dashboard/history', tone: 'green' },
];

// Grouped navigation for the desktop sidebar.
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/dashboard', label: 'Overview', icon: Home, match: '/dashboard', tone: 'orange' }] },
  {
    label: 'Operations',
    items: [
      { to: '/dashboard/sales', label: 'POS', icon: ShoppingCart, match: '/dashboard/sales', tone: 'orange' },
      { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, match: '/dashboard/orders', tone: 'blue' },
      { to: '/dashboard/returns', label: 'Returns & Refunds', icon: RotateCcw, match: '/dashboard/returns', perm: PERMISSIONS.RETURNS_VIEW, tone: 'red' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/dashboard/products', label: 'Products', icon: Package, match: '/dashboard/products', tone: 'purple' },
      { to: '/dashboard/categories', label: 'Categories', icon: FolderOpen, match: '/dashboard/categories', tone: 'teal' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/dashboard/stock', label: 'Inventory', icon: Boxes, match: '/dashboard/stock', tone: 'amber' },
      { to: '/dashboard/purchases', label: 'Purchases', icon: Truck, match: '/dashboard/purchases', tone: 'blue' },
      { to: '/dashboard/suppliers', label: 'Suppliers', icon: Users, match: '/dashboard/suppliers', tone: 'slate' },
    ],
  },
  {
    label: 'Customers',
    items: [{ to: '/dashboard/customers', label: 'Customers', icon: Contact, match: '/dashboard/customers', tone: 'teal' }],
  },
  {
    label: 'Insights',
    items: [
      { to: '/dashboard/history', label: 'Sales', icon: Receipt, match: '/dashboard/history', tone: 'green' },
      { to: '/dashboard/expenses', label: 'Expenses', icon: DollarSign, match: '/dashboard/expenses', tone: 'red' },
      { to: '/dashboard/reports', label: 'Reports', icon: ClipboardList, match: '/dashboard/reports', tone: 'blue' },
    ],
  },
  {
    label: 'Team',
    items: [{ to: '/dashboard/staff', label: 'Staff & Team', icon: UserCog, match: '/dashboard/staff', perm: PERMISSIONS.STAFF_VIEW, tone: 'purple' }],
  },
  {
    label: 'Configure',
    items: [
      { to: '/dashboard/registers', label: 'Registers', icon: Monitor, match: '/dashboard/registers', perm: PERMISSIONS.REGISTERS_VIEW, tone: 'slate' },
      { to: '/dashboard/storefront', label: 'Storefront', icon: Send, match: '/dashboard/storefront', tone: 'orange' },
      { to: '/dashboard/offers', label: 'Offers & Promotions', icon: BadgePercent, match: '/dashboard/offers', perm: PERMISSIONS.OFFERS_VIEW, tone: 'red' },
      { to: '/dashboard/integrations', label: 'API & Integrations', icon: Plug, match: '/dashboard/integrations', perm: PERMISSIONS.INTEGRATIONS_VIEW, tone: 'blue' },
      { to: '/dashboard/notifications', label: 'Notifications', icon: AlertTriangle, match: '/dashboard/notifications', tone: 'amber' },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings, match: '/dashboard/settings', tone: 'slate' },
    ],
  },
];
