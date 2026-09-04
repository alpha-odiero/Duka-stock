// Shared API types mirroring the server's Prisma models and response shapes.
// Monetary fields are strings (PostgreSQL DECIMAL).

export type RefundMethod = 'CASH' | 'MPESA' | 'CARD' | 'BANK' | 'STORE_CREDIT' | 'ORIGINAL';
export type ReturnCondition = 'MINT' | 'GOOD' | 'FAIR' | 'DAMAGED';
export type ReturnReason =
  | 'DAMAGED'
  | 'DEFECTIVE'
  | 'WRONG_PRODUCT'
  | 'CHANGED_MIND'
  | 'INCORRECT_QUANTITY'
  | 'OTHER';
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY' | 'ATTENDANT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RegisterStatus = 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
export type PaymentMethod = 'CASH' | 'MPESA' | 'CARD' | 'OTHER';
export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'VOID'
  | 'CANCELLED';
export type SaleSource = 'POS' | 'ONLINE';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type StockMovementType =
  | 'STOCK_IN'
  | 'PURCHASE'
  | 'POS_SALE'
  | 'ONLINE_ORDER'
  | 'DAMAGE'
  | 'EXPIRED'
  | 'LOST'
  | 'ADJUSTMENT';
export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'TRANSPORT'
  | 'INTERNET'
  | 'SALARIES'
  | 'PACKAGING'
  | 'REPAIRS'
  | 'OTHER';

export interface User {
  id: string;
  fullName: string;
  userName?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  shopId?: string | null;
  registerId?: string | null;
  register?: Register | null;
  lastLoginAt?: string | null;
  lastActive?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { salesMade?: number };
}

export interface Register {
  id: string;
  shopId: string;
  name: string;
  status: RegisterStatus;
  assignedUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  staff?: User[];
  _count?: { sales?: number };
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  businessPin?: string | null;
  website?: string | null;
  logo?: string | null;
  currency: string;
  timezone?: string | null;
  registerName?: string | null;
  receiptFooter?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  displayOrder?: number;
  visible?: boolean;
  _count?: { products: number };
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products?: number; purchases?: number };
}

