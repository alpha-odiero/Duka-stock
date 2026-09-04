import type {
  ExpenseCategory,
  OrderStatus,
  PaymentMethod,
  SaleSource,
  StockMovementType,
} from '@/types';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'RENT', label: 'Rent' },
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'REPAIRS', label: 'Repairs' },
  { value: 'OTHER', label: 'Other' },
];

export const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  STOCK_IN: 'Stock in',
  PURCHASE: 'Purchase',
  POS_SALE: 'Point-of-sale',
  ONLINE_ORDER: 'Online order',
  DAMAGE: 'Damaged',
  EXPIRED: 'Expired',
  LOST: 'Lost',
  ADJUSTMENT: 'Adjustment',
};

export const SALE_SOURCES: { value: SaleSource; label: string }[] = [
  { value: 'POS', label: 'In-store (POS)' },
  { value: 'ONLINE', label: 'Online' },
];

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY', label: 'Ready' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const STOCK_OUT_TYPES = [
  { value: 'DAMAGE', label: 'Damaged' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'LOST', label: 'Lost' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
] as const;

export const REPORT_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
] as const;

export const SALE_FILTER_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
] as const;

export const DEFAULT_CATEGORIES = [
  'Food',
  'Drinks',
  'Dairy',
  'Bakery',
  'Household',
  'Personal Care',
  'Electronics',
  'Stationery',
  'Hardware',
  'Other',
] as const;