export interface Product {
  id: string;
  shopId: string;
  categoryId?: string | null;
  category?: Category | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  name: string;
  slug: string;
  sku?: string | null;
  barcode?: string | null;
  buyingPrice: string;
  sellingPrice: string;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
  imageUrl?: string | null;
  cloudinaryPublicId?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockStatus {
  status: 'in_stock' | 'low' | 'out';
  label: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paged<T> {
  items: T[];
  pagination: Pagination;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  referenceId?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  buyingPrice: string;
  subtotal: string;
  profit: string;
  product?: { name: string; unit?: string };
}

export interface Sale {
  id: string;
  shopId: string;
  receiptNumber: string;
  source: SaleSource;
  subtotal: string;
  discount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  amountPaid?: string | null;
  changeDue?: string | null;
  registerName?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  createdBy?: string | null;
  createdById?: string | null;
  cashier?: string | null;
  cashierId?: string | null;
  registerId?: string | null;
  register?: { id: string; name: string } | null;
  createdAt: string;
  items: SaleItem[];
  customer?: Customer | null;
  shop?: {
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    location?: string | null;
    phone?: string | null;
    email?: string | null;
    businessPin?: string | null;
    website?: string | null;
    logo?: string | null;
    currency?: string;
    timezone?: string | null;
    registerName?: string | null;
    receiptFooter?: string | null;
  } | null;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  buyingPrice: string;
  subtotal: string;
  profit: string;
  product?: { name: string; unit?: string; imageUrl?: string | null; slug?: string };
}

export interface Order {
  id: string;
  shopId: string;
  orderNumber: string;
  source: SaleSource;
  status: OrderStatus;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  subtotal: string;
  discount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: Customer | null;
}

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: string;
  unit: string;
  imageUrl?: string | null;
  quantity: number;
  inStock: boolean;
  stockStatus: 'in_stock' | 'low' | 'out';
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
}

export interface StoreInfo {
  id: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  logo?: string | null;
  currency: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  _count?: { products: number };
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitCost: string;
  subtotal: string;
  product?: { name: string; unit?: string };
}

export interface Purchase {
  id: string;
  shopId: string;
  supplierId?: string | null;
  supplier?: Supplier | null;
  totalAmount: string;
  purchaseDate: string;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  items: PurchaseItem[];
}

export interface Expense {
  id: string;
  shopId: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  expenseDate: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  shopId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  todayRevenue: number;
  todaySalesCount: number;
  todayProfit: number;
  todayExpenses: number;
  inventoryValue: number;
  todayPosRevenue: number;
  todayOnlineRevenue: number;
  todayPosCount: number;
  todayOnlineCount: number;
  todayOrders: number;
}

export interface DashboardActivity {
  id: string;
  type: 'sale' | 'stock_in' | 'stock_out' | 'expense' | 'product';
  text: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  lowStock: Product[];
  outOfStock: Product[];
  salesChart: { date: string; revenue: number }[];
  posChart: { date: string; revenue: number }[];
  onlineChart: { date: string; revenue: number }[];
  topProducts: { id: string; name: string; imageUrl: string | null; unitsSold: number; revenue: number }[];
  activity: DashboardActivity[];
}

export interface SalesReport {
  revenue: string;
  numberOfSales: number;
  totalItemsSold: number;
  averageSale: string;
  bestSelling: { name: string; qty: number; revenue: string }[];
  byPaymentMethod: { method: PaymentMethod; count: number; total: string }[];
}

export interface InventoryReport {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: string;
  totalUnits: number;
}

export interface ProfitReport {
  revenue: string;
  cogs: string;
  grossProfit: string;
  expenses: string;
  netProfit: string;
}

export interface PurchaseReport {
  totalPurchases: number;
  totalSpend: string;
  bySupplier: { id: string; name: string; total: string; count: number }[];
  byProduct: { name: string; qty: number; cost: string }[];
}

// ===== Storefront CMS types =====

export type StorefrontStatus = 'DRAFT' | 'PUBLISHED';

export interface StorefrontRecord {
  id: string;
  shopId: string;
  status: StorefrontStatus;
  publishedAt?: string | null;
  storeName?: string | null;
  tagline?: string | null;
  heroImageUrl?: string | null;
  heroImagePublicId?: string | null;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  faviconPublicId?: string | null;
  copyright?: string | null;
  customerCount: number;
  yearEstablished?: number | null;
  onboardingStep: number;
}

export interface StorefrontHero {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  primaryText?: string | null;
  primaryLink?: string | null;
  secondaryText?: string | null;
  secondaryLink?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  backgroundEnabled: boolean;
  alignment: 'left' | 'center';
  show: boolean;
}

export interface StorefrontAbout {
  id: string;
  title?: string | null;
  introduction?: string | null;
  story?: string | null;
  mission?: string | null;
  vision?: string | null;
  values?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  secondaryImageUrl?: string | null;
  secondaryImagePublicId?: string | null;
  showTeam: boolean;
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
}

export interface StorefrontContact {
  id: string;
  title?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  email?: string | null;
  location?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  openingHours?: OpeningHour[] | null;
  showContactForm: boolean;
  showWhatsappBtn: boolean;
}

export interface StorefrontSocial {
  id: string;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
}

export interface StorefrontBranding {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonStyle: 'rounded' | 'pill' | 'square';
  radius: 'subtle' | 'smooth' | 'large';
  font: 'inter' | 'poppins' | 'system';
}

export interface StorefrontSeo {
  id: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogImageUrl?: string | null;
  ogImagePublicId?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
}

export interface StorefrontSection {
  id: string;
  section: string;
  enabled: boolean;
  sortOrder: number;
}

export interface StorefrontFeatured {
  id: string;
  productId: string;
  sortOrder: number;
  product: { id: string; name: string; slug?: string | null; imageUrl?: string | null; sellingPrice: string };
}

export interface StorefrontFeature {
  id: string;
  storefrontId: string;
  title: string;
  description: string;
  icon?: string | null;
  enabled: boolean;
  sortOrder: number;
}

export interface StorefrontTestimonial {
  id: string;
  customerName: string;
  role?: string | null;
  content: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  rating: number;
  featured: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  sortOrder: number;
}

export interface StorefrontNavItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  value?: string;
}

export interface Completeness {
  percent: number;
  done: number;
  total: number;
  items: CompletenessItem[];
  status: StorefrontStatus;
  publishedAt?: string | null;
}

export interface StorefrontCMSConfig {
  storefront: StorefrontRecord;
  hero: StorefrontHero;
  about: StorefrontAbout;
  contact: StorefrontContact;
  social: StorefrontSocial;
  branding: StorefrontBranding;
  seo: StorefrontSeo;
  sections: StorefrontSection[];
  featured: StorefrontFeatured[];
  features: StorefrontFeature[];
  testimonials: StorefrontTestimonial[];
  faqs: StorefrontFaq[];
  navigation: StorefrontNavItem[];
  completeness: Completeness;
}

// Public, safe storefront config consumed by the customer website.
export interface PublicStorefrontConfig {
  status: StorefrontStatus;
  storeName: string | null;
  shopName: string | null;
  currency: string;
  tagline: string | null;
  hero: {
    show: boolean;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    primaryText: string | null;
    primaryLink: string | null;
    secondaryText: string | null;
    secondaryLink: string | null;
    imageUrl: string | null;
    backgroundEnabled: boolean;
    alignment: 'left' | 'center';
  };
  sections: { section: string; enabled: boolean; sortOrder: number }[];
  featured: PublicProduct[];
  features: { id: string; title: string; description: string; icon: string | null }[];
  testimonials: { id: string; customerName: string; role: string | null; content: string; rating: number; imageUrl: string | null }[];
  faqs: { id: string; question: string; answer: string }[];
  categories: PublicCategory[];
  about: {
    title: string | null;
    introduction: string | null;
    story: string | null;
    mission: string | null;
    vision: string | null;
    values: string | null;
    imageUrl: string | null;
    showTeam: boolean;
    yearEstablished: number | null;
    customerCount: number;
  } | null;
  contact: {
    title: string | null;
    description: string | null;
    phone: string | null;
    whatsappNumber: string | null;
    whatsappMessage: string | null;
    email: string | null;
    location: string | null;
    address: string | null;
    mapsUrl: string | null;
    openingHours: OpeningHour[] | null;
    showContactForm: boolean;
    showWhatsappBtn: boolean;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    buttonStyle: 'rounded' | 'pill' | 'square';
    radius: 'subtle' | 'smooth' | 'large';
    font: 'inter' | 'poppins' | 'system';
  };
  logo: string | null;
  copyright: string | null;
  navigation: { id: string; label: string; href: string; isSystem: boolean }[];
  seo: { title: string | null; description: string | null; keywords: string | null; ogImageUrl: string | null; ogTitle: string | null; ogDescription: string | null } | null;
  shop: StoreInfo;
}

// ==== Returns & Refunds ====

export interface ReturnItem {
  id: string;
  returnId: string;
  saleItemId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product?: { name: string; unit?: string | null };
}

export interface Refund {
  id: string;
  shopId: string;
  returnId: string;
  saleId: string;
  refundNumber: string;
  amount: string;
  refundMethod: RefundMethod;
  reference?: string | null;
  status: RefundStatus;
  registerId?: string | null;
  register?: { id: string; name: string } | null;
  createdById?: string | null;
  approvedById?: string | null;
  createdAt: string;
  processedAt?: string | null;
  return?: { id: string; returnNumber: string };
  sale?: { id: string; receiptNumber: string };
}

export interface SalesReturn {
  id: string;
  shopId: string;
  saleId: string;
  returnNumber: string;
  reason: ReturnReason;
  condition: ReturnCondition;
  status: ReturnStatus;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  processedAt?: string | null;
  processedById?: string | null;
  items: ReturnItem[];
  refunds: Refund[];
  sale?: { id: string; receiptNumber: string; totalAmount?: string; createdAt?: string } | null;
}

// ===== Offers & Promotions =====

export type OfferStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Offer {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  discountType: DiscountType;
  discountValue: string;
  startDate?: string | null;
  endDate?: string | null;
  minimumPurchase?: string | null;
  maximumDiscount?: string | null;
  promoCode?: string | null;
  status: OfferStatus;
  visible: boolean;
  effectiveStatus?: OfferStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { products?: number; categories?: number };
  products?: { id: string; productId: string }[];
  categories?: { id: string; categoryId: string }[];
}

// Public offer surfaced on the storefront.
export interface PublicOffer {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  discountType: DiscountType;
  discountValue: string;
  minimumPurchase: string | null;
  maximumDiscount: string | null;
  promoCode: string | null;
  status: OfferStatus;
  startDate: string | null;
  endDate: string | null;
}

// ===== API & Integrations =====

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface ApiIntegration {
  id: string;
  shopId: string;
  provider: string;
  label: string;
  description?: string | null;
  status: IntegrationStatus;
  maskedValue?: string | null;
  config?: Record<string, unknown> | null;
  connectedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}
