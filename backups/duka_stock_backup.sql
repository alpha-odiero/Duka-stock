--
-- PostgreSQL database dump
--

\restrict dCueDa0mAXfGAf9tVaa7XkoaJDgUaJs5N9MvEK7nrqVK4TtPelchZtMZV61Towt

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BatchStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BatchStatus" AS ENUM (
    'ACTIVE',
    'EXPIRING_SOON',
    'EXPIRED',
    'CONSUMED'
);


ALTER TYPE public."BatchStatus" OWNER TO postgres;

--
-- Name: CashMovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashMovementType" AS ENUM (
    'OPENING',
    'CASH_SALE',
    'CASH_REFUND',
    'CASH_IN',
    'CASH_OUT',
    'EXPENSE',
    'WITHDRAWAL',
    'CLOSING',
    'ADJUSTMENT'
);


ALTER TYPE public."CashMovementType" OWNER TO postgres;

--
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'RENT',
    'ELECTRICITY',
    'TRANSPORT',
    'INTERNET',
    'SALARIES',
    'PACKAGING',
    'REPAIRS',
    'OTHER'
);


ALTER TYPE public."ExpenseCategory" OWNER TO postgres;

--
-- Name: InvitationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'REVOKED'
);


ALTER TYPE public."InvitationStatus" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'READY',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'MPESA',
    'CARD',
    'OTHER',
    'BANK',
    'CREDIT'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PAID',
    'PENDING',
    'PARTIALLY_PAID',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'VOID',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: RefundMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RefundMethod" AS ENUM (
    'CASH',
    'MPESA',
    'CARD',
    'BANK',
    'STORE_CREDIT',
    'ORIGINAL'
);


ALTER TYPE public."RefundMethod" OWNER TO postgres;

--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."RefundStatus" OWNER TO postgres;

--
-- Name: RegisterStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RegisterStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OFFLINE'
);


ALTER TYPE public."RegisterStatus" OWNER TO postgres;

--
-- Name: ReturnCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnCondition" AS ENUM (
    'MINT',
    'GOOD',
    'FAIR',
    'DAMAGED'
);


ALTER TYPE public."ReturnCondition" OWNER TO postgres;

--
-- Name: ReturnReason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnReason" AS ENUM (
    'DAMAGED',
    'DEFECTIVE',
    'WRONG_PRODUCT',
    'CHANGED_MIND',
    'INCORRECT_QUANTITY',
    'OTHER'
);


ALTER TYPE public."ReturnReason" OWNER TO postgres;

--
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PROCESSING',
    'COMPLETED'
);


ALTER TYPE public."ReturnStatus" OWNER TO postgres;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleType" AS ENUM (
    'SYSTEM',
    'CUSTOM'
);


ALTER TYPE public."RoleType" OWNER TO postgres;

--
-- Name: SaleSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SaleSource" AS ENUM (
    'POS',
    'ONLINE'
);


ALTER TYPE public."SaleSource" OWNER TO postgres;

--
-- Name: StockMovementDirection; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockMovementDirection" AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public."StockMovementDirection" OWNER TO postgres;

--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'STOCK_IN',
    'POS_SALE',
    'DAMAGE',
    'EXPIRED',
    'LOST',
    'ADJUSTMENT',
    'ONLINE_ORDER',
    'PURCHASE',
    'RETURN'
);


ALTER TYPE public."StockMovementType" OWNER TO postgres;

--
-- Name: StorefrontStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StorefrontStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


ALTER TYPE public."StorefrontStatus" OWNER TO postgres;

--
-- Name: TaxCategoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaxCategoryType" AS ENUM (
    'TAXABLE',
    'TAX_EXEMPT',
    'ZERO_RATED',
    'STANDARD'
);


ALTER TYPE public."TaxCategoryType" OWNER TO postgres;

--
-- Name: TaxType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaxType" AS ENUM (
    'INCLUSIVE',
    'EXCLUSIVE'
);


ALTER TYPE public."TaxType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'ATTENDANT',
    'MANAGER',
    'CASHIER',
    'INVENTORY'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "shopId" text,
    "userId" text,
    action text NOT NULL,
    "entityType" text,
    "entityId" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Batch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Batch" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    "batchNumber" text NOT NULL,
    "supplierId" text,
    "purchaseId" text,
    "manufacturingDate" timestamp(3) without time zone,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "quantityReceived" integer NOT NULL,
    "quantityRemaining" integer NOT NULL,
    "costPerUnit" numeric(12,2) NOT NULL,
    status public."BatchStatus" DEFAULT 'ACTIVE'::public."BatchStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Batch" OWNER TO postgres;

--
-- Name: CashMovement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CashMovement" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "shiftId" text,
    "registerId" text NOT NULL,
    type public."CashMovementType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "referenceType" text,
    "referenceId" text,
    description text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CashMovement" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "expenseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Expense" OWNER TO postgres;

--
-- Name: Invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invitation" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "roleId" text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    status public."InvitationStatus" DEFAULT 'PENDING'::public."InvitationStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Invitation" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "orderNumber" text NOT NULL,
    source public."SaleSource" DEFAULT 'ONLINE'::public."SaleSource" NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "customerId" text,
    "customerName" text,
    "customerPhone" text,
    "customerEmail" text,
    "deliveryAddress" text,
    notes text,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'MPESA'::public."PaymentMethod" NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "buyingPrice" numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    profit numeric(12,2) NOT NULL,
    "variantId" text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "saleId" text NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    amount numeric(12,2) NOT NULL,
    reference text,
    status public."PaymentStatus" DEFAULT 'PAID'::public."PaymentStatus" NOT NULL,
    "registerId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    "group" text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Permission" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "categoryId" text,
    "supplierId" text,
    name text NOT NULL,
    sku text,
    barcode text,
    "buyingPrice" numeric(12,2) NOT NULL,
    "sellingPrice" numeric(12,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    unit text DEFAULT 'piece'::text NOT NULL,
    "imageUrl" text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    slug text,
    "cloudinaryPublicId" text,
    "taxRateId" text
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    sku text,
    barcode text,
    "buyingPrice" numeric(12,2) NOT NULL,
    "sellingPrice" numeric(12,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Purchase" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "supplierId" text,
    "totalAmount" numeric(12,2) NOT NULL,
    "purchaseDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Purchase" OWNER TO postgres;

--
-- Name: PurchaseItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseItem" (
    id text NOT NULL,
    "purchaseId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitCost" numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "batchId" text,
    "variantId" text
);


ALTER TABLE public."PurchaseItem" OWNER TO postgres;

--
-- Name: Refund; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "returnId" text NOT NULL,
    "saleId" text NOT NULL,
    "refundNumber" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "refundMethod" public."RefundMethod" DEFAULT 'ORIGINAL'::public."RefundMethod" NOT NULL,
    reference text,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    "registerId" text,
    "createdById" text,
    "approvedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone
);


ALTER TABLE public."Refund" OWNER TO postgres;

--
-- Name: Register; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Register" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    status public."RegisterStatus" DEFAULT 'ACTIVE'::public."RegisterStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Register" OWNER TO postgres;

--
-- Name: Return; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Return" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "saleId" text NOT NULL,
    "returnNumber" text NOT NULL,
    reason public."ReturnReason" NOT NULL,
    condition public."ReturnCondition" DEFAULT 'GOOD'::public."ReturnCondition" NOT NULL,
    status public."ReturnStatus" DEFAULT 'PENDING'::public."ReturnStatus" NOT NULL,
    notes text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "processedById" text
);


ALTER TABLE public."Return" OWNER TO postgres;

--
-- Name: ReturnItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReturnItem" (
    id text NOT NULL,
    "returnId" text NOT NULL,
    "saleItemId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL
);


ALTER TABLE public."ReturnItem" OWNER TO postgres;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    "shopId" text,
    name text NOT NULL,
    description text,
    type public."RoleType" DEFAULT 'CUSTOM'::public."RoleType" NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isProtected" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: RoleLimit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RoleLimit" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "maxDiscountPercent" numeric(5,2),
    "allowUnlimitedDiscount" boolean DEFAULT false NOT NULL,
    "refundApprovalRequired" boolean DEFAULT false NOT NULL,
    "maxRefundAmount" numeric(12,2),
    "canApproveRefund" boolean DEFAULT false NOT NULL,
    "canOverridePrice" boolean DEFAULT false NOT NULL,
    "canChangePrice" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RoleLimit" OWNER TO postgres;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO postgres;

--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "receiptNumber" text NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "createdBy" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source public."SaleSource" DEFAULT 'POS'::public."SaleSource" NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    "customerId" text,
    "amountPaid" numeric(12,2),
    "changeDue" numeric(12,2),
    "paymentReference" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PAID'::public."PaymentStatus" NOT NULL,
    "registerName" text,
    "cashierId" text,
    "registerId" text
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: SaleItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SaleItem" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "buyingPrice" numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    profit numeric(12,2) NOT NULL,
    "batchId" text,
    "variantId" text
);


ALTER TABLE public."SaleItem" OWNER TO postgres;

--
-- Name: Shift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shift" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "registerId" text,
    "cashierId" text,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "openedBy" text,
    "openingCash" numeric(12,2) DEFAULT 0 NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "closedBy" text,
    "closingCash" numeric(12,2),
    "actualCash" numeric(12,2),
    "expectedCash" numeric(12,2),
    difference numeric(12,2),
    "cashSales" numeric(12,2),
    "cashRefunds" numeric(12,2),
    "cashWithdrawals" numeric(12,2),
    notes text,
    status text DEFAULT 'OPEN'::text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Shift" OWNER TO postgres;

--
-- Name: Shop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shop" (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    name text NOT NULL,
    description text,
    phone text,
    email text,
    location text,
    logo text,
    currency text DEFAULT 'KES'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    "businessPin" text,
    city text,
    country text,
    "receiptFooter" text,
    "registerName" text DEFAULT 'POS-01'::text NOT NULL,
    timezone text DEFAULT 'Africa/Nairobi'::text NOT NULL,
    website text
);


ALTER TABLE public."Shop" OWNER TO postgres;

--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    "productId" text NOT NULL,
    type public."StockMovementType" NOT NULL,
    quantity integer NOT NULL,
    reason text,
    "referenceId" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "batchId" text,
    direction public."StockMovementDirection" NOT NULL,
    "referenceType" text,
    "runningBalance" integer DEFAULT 0 NOT NULL,
    "shopId" text NOT NULL,
    "variantId" text
);


ALTER TABLE public."StockMovement" OWNER TO postgres;

--
-- Name: Storefront; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Storefront" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    status public."StorefrontStatus" DEFAULT 'DRAFT'::public."StorefrontStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "storeName" text,
    tagline text,
    "heroImageUrl" text,
    "heroImagePublicId" text,
    "logoUrl" text,
    "logoPublicId" text,
    "faviconPublicId" text,
    copyright text,
    "customerCount" integer DEFAULT 0 NOT NULL,
    "yearEstablished" integer,
    "onboardingStep" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Storefront" OWNER TO postgres;

--
-- Name: StorefrontAbout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontAbout" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    title text,
    introduction text,
    story text,
    mission text,
    vision text,
    "values" text,
    "imageUrl" text,
    "imagePublicId" text,
    "secondaryImageUrl" text,
    "secondaryImagePublicId" text,
    "showTeam" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."StorefrontAbout" OWNER TO postgres;

--
-- Name: StorefrontBranding; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontBranding" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    "primaryColor" text DEFAULT '#176B5B'::text NOT NULL,
    "secondaryColor" text DEFAULT '#17252D'::text NOT NULL,
    "accentColor" text DEFAULT '#D6A84F'::text NOT NULL,
    "buttonStyle" text DEFAULT 'rounded'::text NOT NULL,
    radius text DEFAULT 'smooth'::text NOT NULL,
    font text DEFAULT 'inter'::text NOT NULL
);


ALTER TABLE public."StorefrontBranding" OWNER TO postgres;

--
-- Name: StorefrontContact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontContact" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    title text,
    description text,
    phone text,
    "whatsappNumber" text,
    "whatsappMessage" text,
    email text,
    location text,
    address text,
    "mapsUrl" text,
    "openingHours" jsonb,
    "showContactForm" boolean DEFAULT true NOT NULL,
    "showWhatsappBtn" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."StorefrontContact" OWNER TO postgres;

--
-- Name: StorefrontFaq; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontFaq" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StorefrontFaq" OWNER TO postgres;

--
-- Name: StorefrontFeature; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontFeature" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StorefrontFeature" OWNER TO postgres;

--
-- Name: StorefrontFeatured; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontFeatured" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    "productId" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StorefrontFeatured" OWNER TO postgres;

--
-- Name: StorefrontHero; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontHero" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    title text,
    subtitle text,
    description text,
    "primaryText" text,
    "primaryLink" text,
    "secondaryText" text,
    "secondaryLink" text,
    "imageUrl" text,
    "imagePublicId" text,
    "backgroundEnabled" boolean DEFAULT false NOT NULL,
    alignment text DEFAULT 'left'::text NOT NULL,
    show boolean DEFAULT true NOT NULL
);


ALTER TABLE public."StorefrontHero" OWNER TO postgres;

--
-- Name: StorefrontNavItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontNavItem" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    label text NOT NULL,
    href text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StorefrontNavItem" OWNER TO postgres;

--
-- Name: StorefrontSection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontSection" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    section text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."StorefrontSection" OWNER TO postgres;

--
-- Name: StorefrontSeo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontSeo" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    title text,
    description text,
    keywords text,
    "ogImageUrl" text,
    "ogImagePublicId" text,
    "ogTitle" text,
    "ogDescription" text
);


ALTER TABLE public."StorefrontSeo" OWNER TO postgres;

--
-- Name: StorefrontSocial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontSocial" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    facebook text,
    instagram text,
    tiktok text,
    twitter text,
    youtube text,
    linkedin text
);


ALTER TABLE public."StorefrontSocial" OWNER TO postgres;

--
-- Name: StorefrontTestimonial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StorefrontTestimonial" (
    id text NOT NULL,
    "storefrontId" text NOT NULL,
    "customerName" text NOT NULL,
    role text,
    content text NOT NULL,
    "imageUrl" text,
    "imagePublicId" text,
    rating integer DEFAULT 5 NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StorefrontTestimonial" OWNER TO postgres;

--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- Name: TaxRate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaxRate" (
    id text NOT NULL,
    "shopId" text NOT NULL,
    name text NOT NULL,
    rate numeric(5,2) NOT NULL,
    type public."TaxType" DEFAULT 'EXCLUSIVE'::public."TaxType" NOT NULL,
    category public."TaxCategoryType" DEFAULT 'TAXABLE'::public."TaxCategoryType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaxRate" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    role public."UserRole" DEFAULT 'OWNER'::public."UserRole" NOT NULL,
    "shopId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar text,
    "lastLoginAt" timestamp(3) without time zone,
    "registerId" text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "userName" text,
    "roleId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserPermissionOverride; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserPermissionOverride" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "permissionId" text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserPermissionOverride" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "shopId", "userId", action, "entityType", "entityId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
0afc2519-74c3-4ff4-a7ea-d911d7067e3a	\N	\N	USER_REGISTERED	User	c45b3c8c-bb8e-4969-87b2-59a18542003c	\N	::ffff:127.0.0.1	\N	2026-08-28 07:08:35.912
a9ee8be7-54de-412f-b587-f523584910cb	\N	\N	USER_REGISTERED	User	f061112e-5665-4cc5-86c9-6e8d4bbfa3e9	\N	::ffff:127.0.0.1	\N	2026-08-28 07:08:36.06
41255030-1ce3-46cf-bf50-3d8a86d0a539	36e5b1c0-9f50-4000-98bf-9749a3830ff7	c45b3c8c-bb8e-4969-87b2-59a18542003c	STOREFRONT_FAQ_ADDED	StorefrontFaq	607de2b4-4449-45c0-8f5b-e410d5bad267	\N	::ffff:127.0.0.1	\N	2026-08-28 07:08:36.473
0a134043-4148-49bb-8d0b-bc8e07f1c73e	2c0277f0-74d4-4339-aa86-29569c824c2c	f061112e-5665-4cc5-86c9-6e8d4bbfa3e9	STOREFRONT_FAQ_ADDED	StorefrontFaq	2a7d9346-2c63-4f45-bfcd-559ac3576050	\N	::ffff:127.0.0.1	\N	2026-08-28 07:08:36.519
d6f79259-f0b5-4f63-8185-6bb0f102f33a	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera5@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:11:30.254
175dd88b-6a6f-46c5-9cd0-e4ca102299a2	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera8@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:11:39.648
7c8f65e9-3777-41e6-bd18-8ac97bbf01ca	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera8@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:11:41.704
7505b1bd-58ba-466b-8606-80f11095d1ac	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera8@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:11:43.407
302ed87e-c6fd-4c7b-8bb8-c7f6183c77e2	\N	\N	LOGIN_FAILED	\N	\N	{"email": "mamanjeri@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:12:14.146
e2bbfb4c-6fa2-4214-9d9d-6d0b9622e0db	\N	\N	USER_REGISTERED	User	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:12:57.935
87a96b2a-8651-4c92-8612-07fbb7b28135	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	PRODUCT_CREATED	Product	1b93db0a-f068-4987-9eaf-a54b29cff9f4	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 07:38:17.01
271b638a-7cd6-44b2-9473-a9ccb865a760	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UPDATED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:17:25.571
53a4a291-8b64-4801-b18d-fdeb5c81d794	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:19:00.632
db54903e-315a-45e7-b6c2-331e2c5f3220	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOCK_ADDED	Product	1b93db0a-f068-4987-9eaf-a54b29cff9f4	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:24:27.387
f9461e12-eb54-4049-8568-c5ce0f218852	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SALE_CREATED	Sale	681af277-0ac5-4708-8817-dd723ef88d3f	{"total": "11999.84", "source": "POS", "receipt": "DS-000001", "paymentMethod": "CASH"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:24:50.826
fe763f3d-022a-4c35-be1e-4edd363c6577	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	PRODUCT_CREATED	Product	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:27:42.251
cb0ebb4c-41bb-4f06-9e38-5154f80861c0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOCK_ADDED	Product	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 11:28:15.13
4d0095ea-66ee-4632-84e6-fcfa7e0e7b09	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_FAQ_ADDED	StorefrontFaq	815b3d29-9eda-425b-8767-23fc48668d70	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 12:31:00.096
51c57efd-cab2-4fe3-9889-97762d88961d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 12:31:14.731
edb2a085-170e-42ae-bbe3-c8aea88f5e2e	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 12:31:17.392
0840866d-c06f-4e6d-bc73-dfe77889a90d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_BRANDING_UPDATED	StorefrontBranding	de338e86-b703-4318-a21d-af710981a9be	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 12:32:24.11
f471f35a-dfcc-459c-857d-65b2fef8d629	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	PRODUCT_CREATED	Product	3c68b962-78c5-4160-9f3f-411fda842655	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 13:00:42.044
b2af9d8a-8617-43a8-997d-6918932b6b0d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOCK_ADDED	Product	3c68b962-78c5-4160-9f3f-411fda842655	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 13:00:56.186
cd1842f5-0c1d-4906-8f9a-b11e826c58e1	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SALE_CREATED	Sale	cd7ddc0c-6f4b-4174-97ab-f929972d954e	{"total": "20000", "source": "POS", "receipt": "DS-000002", "paymentMethod": "CASH"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 13:07:38.122
7000ddcb-33ca-4b85-8da7-4c580ce93a02	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 13:59:55.1
9085010d-dda6-4d90-ac04-db8b30621009	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 13:59:57.61
4531be47-1e46-4449-a17b-5ab5f25aeba0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_HERO_UPDATED	StorefrontHero	46eb6b09-8be6-4f63-8409-aef3d53a5ba0	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:28:15.316
5591ab12-18f0-47a0-bf77-1e304b5e6ed1	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SECTIONS_UPDATED	StorefrontSection	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:28:26.715
0906df0b-3a85-474f-b652-e7f604ec81d1	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SECTIONS_UPDATED	StorefrontSection	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:28:29.077
6d175ce1-818c-4ea4-b18d-9854010fc606	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SECTIONS_UPDATED	StorefrontSection	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:28:38.119
20c59c95-6c10-4ceb-8c64-212db2890630	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_ABOUT_UPDATED	StorefrontAbout	ddaf454f-8a22-437c-971c-bf73abf6272a	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:40:16.082
eb8334b0-ebaf-4818-b7b8-85e8940551e8	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_TESTIMONIAL_ADDED	StorefrontTestimonial	b4d94fad-e72c-48fe-9402-f6ad58d63c99	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:41:22.375
679be9d8-2c64-405d-8c2c-150abc875d37	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_CONTACT_UPDATED	StorefrontContact	ca5481c3-e5a9-4502-8373-08cce3161f21	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:43:01.711
b59b56ed-5674-46ec-b2d7-2d354646ec9e	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UPDATED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:43:34.737
11c64bc5-1ac0-42cc-9e82-f9afaf275b7d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_TESTIMONIAL_ADDED	StorefrontTestimonial	61953c5e-46d0-4b52-b027-b471ef0fdaeb	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:45:12.363
c15b2aae-f015-4285-9567-401aa955b211	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SOCIAL_UPDATED	StorefrontSocial	9c94f004-4de5-4b3c-b428-e0d94988a335	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:46:05.513
bf1ce3fc-8aa1-4a68-857a-3ba9afb80d29	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_NAVIGATION_UPDATED	StorefrontNavItem	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:46:19.192
944e4751-5a02-4785-aec5-46d10ed9f414	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_FEATURE_ADDED	StorefrontFeature	00595a15-3772-43a9-8ef3-8059377f0f9d	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:47:41.045
723c2017-5fda-4025-aa23-174441947b57	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_FEATURE_ADDED	StorefrontFeature	6c9354ff-05dc-4a32-bd42-1546a0fd13bb	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:49:47.211
e239ee5b-ffff-4de6-ade6-a8220bedbd29	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_FEATURE_ADDED	StorefrontFeature	c5935b5c-e91c-435c-96b4-d258481251b5	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:51:08.588
1edbf919-48de-446d-a7c6-07d9de7ad934	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SOCIAL_UPDATED	StorefrontSocial	9c94f004-4de5-4b3c-b428-e0d94988a335	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:52:33.901
2e92f302-e9bc-43a3-965f-191ea6f59fa1	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_BRANDING_UPDATED	StorefrontBranding	de338e86-b703-4318-a21d-af710981a9be	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:52:42.11
c3eb4b12-205d-4c5c-b68c-f1d581ac555a	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:53:01.151
db9b682e-0173-4f0a-a110-4cbe1f3b30f7	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 16:53:02.731
8c591fad-d7d9-4130-a425-515ce17ab76a	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_SEO_UPDATED	StorefrontSeo	de9442bf-cca6-475c-9884-672e97066cd4	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 17:50:03.811
e773eea0-f525-4347-bd9f-c295f8129046	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 17:50:24.103
bd3ad569-63a6-4e25-9a6f-30db54943bc0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 17:50:26.773
b23e1b97-97a4-4443-976e-c24c7f255629	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 18:09:12.71
734d5673-f57c-4e9d-952e-f16071b3b330	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 18:09:17.148
f11ef39b-c8e7-40d6-9dc1-fcf80d54a456	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SHOP_UPDATED	Shop	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-28 18:10:10.085
172effcd-4ec1-44ed-86f1-3700c4b9c091	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera8@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	2026-08-28 18:18:12.903
896f9163-e548-4543-9d39-b542e3d87618	\N	\N	LOGIN_FAILED	\N	\N	{"email": "collinsodiera8@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	2026-08-28 18:18:31.918
2304aab4-9bb9-4489-8398-3593f5f22eb2	\N	\N	USER_REGISTERED	User	1a5c3b0c-1523-4d0a-886a-8cc0549a417e	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	2026-08-28 18:20:08.143
5fc7d097-5133-4865-b55f-cefdb8a002d2	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	1a5c3b0c-1523-4d0a-886a-8cc0549a417e	STOREFRONT_PUBLISHED	Storefront	06a59353-2622-4a73-8d57-c1612a52668c	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0	2026-08-28 18:20:59.005
ea13722b-e302-47eb-b715-28e6ac32405b	\N	\N	USER_REGISTERED	User	834b38d0-1210-4ce4-8386-d0e70f858ac4	\N	::ffff:127.0.0.1	node	2026-08-29 17:20:08.955
db3d5220-cf3d-4275-a93b-d94a745ac4f7	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	834b38d0-1210-4ce4-8386-d0e70f858ac4	STOREFRONT_HERO_UPDATED	StorefrontHero	b413a005-6df8-4091-a715-344b6d760f52	\N	::ffff:127.0.0.1	node	2026-08-29 17:20:09.202
637b317c-a1d1-4cac-b8cd-a16c784e582e	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	834b38d0-1210-4ce4-8386-d0e70f858ac4	STOREFRONT_PUBLISHED	Storefront	58455a48-85b6-4aba-ae9f-ef2eacdb901d	\N	::ffff:127.0.0.1	node	2026-08-29 17:20:09.227
f0cf3789-a61b-4bc1-b0e4-7ef9829077d9	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 17:35:41.341
1456c05d-6f42-4ec5-8d4b-b84a40144c39	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 17:57:41.451
09151cf3-1880-4d44-a6dd-885f03418e2c	\N	\N	USER_REGISTERED	User	f4086037-8201-4f8f-affb-92feba107e45	\N	::ffff:127.0.0.1	node	2026-08-29 17:57:51.477
8b25ea8a-1d52-41fe-a913-31c91de0b043	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	f4086037-8201-4f8f-affb-92feba107e45	STOREFRONT_HERO_UPDATED	StorefrontHero	b7197ebe-e5fb-419c-9f82-3d61786d6392	\N	::ffff:127.0.0.1	node	2026-08-29 17:57:51.615
97d74f2c-e089-40a7-a4b9-4cc1eef2aec0	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	f4086037-8201-4f8f-affb-92feba107e45	STOREFRONT_PUBLISHED	Storefront	dfec8b0e-a249-4374-b520-e1efec7eb887	\N	::ffff:127.0.0.1	node	2026-08-29 17:57:51.632
19d97004-0642-4af6-a778-69d7e7ded56e	\N	\N	USER_REGISTERED	User	96c6a302-1d3a-4480-9e7e-a6d85a6687f6	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:06.036
c7a9b79e-362c-4e2e-96d9-897e4248c15a	203957bf-5a60-4946-b41a-6d6b0b09dde1	96c6a302-1d3a-4480-9e7e-a6d85a6687f6	STOREFRONT_HERO_UPDATED	StorefrontHero	92b27ab0-8065-4e04-b410-b4967fc76dea	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:06.15
aeeb8554-d3f3-40de-9ad9-bcf5c8171e93	203957bf-5a60-4946-b41a-6d6b0b09dde1	96c6a302-1d3a-4480-9e7e-a6d85a6687f6	STOREFRONT_PUBLISHED	Storefront	f325c639-1d17-4bc0-8936-fad99fbac0da	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:06.178
bb0b9e59-5f9b-4450-a479-30b361a0c0cb	\N	\N	USER_REGISTERED	User	846b74bf-d3fd-408c-9cd9-8565b3892462	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:06.443
84dc7413-63c8-483f-9196-e917c44ce08d	\N	\N	USER_REGISTERED	User	55595391-0893-4040-aeef-93b9eb1f2d37	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:32.642
c46170ee-783d-44cd-9931-518644129cf2	f158f2aa-2ccf-4df2-ba92-9d188edd231c	55595391-0893-4040-aeef-93b9eb1f2d37	STOREFRONT_HERO_UPDATED	StorefrontHero	ec018104-6af6-4267-8416-005432e8ea4f	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:32.726
66668c08-3060-498e-97a0-c3b04e6b3b97	f158f2aa-2ccf-4df2-ba92-9d188edd231c	55595391-0893-4040-aeef-93b9eb1f2d37	STOREFRONT_PUBLISHED	Storefront	12064b33-d854-41b9-b18f-259169376d3c	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:32.751
d3a998b9-0ab9-4e3b-a5b0-deca0e6169f4	\N	\N	USER_REGISTERED	User	4cb8b109-fab6-4622-8685-a5d7e4c29ec4	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:33.127
efb2c815-3087-4916-ba65-bd12b63dc5da	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	4cb8b109-fab6-4622-8685-a5d7e4c29ec4	STOREFRONT_HERO_UPDATED	StorefrontHero	fc0a30be-c9f4-46a6-b13c-80c20e947674	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:33.179
982896d9-5e8c-4c39-a99b-37bb9852d5a2	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	4cb8b109-fab6-4622-8685-a5d7e4c29ec4	STOREFRONT_PUBLISHED	Storefront	0cdc5f31-532d-4cf9-9540-775b011e0f8b	\N	::ffff:127.0.0.1	node	2026-08-29 17:58:33.192
02f1d709-2f4f-4e9f-b3cc-f1e9d7c6ae2a	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	0448f2d0-ab11-46bc-8494-31069e986c1f	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:00:35.935
b0e76eab-c573-4370-a843-139e593a10bf	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	0448f2d0-ab11-46bc-8494-31069e986c1f	{"status": "PENDING"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:00:38.516
de744a8a-160c-42e7-89f0-31af240a6f60	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	0448f2d0-ab11-46bc-8494-31069e986c1f	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:00:43.064
af577e87-13ad-46f0-83a1-b1850ceb5c2a	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	0448f2d0-ab11-46bc-8494-31069e986c1f	{"status": "PROCESSING"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:00:45.003
5aa97542-7bd1-4811-a5d7-f3d25c01948f	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_BRANDING_UPDATED	StorefrontBranding	de338e86-b703-4318-a21d-af710981a9be	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:01:43.664
fdbfcd08-b748-4d6e-ab34-4b902574ecb8	\N	\N	USER_REGISTERED	User	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-29 18:41:50.095
779e4d1c-d9ca-4f11-b647-0614e9eca75d	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	PRODUCT_CREATED	Product	5a8d817a-cba8-444b-82d9-8af5a6595028	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 17:36:21.673
8058c5b7-25db-4478-bf71-c4dde23b4a14	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	STOCK_ADDED	Product	5a8d817a-cba8-444b-82d9-8af5a6595028	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 17:36:37.866
372baccd-e444-42b3-a8ca-0652fb536f65	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	ORDER_STATUS_UPDATED	Order	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 17:41:24.611
e2a68da0-f614-432d-8382-508f146e7217	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	ORDER_STATUS_UPDATED	Order	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	{"status": "PROCESSING"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 17:41:27.749
d3556b47-46ae-4331-b7ff-987e34f1dd37	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	ORDER_STATUS_UPDATED	Order	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:12:58.539
1d4ffd51-6f99-4ce5-b0d2-ad8c79f67e62	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	ORDER_STATUS_UPDATED	Order	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	{"status": "COMPLETED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:13:12.54
f796600a-115b-4455-a601-cb98b31c9d2a	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	CATEGORY_CREATED	Category	8aecd492-feb2-4800-b8dd-5493460a5cfa	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:33:28.352
0d1817e1-1497-46d3-bbab-da92f63e163c	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	CATEGORY_DELETED	Category	8aecd492-feb2-4800-b8dd-5493460a5cfa	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:34:20.316
59b8d557-3dce-4f8f-8b99-1f57486ddb1a	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	STOREFRONT_BRANDING_UPDATED	StorefrontBranding	efafe7a6-322b-4736-9e22-e5845f8da7f0	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:50:24.982
142e8c40-6883-4578-b097-7ed713482488	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SALE_CREATED	Sale	1798204a-d553-4d67-8a8e-4707f9e321ff	{"total": "7900", "source": "POS", "receipt": "DS-000003", "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:52:49.46
3e642da5-2da4-4de8-925b-0678eb995600	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SALE_CREATED	Sale	52430f28-31a2-4614-81b8-34c936cb74d6	{"total": "7900", "source": "POS", "receipt": "DS-000004", "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 18:57:12.973
7af4c3d2-6261-4c5e-a1e1-8ec8cb1fa776	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SALE_CREATED	Sale	12eeff31-df81-4ed4-8eb0-142f5b76e86b	{"total": "7900", "source": "POS", "receipt": "DS-000005", "paymentMethod": "OTHER", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:18:14.58
6612953b-5f4e-4473-a153-bdb71cf7344d	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SHOP_UPDATED	Shop	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:18:45.925
a10c16cb-57d4-4fcb-be64-c44441d8cd4e	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SALE_CREATED	Sale	83ec6a52-93e0-4f79-881c-323bb940aad5	{"total": "7900", "source": "POS", "receipt": "DS-000006", "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:19:20.326
2a056a6b-6de7-436d-b4a0-0b67dbdbd3f1	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	SALE_CREATED	Sale	c3bc07e2-99f6-47a7-b21e-b4f3cf291cb6	{"total": "7890", "source": "POS", "receipt": "DS-000007", "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:20:30.232
dc56d7b5-ae79-466c-98bc-08ef5d2c0210	20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	STAFF_CREATED	User	fa2413b2-aaab-43af-93ee-a6c39faac026	{"name": "jeremiah odiero", "role": "CASHIER", "memberId": "fa2413b2-aaab-43af-93ee-a6c39faac026"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:34:07.033
85941044-5e2d-45a4-b0ef-3e98002056da	\N	\N	LOGIN_SUCCESS	User	fa2413b2-aaab-43af-93ee-a6c39faac026	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:35:14.367
b7ba71d4-aea9-4508-99ff-348ceaf3acb0	\N	\N	LOGIN_SUCCESS	User	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-30 19:36:22.004
27aa480b-f552-4710-b8ce-3b283684c2e5	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:25:20.824
f1796539-0733-49f3-b4c0-7c8f508cdb4e	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:25:50.957
697445ee-ef3f-45da-a60a-8c1fbf8dba9d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	REGISTER_CREATED	Register	05d3eb3e-868d-43f5-99eb-856875110e39	{"name": "front counter"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:44:46.712
e0c34520-fa55-4b5c-b12a-6393c49216cf	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STAFF_CREATED	User	8931ae96-07d9-4f2e-bde6-c48d5ffa3e47	{"name": "mary adhiambo", "role": "CASHIER", "roleId": null, "memberId": "8931ae96-07d9-4f2e-bde6-c48d5ffa3e47"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:48:03.198
3a823fda-b653-48b3-ad38-937b9b0f1356	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STAFF_CREATED	User	edce4d0b-932b-4cfc-b5b9-5cafc2c81588	{"name": "mary andee", "role": "CASHIER", "roleId": null, "memberId": "edce4d0b-932b-4cfc-b5b9-5cafc2c81588"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:49:10.329
6e2ce64e-dd51-4c1f-a707-f04494c84707	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STAFF_CREATED	User	17202f24-d0d5-45e7-a07c-a498fedb81ec	{"name": "mary ndee", "role": "CASHIER", "roleId": null, "memberId": "17202f24-d0d5-45e7-a07c-a498fedb81ec"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-08-31 19:50:42.612
3f55f739-0a3f-4e6d-971f-78fca40dd6f6	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 15:26:25.608
12d526f2-0922-4b62-a301-70168472f5cd	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SALE_CREATED	Sale	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	{"total": "30279.75", "source": "POS", "receipt": "DS-000008", "paymentMethod": "CARD", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 16:12:16.506
0ae996c6-0a70-4581-a0ce-a987c50a5230	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	0448f2d0-ab11-46bc-8494-31069e986c1f	{"status": "CANCELLED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 16:16:32.374
81f6b84f-2a93-46c5-8902-1fb394436880	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	CATEGORY_CREATED	Category	c4d1e560-dd0a-4cd8-b549-834ca2f80f2c	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 18:12:03.848
133b6942-a8ca-4332-ad41-c96bb1fb5772	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	PRODUCT_CREATED	Product	cc0522da-392e-4a22-8582-6734053a3d10	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 18:39:50.393
2d3e6376-060e-45ea-a33a-44a7f644d25d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOCK_ADDED	Product	cc0522da-392e-4a22-8582-6734053a3d10	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 18:40:01.22
9e434052-b0db-4fe3-bd76-1ab70fde557c	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	RETURN_CREATED	Return	23c9cc4b-5aa4-46c3-9169-3712a2689c43	{"sale": "cd7ddc0c-6f4b-4174-97ab-f929972d954e", "refundAmount": "20000", "returnNumber": "RT-000001", "requiresApproval": false}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 18:49:35.328
82f44599-3733-43c7-b1b1-ccb4e0cbe4ec	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SALE_CREATED	Sale	770c399d-2594-4949-bc4d-e4f085ef1387	{"total": "14439.26", "source": "POS", "receipt": "DS-000009", "paymentCount": 1, "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-01 19:51:21.342
02382463-e133-4ba0-9da2-915ad86bdce6	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_PUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:10:22.641
07639b1b-1f21-46d5-8f65-e8a8e048df6d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	STOREFRONT_UNPUBLISHED	Storefront	a39ec761-b5f0-4d0e-8fa1-8157c489a483	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:10:26.691
37358ebd-1342-4990-962f-c4e869f65b2f	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	3b7b7620-2476-476b-b2ee-db2b7b7500db	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:13:23.191
6a1351fc-d641-4b62-82ad-84d83048f4f2	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	3b7b7620-2476-476b-b2ee-db2b7b7500db	{"status": "PROCESSING"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:13:25.019
87483195-2c6c-4de1-9e44-3f642127aa03	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	3b7b7620-2476-476b-b2ee-db2b7b7500db	{"status": "CONFIRMED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:13:31.41
bd4d2bcc-55f7-40de-9af9-2286a9cc4a73	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	ORDER_STATUS_UPDATED	Order	3b7b7620-2476-476b-b2ee-db2b7b7500db	{"status": "COMPLETED"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:13:35.448
20d1f78f-1e81-40dc-b406-37857d057926	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	SALE_CREATED	Sale	b83d1961-c7a7-4f31-b4c7-8e1e375ba1ec	{"total": "119.98", "source": "POS", "receipt": "DS-000010", "paymentCount": 1, "paymentMethod": "CASH", "paymentStatus": "PAID"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 17:14:13.327
71b1fbe6-e361-49e9-b8fc-62ec24695061	\N	\N	LOGIN_FAILED	\N	\N	{"email": "none@test.com"}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.2538	2026-09-02 17:17:49.646
c9596e69-4335-4768-ae8d-b9a5ab65b747	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	CATEGORY_CREATED	Category	6f4776e5-a8d2-4120-830c-0dde5ed815aa	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	2026-09-02 18:03:54.42
\.


--
-- Data for Name: Batch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Batch" (id, "shopId", "productId", "variantId", "batchNumber", "supplierId", "purchaseId", "manufacturingDate", "expiryDate", "quantityReceived", "quantityRemaining", "costPerUnit", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CashMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CashMovement" (id, "shopId", "shiftId", "registerId", type, amount, "referenceType", "referenceId", description, "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, "shopId", name, "createdAt", "updatedAt") FROM stdin;
c5a86d0e-5d38-4226-9d26-fe41fb4fcd06	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Food	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
79036bb6-7382-4bee-b7bc-8858119800d8	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Drinks	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
aae7fbef-166d-4008-a5ad-f3c03e43888d	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Dairy	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
a17be2a1-9221-45c4-a9ce-df6106379592	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Bakery	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
29da95ad-691e-4fb7-aa46-73188a588203	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Household	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
0f7c4335-0e34-4195-bf2a-cb413884be20	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Personal Care	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
abcf0edb-0ec4-4a0c-9e62-c134d66fbaa7	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Electronics	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
3054d70a-6cec-4343-a221-9c251c7d3cb5	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Stationery	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
13216050-60d1-4027-911e-cd20765725ea	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Hardware	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
4a5cb22b-ae29-4b86-aef7-2faba472c4bd	36e5b1c0-9f50-4000-98bf-9749a3830ff7	Other	2026-08-28 07:08:35.897	2026-08-28 07:08:35.897
c433eb52-2380-40e2-a23b-f978756c8e8d	2c0277f0-74d4-4339-aa86-29569c824c2c	Food	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
2dcfc0ed-17be-4e47-94bc-f91307599427	2c0277f0-74d4-4339-aa86-29569c824c2c	Drinks	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
40321f3e-2f6d-4a07-940b-c932f970da79	2c0277f0-74d4-4339-aa86-29569c824c2c	Dairy	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
da186f00-cdb6-4535-9c23-dc4118b3a4f3	2c0277f0-74d4-4339-aa86-29569c824c2c	Bakery	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
6a0959ab-be01-43eb-9d49-8e1d590bc7b7	2c0277f0-74d4-4339-aa86-29569c824c2c	Household	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
199c5410-5b7b-4c4c-9b78-b9b91dd98b18	2c0277f0-74d4-4339-aa86-29569c824c2c	Personal Care	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
ac02c7fe-42a7-4278-9887-df91a27de967	2c0277f0-74d4-4339-aa86-29569c824c2c	Electronics	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
8455fd42-5ee5-4e96-9d95-b78aa7e799e4	2c0277f0-74d4-4339-aa86-29569c824c2c	Stationery	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
48985f84-f860-4814-b9e6-ec369ca6a178	2c0277f0-74d4-4339-aa86-29569c824c2c	Hardware	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
59480600-17bd-4b9b-8b8c-a5eb9c523970	2c0277f0-74d4-4339-aa86-29569c824c2c	Other	2026-08-28 07:08:36.037	2026-08-28 07:08:36.037
6ef8ddcc-271d-401e-a7ac-9ea31fc24b61	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Food	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
84fbaf6f-e86e-4d2a-bfd6-8a42e88c5ca7	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Drinks	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
13dd75e8-d0f9-41b1-b946-d4a0ee426ca3	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Dairy	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
220d86fd-156d-4f24-add5-967d2a755590	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Bakery	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
9445eb1a-3539-4116-aceb-b2233d88b187	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Household	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
64745bf2-8069-41b5-8429-ae585d219f89	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Personal Care	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
5edb2284-ce23-4bb7-9f49-7d0c2edfcbfa	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Electronics	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
95da7333-cbfa-4bf6-9a81-1fb52e16e563	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Stationery	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
8c30e064-dcbd-40ac-9777-c57ae814e83d	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Hardware	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
34ff9de2-89d5-44fe-ba94-e03b13a87b77	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Other	2026-08-28 07:12:57.896	2026-08-28 07:12:57.896
3effd9c6-b806-45e8-93e1-aa6b3c78300a	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Food	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
faad4842-5fd5-439e-92bc-722d3d83df7f	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Drinks	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
a46c34ad-4806-4a3a-889e-23c8d9ca0eeb	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Dairy	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
54f4700c-13e3-4389-b187-8d8b40913e68	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Bakery	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
cf3e59cb-8c95-4e73-abff-1fc1ff49428b	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Household	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
94379f63-3da0-41f2-bf32-394226795cb6	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Personal Care	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
0419cecb-da98-4d26-8ce3-87d22dd39160	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Electronics	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
5e8fb55b-e397-4c52-9259-50870da18c99	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Stationery	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
d6e4a66e-9d04-4139-9145-8cfad4a441cc	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Hardware	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
4b5c668c-e2cd-460a-99c8-4786850b27b1	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	Other	2026-08-28 18:20:08.105	2026-08-28 18:20:08.105
f02f616d-6ce2-4c11-ae64-7755df1829f4	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Food	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
2d3fdb92-ef7a-4b00-9c44-549ccf74b8f6	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Drinks	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
91a44e75-77c1-42a5-9a65-1b4731544724	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Dairy	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
87d67b9c-09b2-4862-8df0-01dd62d61239	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Bakery	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
bad70ea0-7b0c-4abb-818f-2e34aaaf6aad	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Household	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
3b8bc85d-9d7a-4c6b-9f5f-392d3086b242	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Personal Care	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
f911279e-312c-45bb-9064-6104ce1afc5f	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Electronics	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
5b17b0a2-731a-4520-834d-4eb3be9cb06f	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Stationery	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
8c29195a-2548-4579-b267-ec2ad5df3805	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Hardware	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
6df7dfe6-dbd6-4cfd-8589-448cae635f86	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	Other	2026-08-29 17:20:08.902	2026-08-29 17:20:08.902
e1890964-dbfb-482f-baf0-f3848fa041ca	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Food	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
2973cafb-c283-46e4-8e99-ea6fc38dfead	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Drinks	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
a8015254-f1a1-4047-a958-18aad5079d9e	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Dairy	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
4ce08ab9-8a45-42a5-9dca-95d9b1153324	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Bakery	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
b21be9a5-13d7-4c91-8b5f-a9a64d7d4106	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Household	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
b0cfa2a6-0675-4efe-8c75-efdb3446d936	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Personal Care	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
54691551-73af-408b-8bb9-f1ec2fb69242	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Electronics	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
15675ba9-671f-44c9-9430-f61c4cbbe873	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Stationery	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
94a59dec-87f9-43e4-ab54-55d2c7e0a400	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Hardware	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
6e7d7624-3096-44db-8868-d2261134eb7c	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	Other	2026-08-29 17:57:51.46	2026-08-29 17:57:51.46
22dae207-09a6-42bd-8b8a-9f46904f94b9	203957bf-5a60-4946-b41a-6d6b0b09dde1	Food	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
d6a9db17-3540-4d0e-bb57-77dae6ce5dcf	203957bf-5a60-4946-b41a-6d6b0b09dde1	Drinks	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
e62a6379-80b3-42ac-98b4-909c56583dec	203957bf-5a60-4946-b41a-6d6b0b09dde1	Dairy	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
a4560786-79bf-4f18-8eac-50b5a2809850	203957bf-5a60-4946-b41a-6d6b0b09dde1	Bakery	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
776c1f3e-cca0-4056-8164-57a4bd743e30	203957bf-5a60-4946-b41a-6d6b0b09dde1	Household	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
59c187dd-b340-415c-a3c2-45c153bd0e63	203957bf-5a60-4946-b41a-6d6b0b09dde1	Personal Care	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
61a80002-f29c-4674-9f8b-74e1072e5ac8	203957bf-5a60-4946-b41a-6d6b0b09dde1	Electronics	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
9dd0f2ce-1bbb-4c71-919f-7b867c4c2459	203957bf-5a60-4946-b41a-6d6b0b09dde1	Stationery	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
71b60c4d-832d-45eb-a853-3b282f2cd52e	203957bf-5a60-4946-b41a-6d6b0b09dde1	Hardware	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
bef43cc1-c994-40a6-99a8-8d610ac9c2be	203957bf-5a60-4946-b41a-6d6b0b09dde1	Other	2026-08-29 17:58:06.029	2026-08-29 17:58:06.029
68bfb219-1a68-47b5-94f6-371d9378bc95	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Food	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
3a36e32f-79ff-4d8b-9e99-01684d22075c	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Drinks	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
9ea31807-2796-460f-806c-6f9271b332bc	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Dairy	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
08a1643d-0606-4986-81c6-f76d2bf1ab85	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Bakery	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
14d96426-b3b1-4d6f-9173-3d6b2022ceb5	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Household	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
70d0368e-8361-42ca-a2dd-76689e5f2113	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Personal Care	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
dd197143-548e-4122-94d9-7ac137837b88	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Electronics	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
218cfb69-3aef-46d4-ab9d-b639b0f68594	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Stationery	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
14c7e593-6474-4f15-90b3-ac59429a9ae8	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Hardware	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
c4413b37-6b46-4f52-b5b1-09b623b3c15f	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	Other	2026-08-29 17:58:33.104	2026-08-29 17:58:33.104
efcb6c99-7c8e-46a9-b200-ed64e3159beb	1888feee-4c42-4668-920c-8a963bd24121	Food	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
aa8c04cd-4f45-401c-8d1a-4878db24bd11	1888feee-4c42-4668-920c-8a963bd24121	Drinks	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
4966d781-16c4-4316-8959-08287e4ad97e	1888feee-4c42-4668-920c-8a963bd24121	Dairy	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
413af7f6-7453-4522-a5d2-cea93c5e1c2c	1888feee-4c42-4668-920c-8a963bd24121	Bakery	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
d4732142-e6e4-4322-9ccc-fbf3a373c21e	1888feee-4c42-4668-920c-8a963bd24121	Household	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
45148a27-3120-4321-aced-642c1cbb6c85	1888feee-4c42-4668-920c-8a963bd24121	Personal Care	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
ab5b7121-651b-414c-b4cf-a58a259711e6	1888feee-4c42-4668-920c-8a963bd24121	Electronics	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
5afbd384-3a6b-424f-bbb4-01abc4674217	1888feee-4c42-4668-920c-8a963bd24121	Stationery	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
82c6bbfc-1bc4-49d7-909f-b279309de187	1888feee-4c42-4668-920c-8a963bd24121	Hardware	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
81340bab-3aef-406e-8695-403c76e447f1	1888feee-4c42-4668-920c-8a963bd24121	Other	2026-08-29 17:58:06.408	2026-08-29 17:58:06.408
c6157a6a-73bf-45de-a66d-76fbdff7c4b2	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Food	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
73a2461c-e4f0-4e5b-97ff-ba0f830b78dd	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Drinks	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
cab2b555-7b74-4981-b83d-ad07316c391e	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Dairy	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
1064b2cc-d71e-4547-8046-1b450d5edb7f	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Bakery	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
92106225-a741-428b-bcf1-1b3232da62bb	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Household	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
843508da-b0a9-4bd7-8b72-ab1ab805e237	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Personal Care	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
e0e96aa4-589e-4c65-aa8b-bb58c1c7fd13	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Electronics	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
7d093695-e63c-4282-84ac-b5c5ac5803fe	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Stationery	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
62b67adc-19f5-4240-ab1e-fd0c993f6684	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Hardware	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
2747d613-d073-46f4-ad18-129e009659ed	f158f2aa-2ccf-4df2-ba92-9d188edd231c	Other	2026-08-29 17:58:32.637	2026-08-29 17:58:32.637
c61060e3-e327-49e1-a77b-c29002f2d70e	20a7d3bf-dbe3-452c-8e41-889f793ba205	Food	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
ae96fa0b-d638-470c-b296-6e9aae85867b	20a7d3bf-dbe3-452c-8e41-889f793ba205	Drinks	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
3435187b-1691-42db-902e-6f32403a41c7	20a7d3bf-dbe3-452c-8e41-889f793ba205	Dairy	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
708476a8-a91d-4900-abf2-0f47e10d2ebb	20a7d3bf-dbe3-452c-8e41-889f793ba205	Bakery	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
9849af15-95ed-4084-8570-0251aef05b34	20a7d3bf-dbe3-452c-8e41-889f793ba205	Household	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
ed476e2e-f949-4cf9-8c9f-ffbcab927f24	20a7d3bf-dbe3-452c-8e41-889f793ba205	Personal Care	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
4cb158d8-e0da-4b69-b763-2541a716a3fb	20a7d3bf-dbe3-452c-8e41-889f793ba205	Electronics	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
95a2b4dd-8056-404d-80b6-80cb09d963c8	20a7d3bf-dbe3-452c-8e41-889f793ba205	Stationery	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
1f1030a9-49ba-44d0-aed7-fbdb410cfa56	20a7d3bf-dbe3-452c-8e41-889f793ba205	Hardware	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
341a35af-2b7b-4e3d-ab9d-24f74d189101	20a7d3bf-dbe3-452c-8e41-889f793ba205	Other	2026-08-29 18:41:50.064	2026-08-29 18:41:50.064
c4d1e560-dd0a-4cd8-b549-834ca2f80f2c	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	sports	2026-09-01 18:12:03.773	2026-09-01 18:12:03.773
6f4776e5-a8d2-4120-830c-0dde5ed815aa	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	snacks	2026-09-02 18:03:54.359	2026-09-02 18:03:54.359
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, "shopId", name, phone, email, address, notes, "createdAt", "updatedAt") FROM stdin;
0a8ed34e-f6c8-49f6-a347-b163ee274088	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Collins Odiera	0715519158	collinsodiera8@gmail.com	maili saba	\N	2026-08-29 17:59:45.757	2026-08-29 17:59:45.757
358feea1-840a-47dd-b6ed-e62eaeab771d	20a7d3bf-dbe3-452c-8e41-889f793ba205	Collins Odiera	0715519158	collinsodiera8@gmail.com	maili saba	\N	2026-08-30 17:40:15.129	2026-08-30 17:40:15.129
d1346ba1-ade2-4402-9d46-3ef9fb203151	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Alpha doe	0799620923	\N	\N	\N	2026-09-02 17:12:52.019	2026-09-02 17:12:52.019
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, "shopId", category, description, amount, "expenseDate", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: Invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invitation" (id, "shopId", "roleId", "fullName", email, token, status, "expiresAt", "acceptedAt", "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "shopId", title, message, type, read, "createdAt") FROM stdin;
66d762ca-7a28-433f-a1b9-71c740c7fdb4	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	New online order	Order ORD-000001 · Collins Odiera · 2 item(s)	order	t	2026-08-29 17:59:45.823
2700fc93-c691-4aae-a503-4277359a3e0b	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	POS machine is running low. Only 29 remaining (threshold 5).	low_stock	t	2026-08-28 13:07:38.133
63aac9a1-23f6-403b-9358-e497198212cf	20a7d3bf-dbe3-452c-8e41-889f793ba205	New online order	Order ORD-000002 · Collins Odiera · 1 item(s)	order	f	2026-08-30 17:40:15.17
6b10bc84-aa71-4ab5-a7db-db88db800e4f	20a7d3bf-dbe3-452c-8e41-889f793ba205	Low stock	Sub woofer is running low. Only 17 remaining (threshold 5).	low_stock	f	2026-08-30 18:52:49.473
aa99671c-d475-4d95-b9df-d797c8091105	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	POS machine is running low. Only 28 remaining (threshold 5).	low_stock	t	2026-09-01 16:12:16.524
ff471025-35d1-4d27-8d8d-861411b8f3ad	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	JBL headphones is running low. Only 198 remaining (threshold 3).	low_stock	t	2026-09-01 16:12:16.528
26ddd54f-304f-4e0f-9a58-2cf682d8db12	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	phone is running low. Only 197 remaining (threshold 5).	low_stock	t	2026-09-01 16:12:16.519
b27bb2df-e6f1-4bfe-8b4d-4911142f2d3a	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	JBL headphones is running low. Only 194 remaining (threshold 3).	low_stock	f	2026-09-01 19:51:21.458
d1d31f7c-9893-4bd5-9d95-c4a88688e337	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	Low stock	velvet cake is running low. Only 19 remaining (threshold 10).	low_stock	f	2026-09-01 19:51:21.572
2f023cc7-6462-40d1-b1a9-e0599370c405	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	New online order	Order ORD-000003 · Alpha doe · 1 item(s)	order	t	2026-09-02 17:12:52.085
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "shopId", "orderNumber", source, status, "customerId", "customerName", "customerPhone", "customerEmail", "deliveryAddress", notes, subtotal, discount, "totalAmount", "paymentMethod", "createdBy", "createdAt", "updatedAt") FROM stdin;
d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	20a7d3bf-dbe3-452c-8e41-889f793ba205	ORD-000002	ONLINE	COMPLETED	358feea1-840a-47dd-b6ed-e62eaeab771d	Collins Odiera	0715519158	collinsodiera8@gmail.com	maili saba	contact me on arriva	23700.00	0.00	23700.00	CASH	\N	2026-08-30 17:40:15.141	2026-08-30 18:13:12.523
0448f2d0-ab11-46bc-8494-31069e986c1f	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	ORD-000001	ONLINE	CANCELLED	0a8ed34e-f6c8-49f6-a347-b163ee274088	Collins Odiera	0715519158	collinsodiera8@gmail.com	maili saba	leave at mama njeri shop I will pick it from there	12279.75	0.00	12279.75	CASH	\N	2026-08-29 17:59:45.775	2026-09-01 16:16:32.36
3b7b7620-2476-476b-b2ee-db2b7b7500db	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	ORD-000003	ONLINE	COMPLETED	d1346ba1-ade2-4402-9d46-3ef9fb203151	Alpha doe	0799620923	\N	Maili saba	\N	359.94	0.00	359.94	MPESA	\N	2026-09-02 17:12:52.023	2026-09-02 17:13:35.446
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, "unitPrice", "buyingPrice", subtotal, profit, "variantId") FROM stdin;
2dee85b4-61a0-4e06-bca8-8acc40efb484	0448f2d0-ab11-46bc-8494-31069e986c1f	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	1	279.91	200.00	279.91	79.91	\N
59a51eaf-3e40-46e4-8f3a-bafd3b12b9af	0448f2d0-ab11-46bc-8494-31069e986c1f	1b93db0a-f068-4987-9eaf-a54b29cff9f4	1	11999.84	9000.00	11999.84	2999.84	\N
404dd9b2-20ae-4e5c-b0a6-b5427cce3b94	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	5a8d817a-cba8-444b-82d9-8af5a6595028	3	7900.00	7000.00	23700.00	2700.00	\N
5bc080b1-105d-434b-bff1-5f5e2975bfb4	3b7b7620-2476-476b-b2ee-db2b7b7500db	cc0522da-392e-4a22-8582-6734053a3d10	3	119.98	80.00	359.94	119.94	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "shopId", "saleId", "paymentMethod", amount, reference, status, "registerId", "createdById", "createdAt") FROM stdin;
3982f0f7-3181-4601-91c7-f3757701d1e9	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	770c399d-2594-4949-bc4d-e4f085ef1387	CASH	15000.00	\N	PAID	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 19:51:21.105
8cbdb926-ac67-40fd-bdc9-4025689f5de2	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b83d1961-c7a7-4f31-b4c7-8e1e375ba1ec	CASH	119.98	\N	PAID	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-02 17:14:13.264
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" (id, key, name, "group", description, "sortOrder") FROM stdin;
f86e538e-79fc-414e-aafe-f1c72f99ca29	pos.resume	Resume Sale	POS	\N	4
fe8e3c00-32bd-49ea-99cf-eecd0d0ef07a	pos.cancel	Cancel Own Sale	POS	\N	5
8dc97989-3981-4999-98d0-944ef6807ed3	pos.print_receipt	Print Receipt	POS	\N	6
3867ec92-776e-4dbe-9fcf-670c16696c74	pos.reprint_own	Reprint Own Receipt	POS	\N	7
958faecb-1edf-4bf6-9cd4-57e3f41b1d24	pos.reprint_any	Reprint Any Receipt	POS	\N	8
95666226-4f9c-44cc-81b6-b7c42565ed73	pos.discount	Apply Discount	POS	\N	9
13b1e035-0ec5-4981-ae9b-3d3f32a81a8d	sales.view	View Own Sales	Sales	\N	11
b9b92519-8590-4a83-bfca-052cfe4fe61e	sales.view_all	View All Sales	Sales	\N	12
f2a1be6f-1d02-482f-a599-f0a7c9608576	sales.create	Create Sale	Sales	\N	13
70f636a2-c587-4391-ba46-3dbc588d6fe1	sales.edit	Edit Sale	Sales	\N	14
e6da66bf-2f8e-4764-b60b-346d008322ef	sales.void	Void Sale	Sales	\N	15
5a01abb5-e8d2-4dc6-86ee-a5b8c1a0b1cd	sales.refund	Refund Sale	Sales	\N	16
dff0830b-5078-47f6-af8f-769df4b7101d	sales.approve_refund	Approve Refund	Sales	\N	17
2f7ac216-e013-43af-9dcf-843ca8038a8a	sales.export	Export Sales	Sales	\N	18
562e4885-eeab-4c47-bebb-963276633e56	products.view	View Products	Products	\N	19
6e2cf21a-d254-47e5-9031-d4865209f070	products.create	Add Product	Products	\N	20
bec38823-2040-4ad9-8280-0a79085f66a1	products.edit	Edit Product	Products	\N	21
bb7bfed6-a65a-4172-a3e6-8679a0752bec	products.delete	Delete Product	Products	\N	22
417adbad-a7f4-4bfe-92ea-910f0f159468	products.import	Import Products	Products	\N	23
9316b1d4-7257-43cc-971f-9e175b5a03e6	products.export	Export Products	Products	\N	24
73277844-5281-4ab2-b260-7d02d9278301	products.discount	Discount Products	Products	\N	26
91e90afa-a222-4405-8f84-4e5a5c44950e	products.override_price	Override Price	Products	\N	27
32e7e580-f8bf-4cf3-9abc-4eaa95d342dd	categories.view	View Categories	Categories	\N	28
be2d46fd-82f0-47e1-867f-3123cf493e9c	categories.create	Create Categories	Categories	\N	29
bb60a8a3-a965-4b0e-9328-ee0f5b95bc05	categories.edit	Edit Categories	Categories	\N	30
aa721d87-df96-46c1-a244-c4e975c7c9f8	categories.delete	Delete Categories	Categories	\N	31
4c3383ec-a483-43af-92a2-be5699bfd64f	suppliers.view	View Suppliers	Suppliers	\N	32
df514aa5-085e-4875-ad6c-ff1d372a69af	suppliers.create	Create Suppliers	Suppliers	\N	33
7c51a5fd-d599-40fd-80f5-fb8f00fdf8e5	suppliers.edit	Edit Suppliers	Suppliers	\N	34
c38ac27f-4292-4550-90f3-d0becdd901e9	suppliers.delete	Delete Suppliers	Suppliers	\N	35
56cf4c14-1e30-456a-90aa-7f15183fa264	inventory.view	View Stock	Inventory	\N	36
aa9eba08-159b-4bee-b3fa-351dbb45a565	inventory.adjust	Adjust Stock	Inventory	\N	37
25748faa-fe71-4c16-9654-f67af6a39f5c	inventory.receive	Receive Stock	Inventory	\N	38
ac5e7c9b-f1b0-45ad-9cfb-ffb7d1629ff5	inventory.transfer	Transfer Stock	Inventory	\N	39
cbfa7e64-962a-4b0f-b838-265b2eacd7f6	inventory.writeoff	Write Off Stock	Inventory	\N	40
77aae31b-6864-4829-8782-389467299c98	customers.view	View Customers	Customers	\N	42
159009ee-5fc3-480e-bbe7-565f0485a21c	customers.create	Add Customer	Customers	\N	43
fb3af26b-cbdf-496c-8a7e-f31eaaedc977	customers.edit	Edit Customer	Customers	\N	44
dab6b91a-bc08-40a9-adbb-092629595f98	customers.delete	Delete Customer	Customers	\N	45
5935096c-28fe-4bc8-9a70-12d271ebc18e	purchases.view	View Purchases	Purchases	\N	46
a644c575-08f0-46fa-b9bc-42f653db1408	purchases.create	Create Purchase	Purchases	\N	47
b5686b7c-1e9a-49d7-b710-2fd956399b92	purchases.edit	Edit Purchase	Purchases	\N	48
ecccceb0-8e59-4eec-9413-3f5bbc1ce619	purchases.delete	Delete Purchase	Purchases	\N	49
d2c081c4-6870-4bef-bd26-eeb025043171	orders.view	View Orders	Orders	\N	50
53473a8e-702b-4407-81fd-5716a3d7ab37	orders.update	Update Order Status	Orders	\N	51
270a2e52-7821-409c-ba2d-d148c09120aa	reports.view	View Reports	Reports	\N	52
720e52b4-2617-4f3e-af08-9d250ccee3dc	reports.sales	View Sales Reports	Reports	\N	53
68bfe478-f759-4117-bfe8-501a3e06efaa	reports.profit	View Profit Reports	Reports	\N	54
b61a27c7-8445-4d10-bd77-cfbd280f6de0	reports.inventory	View Inventory Reports	Reports	\N	55
c5c275a9-d3e1-437a-a09a-316d31034e4c	reports.financial	View Financial Reports	Reports	\N	56
7015fc7b-02d8-40c1-a2dc-cf25c4790012	expenses.view	View Expenses	Expenses	\N	57
484749db-cb7e-42b2-8174-c583b21e298e	expenses.create	Add Expense	Expenses	\N	58
6b360355-c65a-4669-8cfe-c565124b65b0	expenses.edit	Edit Expense	Expenses	\N	59
33baf2cd-d729-4967-9e80-feefe5b06e3e	expenses.delete	Delete Expense	Expenses	\N	60
e9b3ec7a-f5ec-4e64-8bbf-5a0645de9881	staff.view	View Staff	Staff	\N	61
7436e013-b4bc-4630-a0fc-3bf788f786fb	staff.create	Add Staff	Staff	\N	62
e3207072-accf-40a4-900f-98393759f68c	staff.edit	Edit Staff	Staff	\N	63
72b56001-e9f2-483a-af2f-9cd428aa6dc7	staff.deactivate	Deactivate Staff	Staff	\N	64
1a4730c9-318a-411a-8733-ac06c8cccb9b	staff.invite	Invite Staff	Staff	\N	65
611be8e3-85fb-4cce-93d5-a2ae05e1df0f	roles.view	View Roles	Staff	\N	66
579965e2-a11e-400a-8099-7db96a349547	roles.create	Create Role	Staff	\N	67
d4f43689-b7f3-4519-8da1-12440e2600cc	roles.edit	Edit Role	Staff	\N	68
45882b7e-2d30-4d1b-8646-c01f1f880f73	roles.delete	Delete Role	Staff	\N	69
2ad89324-ade1-4333-bb8f-bda5494025f7	registers.view	View Registers	Registers	\N	70
0f59609c-2eff-43a5-b058-10be0d5d312b	registers.create	Create Register	Registers	\N	71
e065788e-2be4-437e-9920-91264d15a5dd	registers.edit	Edit Register	Registers	\N	72
ae36755a-3f21-476f-a1af-c75b8f111218	registers.delete	Delete Register	Registers	\N	73
6789a0d5-e975-4959-9c9f-28e9277e592c	pos.access	Access POS	POS	\N	2
26c74ec8-0111-4613-b1c6-113c725fee1a	pos.hold	Hold Sale	POS	\N	3
47b320bd-c28f-4e59-950e-f04c1818259c	inventory.delete_movement	Delete Stock Movement	Inventory	\N	41
09f29edb-5a16-49a5-a28c-bc2ac6248966	shifts.view	View Shifts	Registers	\N	74
63bcd8b7-3e75-4f66-966b-2d844188123d	shifts.manage	Manage Shifts	Registers	\N	75
a0811cb4-2d84-4101-afc1-f697e013e2d9	shifts.approve	Approve Shifts	Registers	\N	76
e8bb77e4-f519-40e5-ab52-0b82cb607061	settings.view	View Settings	Business Settings	\N	77
475d68e3-27ad-4bd2-893d-05646af716c2	settings.edit	Edit Settings	Business Settings	\N	78
8a0b0607-8d62-4462-9b9b-da6087e39db2	payments.manage	Manage Payment Settings	Payments	\N	79
1bf9510f-4f5f-4fa2-91de-df00b6b3e5ae	payments.refunds	Process Refunds	Payments	\N	80
3901b123-8094-4e36-b68c-9b3f941d1ae5	returns.view	View Returns	Returns & Refunds	\N	81
4c1762ed-6919-46f6-81e5-f28387544323	returns.create	Process Returns	Returns & Refunds	\N	82
36c561ea-844d-4f92-83ea-bd5bed5eed03	returns.approve	Approve Returns & Refunds	Returns & Refunds	\N	83
5fe42679-a04d-48b7-b43b-06dc8ea88c4f	variants.view	View Product Variants	Product Variants	\N	84
4d504096-45f6-4cbf-9328-f8d8b7427042	variants.manage	Manage Product Variants	Product Variants	\N	85
81b75310-3fc3-4503-9299-fc0a317237fa	dashboard.view	View Dashboard	Dashboard	\N	1
3b38dccd-efc4-428d-8e32-5b85cb7e05bb	pos.discount_above_limit	Apply Discount Above Limit	POS	\N	10
aba081eb-4feb-4be2-a65f-7199474eb3ec	products.change_price	Change Selling Price	Products	\N	25
0619a919-ad6d-43e3-b33f-0a0515485c55	batches.view	View Stock Batches	Batches & Expiry	\N	86
1297645b-0ee8-4dae-9262-e806ee869c8d	batches.manage	Manage Stock Batches	Batches & Expiry	\N	87
32c13b5f-2e52-4d4c-bef2-c5480bcf5ffb	tax.view	View Tax Settings	Tax & Compliance	\N	88
75706c27-694f-4408-a938-ed9751b63caf	tax.manage	Manage Tax Settings	Tax & Compliance	\N	89
92a8d077-b291-44a9-aa65-00d4dbcad4cc	notifications.view	View Notifications	Notifications	\N	90
3bf3901d-b274-4496-951e-ae81626be827	audit.view	View Audit Logs	Audit Logs	\N	91
ef5a9615-9713-4b17-8551-3977f5bb690d	customers.export	Export Customers	Customers	\N	92
d12c92dc-44bd-414b-b1d1-ece06af8ca16	products.manage	Manage Products	Products	\N	93
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, "shopId", "categoryId", "supplierId", name, sku, barcode, "buyingPrice", "sellingPrice", quantity, "lowStockThreshold", unit, "imageUrl", description, "isActive", "createdAt", "updatedAt", slug, "cloudinaryPublicId", "taxRateId") FROM stdin;
3c68b962-78c5-4160-9f3f-411fda842655	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	5edb2284-ce23-4bb7-9f49-7d0c2edfcbfa	\N	POS machine	\N	\N	17000.00	20000.00	29	5	items	https://res.cloudinary.com/dmuozeb3/image/upload/v1787921955/dukastock/products/dqdbh6nc5uupvu6rjg5l.jpg	\N	t	2026-08-28 13:00:42.032	2026-09-01 18:49:35.265	pos-machine	dukastock/products/dqdbh6nc5uupvu6rjg5l	\N
06dcdab1-ef6d-4d47-aece-3fdfaef4b681	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	5edb2284-ce23-4bb7-9f49-7d0c2edfcbfa	\N	JBL headphones	\N	\N	200.00	279.91	194	3	piece	https://res.cloudinary.com/dmuozeb3/image/upload/v1787916388/dukastock/products/jdzf8yj3vwysngnrzlv8.jpg	imported	t	2026-08-28 11:27:42.243	2026-09-01 19:51:21.237	jbl-headphones	dukastock/products/jdzf8yj3vwysngnrzlv8	\N
1b93db0a-f068-4987-9eaf-a54b29cff9f4	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	5edb2284-ce23-4bb7-9f49-7d0c2edfcbfa	\N	phone	\N	\N	9000.00	11999.84	196	5	piece	blob:http://localhost:5173/0ba43cbc-3d43-446b-8f20-c4fd6f2a1efa	\N	t	2026-08-28 07:38:16.993	2026-09-01 19:51:21.322	phone	\N	\N
cc0522da-392e-4a22-8582-6734053a3d10	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	6ef8ddcc-271d-401e-a7ac-9ea31fc24b61	\N	velvet cake	\N	\N	80.00	119.98	15	10	piece	https://res.cloudinary.com/dmuozeb3/image/upload/v1788287944/dukastock/products/yuvrbl6arts8bzbnsorb.jpg	\N	t	2026-09-01 18:39:50.357	2026-09-02 17:14:13.312	velvet-cake	dukastock/products/yuvrbl6arts8bzbnsorb	\N
5a8d817a-cba8-444b-82d9-8af5a6595028	20a7d3bf-dbe3-452c-8e41-889f793ba205	4cb158d8-e0da-4b69-b763-2541a716a3fb	\N	Sub woofer	JBL-E500	\N	7000.00	7900.00	13	5	items	https://res.cloudinary.com/dmuozeb3/image/upload/v1788111245/dukastock/products/t823x6mfuvmqjtfduld8.jpg	powerful bass clear sounds, three setlites and a free USB	t	2026-08-30 17:36:21.645	2026-08-30 19:20:30.218	sub-woofer	dukastock/products/t823x6mfuvmqjtfduld8	\N
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, "productId", "shopId", name, sku, barcode, "buyingPrice", "sellingPrice", quantity, "lowStockThreshold", "imageUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Purchase" (id, "shopId", "supplierId", "totalAmount", "purchaseDate", notes, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: PurchaseItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseItem" (id, "purchaseId", "productId", quantity, "unitCost", subtotal, "batchId", "variantId") FROM stdin;
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Refund" (id, "shopId", "returnId", "saleId", "refundNumber", amount, "refundMethod", reference, status, "registerId", "createdById", "approvedById", "createdAt", "processedAt") FROM stdin;
6d51bc69-7245-4b22-b0f8-81754d740c3c	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	23c9cc4b-5aa4-46c3-9169-3712a2689c43	cd7ddc0c-6f4b-4174-97ab-f929972d954e	RF-000001	20000.00	STORE_CREDIT	\N	COMPLETED	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 18:49:35.227	2026-09-01 18:49:35.305
\.


--
-- Data for Name: Register; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Register" (id, "shopId", name, status, "createdAt", "updatedAt") FROM stdin;
d51018a5-8c72-4ca5-be52-7a82d3a553e8	36e5b1c0-9f50-4000-98bf-9749a3830ff7	POS-01	ACTIVE	2026-08-30 19:09:03.729	2026-08-30 19:09:03.729
0b502d2e-8521-4e88-b8b9-406ab911f1db	2c0277f0-74d4-4339-aa86-29569c824c2c	POS-01	ACTIVE	2026-08-30 19:09:03.741	2026-08-30 19:09:03.741
6faaef2e-79d0-4484-8cd8-7f7597c6ed66	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	POS-01	ACTIVE	2026-08-30 19:09:03.743	2026-08-30 19:09:03.743
cb70eca6-0345-485c-aa8e-3e75c888ad33	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	POS-01	ACTIVE	2026-08-30 19:09:03.746	2026-08-30 19:09:03.746
e3fad3e6-a431-4ae8-96e2-f082d7e455d9	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	POS-01	ACTIVE	2026-08-30 19:09:03.748	2026-08-30 19:09:03.748
7c2e0eb8-4add-4218-a86d-06e6f9b02131	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	POS-01	ACTIVE	2026-08-30 19:09:03.751	2026-08-30 19:09:03.751
dffd8e72-f5cf-4004-ae66-584562d719cf	203957bf-5a60-4946-b41a-6d6b0b09dde1	POS-01	ACTIVE	2026-08-30 19:09:03.756	2026-08-30 19:09:03.756
d891d6fe-2e26-41e4-8905-93f20b17ba21	1888feee-4c42-4668-920c-8a963bd24121	POS-01	ACTIVE	2026-08-30 19:09:03.759	2026-08-30 19:09:03.759
0d65d641-3c50-449c-b706-b8ebbde60d00	f158f2aa-2ccf-4df2-ba92-9d188edd231c	POS-01	ACTIVE	2026-08-30 19:09:03.761	2026-08-30 19:09:03.761
fb40a368-797d-4c49-9bd3-fec8a148adad	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	POS-01	ACTIVE	2026-08-30 19:09:03.763	2026-08-30 19:09:03.763
d57d3902-fe6a-448a-8fe0-2f0700a0429f	20a7d3bf-dbe3-452c-8e41-889f793ba205	POS-01	ACTIVE	2026-08-30 19:09:03.765	2026-08-30 19:09:03.765
05d3eb3e-868d-43f5-99eb-856875110e39	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	front counter	ACTIVE	2026-08-31 19:44:46.704	2026-08-31 19:44:46.704
\.


--
-- Data for Name: Return; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Return" (id, "shopId", "saleId", "returnNumber", reason, condition, status, notes, "createdById", "createdAt", "processedAt", "processedById") FROM stdin;
23c9cc4b-5aa4-46c3-9169-3712a2689c43	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	cd7ddc0c-6f4b-4174-97ab-f929972d954e	RT-000001	OTHER	GOOD	COMPLETED	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 18:49:35.227	2026-09-01 18:49:35.305	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf
\.


--
-- Data for Name: ReturnItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReturnItem" (id, "returnId", "saleItemId", "productId", "variantId", quantity, "unitPrice", subtotal) FROM stdin;
85f4dae8-ffe9-45a4-90c6-b4700bd94a36	23c9cc4b-5aa4-46c3-9169-3712a2689c43	d7257d74-bda5-45b7-b6be-62212e13e1bc	3c68b962-78c5-4160-9f3f-411fda842655	\N	1	20000.00	20000.00
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" (id, "shopId", name, description, type, "isDefault", "isProtected", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RoleLimit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RoleLimit" (id, "roleId", "maxDiscountPercent", "allowUnlimitedDiscount", "refundApprovalRequired", "maxRefundAmount", "canApproveRefund", "canOverridePrice", "canChangePrice", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermission" (id, "roleId", "permissionId") FROM stdin;
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "shopId", "receiptNumber", "totalAmount", "paymentMethod", "createdBy", "createdById", "createdAt", source, subtotal, discount, "customerId", "amountPaid", "changeDue", "paymentReference", "paymentStatus", "registerName", "cashierId", "registerId") FROM stdin;
681af277-0ac5-4708-8817-dd723ef88d3f	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DS-000001	11999.84	CASH	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 11:24:50.795	POS	11999.84	0.00	\N	\N	\N	\N	PAID	\N	\N	\N
1798204a-d553-4d67-8a8e-4707f9e321ff	20a7d3bf-dbe3-452c-8e41-889f793ba205	DS-000003	7900.00	CASH	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 18:52:49.423	POS	7900.00	0.00	\N	\N	\N	\N	PAID	POS-01	\N	\N
52430f28-31a2-4614-81b8-34c936cb74d6	20a7d3bf-dbe3-452c-8e41-889f793ba205	DS-000004	7900.00	CASH	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 18:57:12.935	POS	7900.00	0.00	\N	\N	\N	\N	PAID	POS-01	\N	\N
12eeff31-df81-4ed4-8eb0-142f5b76e86b	20a7d3bf-dbe3-452c-8e41-889f793ba205	DS-000005	7900.00	OTHER	Alpha AGX	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:18:14.522	POS	7900.00	0.00	\N	\N	\N	\N	PAID	\N	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	\N
83ec6a52-93e0-4f79-881c-323bb940aad5	20a7d3bf-dbe3-452c-8e41-889f793ba205	DS-000006	7900.00	CASH	Alpha AGX	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:19:20.282	POS	7900.00	0.00	\N	\N	\N	\N	PAID	\N	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	\N
c3bc07e2-99f6-47a7-b21e-b4f3cf291cb6	20a7d3bf-dbe3-452c-8e41-889f793ba205	DS-000007	7890.00	CASH	Alpha AGX	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:20:30.208	POS	7900.00	10.00	\N	8000.00	110.00	\N	PAID	\N	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	\N
03a9b70e-5101-4e11-bc9b-daf4d7f44f13	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DS-000008	30279.75	CARD	Collins Odiera	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 16:12:16.426	POS	32279.75	2000.00	\N	\N	\N	\N	PAID	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	\N
cd7ddc0c-6f4b-4174-97ab-f929972d954e	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DS-000002	20000.00	CASH	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 13:07:38.091	POS	20000.00	0.00	\N	\N	\N	\N	REFUNDED	\N	\N	\N
770c399d-2594-4949-bc4d-e4f085ef1387	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DS-000009	14439.26	CASH	Collins Odiera	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 19:51:21.105	POS	14439.26	0.00	\N	15000.00	560.74	\N	PAID	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	\N
b83d1961-c7a7-4f31-b4c7-8e1e375ba1ec	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DS-000010	119.98	CASH	Collins Odiera	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-02 17:14:13.264	POS	119.98	0.00	\N	119.98	\N	\N	PAID	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	\N
\.


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SaleItem" (id, "saleId", "productId", quantity, "unitPrice", "buyingPrice", subtotal, profit, "batchId", "variantId") FROM stdin;
1dddf227-e6a8-428c-820e-92de8b292fe1	681af277-0ac5-4708-8817-dd723ef88d3f	1b93db0a-f068-4987-9eaf-a54b29cff9f4	1	11999.84	9000.00	11999.84	2999.84	\N	\N
d7257d74-bda5-45b7-b6be-62212e13e1bc	cd7ddc0c-6f4b-4174-97ab-f929972d954e	3c68b962-78c5-4160-9f3f-411fda842655	1	20000.00	17000.00	20000.00	3000.00	\N	\N
c4101919-d131-4ee3-8e13-2ff6de137bc6	1798204a-d553-4d67-8a8e-4707f9e321ff	5a8d817a-cba8-444b-82d9-8af5a6595028	1	7900.00	7000.00	7900.00	900.00	\N	\N
958d71ec-8b1e-409c-8855-a7b20cbb4fd8	52430f28-31a2-4614-81b8-34c936cb74d6	5a8d817a-cba8-444b-82d9-8af5a6595028	1	7900.00	7000.00	7900.00	900.00	\N	\N
eb284d42-464b-4cd6-af90-4108010d118a	12eeff31-df81-4ed4-8eb0-142f5b76e86b	5a8d817a-cba8-444b-82d9-8af5a6595028	1	7900.00	7000.00	7900.00	900.00	\N	\N
f4e7b53d-5f0e-4116-ad91-5199afd8d066	83ec6a52-93e0-4f79-881c-323bb940aad5	5a8d817a-cba8-444b-82d9-8af5a6595028	1	7900.00	7000.00	7900.00	900.00	\N	\N
ad95cb50-524c-4c37-bb18-19389b6e4de3	c3bc07e2-99f6-47a7-b21e-b4f3cf291cb6	5a8d817a-cba8-444b-82d9-8af5a6595028	1	7900.00	7000.00	7900.00	900.00	\N	\N
e3bb2b5f-c185-4c3f-b9e9-77e65a045a93	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	1b93db0a-f068-4987-9eaf-a54b29cff9f4	1	11999.84	9000.00	11999.84	2999.84	\N	\N
cdddc721-8a08-439b-bf30-c9090a30eead	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	3c68b962-78c5-4160-9f3f-411fda842655	1	20000.00	17000.00	20000.00	3000.00	\N	\N
d1e6998c-5a70-4d8a-80df-3fe7ecd8eb07	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	1	279.91	200.00	279.91	79.91	\N	\N
e9be8ae8-a75e-42f4-a6ac-4960a5a1ec0c	770c399d-2594-4949-bc4d-e4f085ef1387	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	4	279.91	200.00	1119.64	319.64	\N	\N
6ca2026a-307a-45f3-9ec7-c8a8511b1a1f	770c399d-2594-4949-bc4d-e4f085ef1387	cc0522da-392e-4a22-8582-6734053a3d10	11	119.98	80.00	1319.78	439.78	\N	\N
157a5d0d-f22e-47f8-bdee-f71f448986cf	770c399d-2594-4949-bc4d-e4f085ef1387	1b93db0a-f068-4987-9eaf-a54b29cff9f4	1	11999.84	9000.00	11999.84	2999.84	\N	\N
440066df-0b26-48ff-af2b-4ddce443b5d4	b83d1961-c7a7-4f31-b4c7-8e1e375ba1ec	cc0522da-392e-4a22-8582-6734053a3d10	1	119.98	80.00	119.98	39.98	\N	\N
\.


--
-- Data for Name: Shift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shift" (id, "shopId", "registerId", "cashierId", "openedAt", "openedBy", "openingCash", "closedAt", "closedBy", "closingCash", "actualCash", "expectedCash", difference, "cashSales", "cashRefunds", "cashWithdrawals", notes, status, "approvedBy", "approvedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shop" (id, "ownerId", name, description, phone, email, location, logo, currency, "createdAt", "updatedAt", address, "businessPin", city, country, "receiptFooter", "registerName", timezone, website) FROM stdin;
36e5b1c0-9f50-4000-98bf-9749a3830ff7	c45b3c8c-bb8e-4969-87b2-59a18542003c	Secure A	\N	\N	\N	Nairobi	\N	KES	2026-08-28 07:08:35.888	2026-08-28 07:08:35.888	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
2c0277f0-74d4-4339-aa86-29569c824c2c	f061112e-5665-4cc5-86c9-6e8d4bbfa3e9	Secure B	\N	\N	\N	Nairobi	\N	KES	2026-08-28 07:08:36.033	2026-08-28 07:08:36.033	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	quick mart	\N	\N	mamanjeri@gmail.com	nakuru kenya	\N	KES	2026-08-28 07:12:57.886	2026-08-28 18:10:10.079	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	1a5c3b0c-1523-4d0a-886a-8cc0549a417e	devs mart	\N	\N	\N	nakuru	\N	KES	2026-08-28 18:20:08.095	2026-08-28 18:20:08.095	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	834b38d0-1210-4ce4-8386-d0e70f858ac4	Sync Mart 1788024007261	\N	\N	\N	Nairobi	\N	KES	2026-08-29 17:20:08.872	2026-08-29 17:20:08.872	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
73bd792f-6b71-4ed9-b3a5-e262ccf8248a	f4086037-8201-4f8f-affb-92feba107e45	Sync Mart 1788026271121	\N	\N	\N	Nairobi	\N	KES	2026-08-29 17:57:51.453	2026-08-29 17:57:51.453	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
203957bf-5a60-4946-b41a-6d6b0b09dde1	96c6a302-1d3a-4480-9e7e-a6d85a6687f6	Isolation A 1788026285781	\N	\N	\N	Nairobi	\N	KES	2026-08-29 17:58:06.024	2026-08-29 17:58:06.024	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
1888feee-4c42-4668-920c-8a963bd24121	846b74bf-d3fd-408c-9cd9-8565b3892462	Isolation B 1788026285781	\N	\N	\N	Kisumu	\N	KES	2026-08-29 17:58:06.404	2026-08-29 17:58:06.404	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
f158f2aa-2ccf-4df2-ba92-9d188edd231c	55595391-0893-4040-aeef-93b9eb1f2d37	Isolation A 1788026312365	\N	\N	\N	Nairobi	\N	KES	2026-08-29 17:58:32.632	2026-08-29 17:58:32.632	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	4cb8b109-fab6-4622-8685-a5d7e4c29ec4	Isolation B 1788026312365	\N	\N	\N	Kisumu	\N	KES	2026-08-29 17:58:33.1	2026-08-29 17:58:33.1	\N	\N	\N	\N	\N	POS-01	Africa/Nairobi	\N
20a7d3bf-dbe3-452c-8e41-889f793ba205	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	Alpha AGX	\N	0715519158	collinsodiera8@gmail.com	nairobi kenya	\N	KES	2026-08-29 18:41:50.055	2026-08-30 19:18:45.92	maili saba	Collins's Org - 2026-04-07	Nakuru	Kenya	\N	POS-01	Africa/Nairobi	\N
\.


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockMovement" (id, "productId", type, quantity, reason, "referenceId", "createdBy", "createdAt", "batchId", direction, "referenceType", "runningBalance", "shopId", "variantId") FROM stdin;
19879340-037f-45af-ba77-1f96efc18c0c	3c68b962-78c5-4160-9f3f-411fda842655	RETURN	1	Return RT-000001	23c9cc4b-5aa4-46c3-9169-3712a2689c43	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 18:49:35.271	\N	IN	Return	29	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
608114d1-35e0-458b-b902-d05db2a2a514	cc0522da-392e-4a22-8582-6734053a3d10	ONLINE_ORDER	3	Order ORD-000003	3b7b7620-2476-476b-b2ee-db2b7b7500db	\N	2026-09-02 17:12:52.038	\N	OUT	\N	16	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
0aaaa1b6-178e-4b92-b4b2-6b18bbd8d604	1b93db0a-f068-4987-9eaf-a54b29cff9f4	STOCK_IN	200	Restock	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 11:24:27.373	\N	IN	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
292494ca-5f29-4381-b740-2e74a7c5397f	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	STOCK_IN	200	Restock	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 11:28:15.109	\N	IN	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
eb13d240-0864-4f03-b703-42cba45b5719	3c68b962-78c5-4160-9f3f-411fda842655	STOCK_IN	30	Stock added	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 13:00:56.181	\N	IN	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
92cd2063-e567-4b61-8670-fb712665f1b7	5a8d817a-cba8-444b-82d9-8af5a6595028	STOCK_IN	21	Stock added	\N	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 17:36:37.854	\N	IN	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
65ffacc5-cae6-4555-816d-3a9c5dbae0f7	1b93db0a-f068-4987-9eaf-a54b29cff9f4	POS_SALE	1	Sale DS-000001	681af277-0ac5-4708-8817-dd723ef88d3f	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 11:24:50.815	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
390d3684-2f9b-4b1b-9a48-7ee0f76c7759	3c68b962-78c5-4160-9f3f-411fda842655	POS_SALE	1	Sale DS-000002	cd7ddc0c-6f4b-4174-97ab-f929972d954e	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-08-28 13:07:38.107	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
aae32002-f8b5-4edf-9df5-ea4b2e8de072	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	ONLINE_ORDER	1	Order ORD-000001	0448f2d0-ab11-46bc-8494-31069e986c1f	\N	2026-08-29 17:59:45.801	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
a9d0400b-c850-41d6-a054-c3700e467bbb	1b93db0a-f068-4987-9eaf-a54b29cff9f4	ONLINE_ORDER	1	Order ORD-000001	0448f2d0-ab11-46bc-8494-31069e986c1f	\N	2026-08-29 17:59:45.813	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
b77f1f6b-f996-43aa-8dde-411ea3eb5df1	5a8d817a-cba8-444b-82d9-8af5a6595028	ONLINE_ORDER	3	Order ORD-000002	d0e21d25-b1c5-4fad-9b4f-2ec1863603ed	\N	2026-08-30 17:40:15.16	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
ba4b4117-dd67-4107-80df-9fbc834929ab	5a8d817a-cba8-444b-82d9-8af5a6595028	POS_SALE	1	Sale DS-000003	1798204a-d553-4d67-8a8e-4707f9e321ff	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 18:52:49.447	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
22505770-8e44-4e9a-b5d4-802cb19883d8	5a8d817a-cba8-444b-82d9-8af5a6595028	POS_SALE	1	Sale DS-000004	52430f28-31a2-4614-81b8-34c936cb74d6	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 18:57:12.946	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
0e3404ce-8198-4e49-a214-385636c82244	5a8d817a-cba8-444b-82d9-8af5a6595028	POS_SALE	1	Sale DS-000005	12eeff31-df81-4ed4-8eb0-142f5b76e86b	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:18:14.562	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
29087cd2-7d7c-42bf-a097-5edb994e4e54	5a8d817a-cba8-444b-82d9-8af5a6595028	POS_SALE	1	Sale DS-000006	83ec6a52-93e0-4f79-881c-323bb940aad5	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:19:20.294	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
06fad325-c363-4ced-9a27-39d08b280886	5a8d817a-cba8-444b-82d9-8af5a6595028	POS_SALE	1	Sale DS-000007	c3bc07e2-99f6-47a7-b21e-b4f3cf291cb6	dafa8dcf-aea8-41cf-9787-3607f4fcd52c	2026-08-30 19:20:30.22	\N	OUT	\N	0	20a7d3bf-dbe3-452c-8e41-889f793ba205	\N
e8ed9204-3035-4b10-a872-d74bab65d3bf	1b93db0a-f068-4987-9eaf-a54b29cff9f4	POS_SALE	1	Sale DS-000008	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 16:12:16.467	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
59f8b6cc-1309-48c2-acc9-599d323314f6	3c68b962-78c5-4160-9f3f-411fda842655	POS_SALE	1	Sale DS-000008	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 16:12:16.483	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
ae2e742f-539b-4c00-a5ec-f18452011f65	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	POS_SALE	1	Sale DS-000008	03a9b70e-5101-4e11-bc9b-daf4d7f44f13	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 16:12:16.49	\N	OUT	\N	0	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
b06f512a-089b-4d06-a1ee-d7a8af419baf	cc0522da-392e-4a22-8582-6734053a3d10	STOCK_IN	30	Stock added	\N	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 18:40:01.185	\N	IN	\N	30	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
be0547ab-ada6-40ee-b405-f27eaf8c03d0	06dcdab1-ef6d-4d47-aece-3fdfaef4b681	POS_SALE	4	Sale DS-000009	770c399d-2594-4949-bc4d-e4f085ef1387	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 19:51:21.244	\N	OUT	Sale	194	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
e217ca99-e724-4a41-a8da-b9cec01e7237	cc0522da-392e-4a22-8582-6734053a3d10	POS_SALE	11	Sale DS-000009	770c399d-2594-4949-bc4d-e4f085ef1387	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 19:51:21.306	\N	OUT	Sale	19	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
e5519d1d-bcc7-497e-94c9-60831eba84d5	1b93db0a-f068-4987-9eaf-a54b29cff9f4	POS_SALE	1	Sale DS-000009	770c399d-2594-4949-bc4d-e4f085ef1387	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-01 19:51:21.325	\N	OUT	Sale	196	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
5fab9de4-2368-45f3-8ba1-74d975599c2a	cc0522da-392e-4a22-8582-6734053a3d10	POS_SALE	1	Sale DS-000010	b83d1961-c7a7-4f31-b4c7-8e1e375ba1ec	b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	2026-09-02 17:14:13.314	\N	OUT	Sale	15	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	\N
\.


--
-- Data for Name: Storefront; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Storefront" (id, "shopId", status, "publishedAt", "storeName", tagline, "heroImageUrl", "heroImagePublicId", "logoUrl", "logoPublicId", "faviconPublicId", copyright, "customerCount", "yearEstablished", "onboardingStep", "createdAt", "updatedAt") FROM stdin;
6cbf24cd-d14a-431d-894c-a52d0f5379ff	36e5b1c0-9f50-4000-98bf-9749a3830ff7	DRAFT	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-28 07:08:36.083	2026-08-28 07:08:36.083
75e8b45d-144e-4196-96fd-0f3a0dee0ed6	2c0277f0-74d4-4339-aa86-29569c824c2c	DRAFT	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-28 07:08:36.486	2026-08-28 07:08:36.486
06a59353-2622-4a73-8d57-c1612a52668c	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	PUBLISHED	2026-08-28 18:20:58.997	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-28 18:20:26.814	2026-08-28 18:20:59
58455a48-85b6-4aba-ae9f-ef2eacdb901d	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	PUBLISHED	2026-08-29 17:20:09.22	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:20:09.06	2026-08-29 17:20:09.223
dfec8b0e-a249-4374-b520-e1efec7eb887	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	PUBLISHED	2026-08-29 17:57:51.628	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:57:51.52	2026-08-29 17:57:51.629
f325c639-1d17-4bc0-8936-fad99fbac0da	203957bf-5a60-4946-b41a-6d6b0b09dde1	PUBLISHED	2026-08-29 17:58:06.161	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:58:06.067	2026-08-29 17:58:06.162
9edfd553-9cbe-445d-a84b-9209933279ce	1888feee-4c42-4668-920c-8a963bd24121	DRAFT	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:58:06.514	2026-08-29 17:58:06.514
12064b33-d854-41b9-b18f-259169376d3c	f158f2aa-2ccf-4df2-ba92-9d188edd231c	PUBLISHED	2026-08-29 17:58:32.742	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:58:32.678	2026-08-29 17:58:32.743
0cdc5f31-532d-4cf9-9540-775b011e0f8b	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	PUBLISHED	2026-08-29 17:58:33.189	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 17:58:33.14	2026-08-29 17:58:33.19
0954bd57-98bd-451c-8488-bef1384ffd9a	20a7d3bf-dbe3-452c-8e41-889f793ba205	DRAFT	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	2026-08-29 18:41:59.346	2026-08-30 18:50:24.975
a39ec761-b5f0-4d0e-8fa1-8157c489a483	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	DRAFT	\N	Joyland	get everything in one place	https://res.cloudinary.com/dmuozeb3/image/upload/v1787915842/dukastock/storefront/hero/rmu1mj6z42zlnz4peuxc.jpg	dukastock/storefront/hero/rmu1mj6z42zlnz4peuxc	https://res.cloudinary.com/dmuozeb3/image/upload/v1787915827/dukastock/storefront/yfm1fbzu4vr656bts31v.jpg	dukastock/storefront/yfm1fbzu4vr656bts31v	\N	joyland@2025| all right are reserved	200	2019	0	2026-08-28 11:00:27.341	2026-09-02 17:10:26.685
\.


--
-- Data for Name: StorefrontAbout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontAbout" (id, "storefrontId", title, introduction, story, mission, vision, "values", "imageUrl", "imagePublicId", "secondaryImageUrl", "secondaryImagePublicId", "showTeam") FROM stdin;
dd7ad6c0-65a9-42ad-b10d-6917f09fad87	6cbf24cd-d14a-431d-894c-a52d0f5379ff	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
16a49217-ef50-4c53-9221-1366763b4f6e	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
ddaf454f-8a22-437c-971c-bf73abf6272a	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Get to know Us	Get familiar with Duka-stock	We offer you every essential you will need	deliver to your door step	to make your life easy	high value	\N	\N	\N	\N	t
7f4b5e49-cca0-414e-91be-1e457633a24c	06a59353-2622-4a73-8d57-c1612a52668c	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
994320b8-e718-4fb9-a63d-068ba94e86fc	58455a48-85b6-4aba-ae9f-ef2eacdb901d	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
b9cf0cfa-1996-4ced-b4bb-bd85d3d2f455	dfec8b0e-a249-4374-b520-e1efec7eb887	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
1c8d3e5b-9343-43d5-be65-c07acbda1f9a	f325c639-1d17-4bc0-8936-fad99fbac0da	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
280338f9-c7e4-4681-afc9-ac591e837efc	12064b33-d854-41b9-b18f-259169376d3c	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
9bc45437-c288-4caa-9cff-b48544e366e4	0cdc5f31-532d-4cf9-9540-775b011e0f8b	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
69d14e4c-ca8f-4e57-b2fb-96246a043ad9	9edfd553-9cbe-445d-a84b-9209933279ce	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
b8518667-b69c-4f48-b0aa-d2a3e271d90b	0954bd57-98bd-451c-8488-bef1384ffd9a	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: StorefrontBranding; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontBranding" (id, "storefrontId", "primaryColor", "secondaryColor", "accentColor", "buttonStyle", radius, font) FROM stdin;
a4aa3460-197c-46d6-b914-6070cdf6093e	6cbf24cd-d14a-431d-894c-a52d0f5379ff	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
a029af66-8a3e-4709-9bc7-e1df02e929b7	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
4aecd947-4b01-4945-8311-fe4701d87653	06a59353-2622-4a73-8d57-c1612a52668c	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
2052ed1f-4f19-428b-a560-e3dd188c0bea	58455a48-85b6-4aba-ae9f-ef2eacdb901d	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
75f16108-c9e6-4ae8-bf79-53dc9f7d3ede	dfec8b0e-a249-4374-b520-e1efec7eb887	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
f3de50f6-a5df-40d8-af7f-841dd1762eab	f325c639-1d17-4bc0-8936-fad99fbac0da	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
c7c53e23-dd05-45f9-b570-2bc8f5698e1d	12064b33-d854-41b9-b18f-259169376d3c	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
eb77c16d-0515-4477-9c59-53d65ac67e70	0cdc5f31-532d-4cf9-9540-775b011e0f8b	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
de338e86-b703-4318-a21d-af710981a9be	a39ec761-b5f0-4d0e-8fa1-8157c489a483	#eaece4	#e69119	#0d0903	rounded	smooth	inter
24bd34c2-9263-4485-b6f4-d234108f8731	9edfd553-9cbe-445d-a84b-9209933279ce	#176B5B	#17252D	#D6A84F	rounded	smooth	inter
efafe7a6-322b-4736-9e22-e5845f8da7f0	0954bd57-98bd-451c-8488-bef1384ffd9a	#dfb620	#e00000	#d56215	rounded	smooth	inter
\.


--
-- Data for Name: StorefrontContact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontContact" (id, "storefrontId", title, description, phone, "whatsappNumber", "whatsappMessage", email, location, address, "mapsUrl", "openingHours", "showContactForm", "showWhatsappBtn") FROM stdin;
4ba5211d-afc7-46c3-9e78-e229d6981e45	6cbf24cd-d14a-431d-894c-a52d0f5379ff	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
421c2882-e3ae-42be-8804-6d1f18950a06	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
ca5481c3-e5a9-4502-8373-08cce3161f21	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Get in touch	connect with us	0715519158	0715519158	place your order	collinsodiera8@gmail.com	tom mboya street	maili saba	\N	[]	t	t
f39bc291-2bfb-48e3-8f7d-e2fa606abe4c	06a59353-2622-4a73-8d57-c1612a52668c	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
85644d81-4537-4fb9-aa84-0fef74c82ef4	58455a48-85b6-4aba-ae9f-ef2eacdb901d	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
2e4ab6e1-7bdd-4f21-aae9-01a4f30a2b3a	dfec8b0e-a249-4374-b520-e1efec7eb887	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
1ab5a326-4873-49be-b5ea-834ec2017f3c	f325c639-1d17-4bc0-8936-fad99fbac0da	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
29af5d63-7d3f-4413-b385-10c1fc16f645	12064b33-d854-41b9-b18f-259169376d3c	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
b8714ed0-5730-4bb3-a13a-a9a51aee324d	0cdc5f31-532d-4cf9-9540-775b011e0f8b	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
8985c870-915e-4842-932b-f85f1406fed8	9edfd553-9cbe-445d-a84b-9209933279ce	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
395496e4-95c1-401c-b1cf-521e7720544d	0954bd57-98bd-451c-8488-bef1384ffd9a	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t
\.


--
-- Data for Name: StorefrontFaq; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontFaq" (id, "storefrontId", question, answer, enabled, "sortOrder", "createdAt") FROM stdin;
607de2b4-4449-45c0-8f5b-e410d5bad267	6cbf24cd-d14a-431d-894c-a52d0f5379ff	Aq	Aa	t	0	2026-08-28 07:08:36.451
2a7d9346-2c63-4f45-bfcd-559ac3576050	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	Bq	Ba	t	0	2026-08-28 07:08:36.517
815b3d29-9eda-425b-8767-23fc48668d70	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Do you deliver	yes we deliver at your door step	t	0	2026-08-28 12:31:00.077
\.


--
-- Data for Name: StorefrontFeature; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontFeature" (id, "storefrontId", title, description, icon, enabled, "sortOrder", "createdAt") FROM stdin;
00595a15-3772-43a9-8ef3-8059377f0f9d	a39ec761-b5f0-4d0e-8fa1-8157c489a483	free delivery at the range of 1km	we offer deliver for free for goods over 20k	Truck	t	0	2026-08-28 16:47:41.022
6c9354ff-05dc-4a32-bd42-1546a0fd13bb	a39ec761-b5f0-4d0e-8fa1-8157c489a483	offer	we offer discount for electric appliences	Headset	t	1	2026-08-28 16:49:47.189
c5935b5c-e91c-435c-96b4-d258481251b5	a39ec761-b5f0-4d0e-8fa1-8157c489a483	discount offered	They given me a discount on a wireless charger	BadgeCheck	t	2	2026-08-28 16:51:08.566
\.


--
-- Data for Name: StorefrontFeatured; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontFeatured" (id, "storefrontId", "productId", "sortOrder", "createdAt") FROM stdin;
\.


--
-- Data for Name: StorefrontHero; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontHero" (id, "storefrontId", title, subtitle, description, "primaryText", "primaryLink", "secondaryText", "secondaryLink", "imageUrl", "imagePublicId", "backgroundEnabled", alignment, show) FROM stdin;
6fbc0e50-1e77-43d0-a272-f518aa4cc11d	6cbf24cd-d14a-431d-894c-a52d0f5379ff	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	left	t
c75507f8-3ced-4997-a12c-d5365a5f7409	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	left	t
46eb6b09-8be6-4f63-8409-aef3d53a5ba0	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Get all that you need in one place	Get every day essentials	We sell to you fresh products direct from the factory direct to you	View Products	/shop	Contact us	/contact	https://res.cloudinary.com/dmuozeb3/image/upload/v1787934488/dukastock/storefront/hero/yhne1jtbwohl9c078yaf.jpg	dukastock/storefront/hero/yhne1jtbwohl9c078yaf	t	left	t
03ef5621-5794-4d4d-a996-6f7499fa6207	06a59353-2622-4a73-8d57-c1612a52668c	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	left	t
b413a005-6df8-4091-a715-344b6d760f52	58455a48-85b6-4aba-ae9f-ef2eacdb901d	DUKASTOCK FINAL SYNC TEST	Sub	Description	Shop Now	/shop	\N	\N	\N	\N	f	left	t
b7197ebe-e5fb-419c-9f82-3d61786d6392	dfec8b0e-a249-4374-b520-e1efec7eb887	DUKASTOCK FINAL SYNC TEST	Sub	Description	Shop Now	/shop	\N	\N	\N	\N	f	left	t
92b27ab0-8065-4e04-b410-b4967fc76dea	f325c639-1d17-4bc0-8936-fad99fbac0da	HERO FROM SHOP A	A	\N	\N	\N	\N	\N	\N	\N	f	left	t
ec018104-6af6-4267-8416-005432e8ea4f	12064b33-d854-41b9-b18f-259169376d3c	HERO FROM SHOP A	A	\N	\N	\N	\N	\N	\N	\N	f	left	t
fc0a30be-c9f4-46a6-b13c-80c20e947674	0cdc5f31-532d-4cf9-9540-775b011e0f8b	HERO FROM SHOP B	B	\N	\N	\N	\N	\N	\N	\N	f	left	t
d281bf51-0468-4cc4-94e6-e3f85758d1b2	9edfd553-9cbe-445d-a84b-9209933279ce	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	left	t
f5cef8bf-2c07-4ef7-b89d-8864469d63cb	0954bd57-98bd-451c-8488-bef1384ffd9a	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	left	t
\.


--
-- Data for Name: StorefrontNavItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontNavItem" (id, "storefrontId", label, href, "sortOrder", enabled, "isSystem", "createdAt") FROM stdin;
c26adc85-1e13-4779-b3dc-b945afec5b46	6cbf24cd-d14a-431d-894c-a52d0f5379ff	Home	/	0	t	t	2026-08-28 07:08:36.114
b7d4648c-d8c0-4067-a89b-11f962f6349a	6cbf24cd-d14a-431d-894c-a52d0f5379ff	Shop	/shop	1	t	t	2026-08-28 07:08:36.114
bdcc2b88-f231-4b28-9635-dd36345310a7	6cbf24cd-d14a-431d-894c-a52d0f5379ff	About	/about	2	t	f	2026-08-28 07:08:36.114
c665eabf-96ed-4690-a206-386635cbf457	6cbf24cd-d14a-431d-894c-a52d0f5379ff	FAQ	/faq	3	t	f	2026-08-28 07:08:36.114
31f9f720-06b0-428c-b38b-e8a3fea91cb5	6cbf24cd-d14a-431d-894c-a52d0f5379ff	Contact	/contact	4	t	t	2026-08-28 07:08:36.114
55c66926-661b-4448-a71c-cfc5c5b1a481	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	Home	/	0	t	t	2026-08-28 07:08:36.494
7d6172b1-713f-4a09-a2ed-a1ee4cbfc751	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	Shop	/shop	1	t	t	2026-08-28 07:08:36.494
7adad57a-26bb-4745-ac6f-96983a83c3c2	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	About	/about	2	t	f	2026-08-28 07:08:36.494
eb114f2e-44d0-402f-b16a-405e3ad300c9	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	FAQ	/faq	3	t	f	2026-08-28 07:08:36.494
f13d665e-5416-4303-8a06-9305c4a4c887	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	Contact	/contact	4	t	t	2026-08-28 07:08:36.494
5c796ca6-ad4e-42bd-856f-9fe0fe33d36e	9edfd553-9cbe-445d-a84b-9209933279ce	Home	/	0	t	t	2026-08-29 18:36:33.976
db1d28ce-cb96-46f4-a70f-b030e229fc98	9edfd553-9cbe-445d-a84b-9209933279ce	Shop	/shop	1	t	t	2026-08-29 18:36:33.976
b8771dd3-6993-44cb-bf11-b19a17a06994	9edfd553-9cbe-445d-a84b-9209933279ce	About	/about	2	t	f	2026-08-29 18:36:33.976
6d7e4e27-e150-476b-a20c-f1a31407baa0	9edfd553-9cbe-445d-a84b-9209933279ce	FAQ	/faq	3	t	f	2026-08-29 18:36:33.976
5cead3db-9552-4c12-bbd1-da110f0bf024	9edfd553-9cbe-445d-a84b-9209933279ce	Contact	/contact	4	t	t	2026-08-29 18:36:33.976
91b90352-02c2-49eb-ab47-659f86c46d04	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Home	/	0	t	t	2026-08-28 11:00:27.388
90a99c01-547a-459c-addf-7afdc59d2dd8	a39ec761-b5f0-4d0e-8fa1-8157c489a483	About	/about	1	t	f	2026-08-28 11:00:27.388
1b6df33e-ac87-437e-9644-85cd0d819da6	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Shop	/shop	2	t	t	2026-08-28 11:00:27.388
89e63186-1682-4c3b-906c-7b79b40b82d8	a39ec761-b5f0-4d0e-8fa1-8157c489a483	FAQ	/faq	3	t	f	2026-08-28 11:00:27.388
59f1d92f-f996-438a-afc2-9afb95e29259	a39ec761-b5f0-4d0e-8fa1-8157c489a483	Contact	/contact	4	t	t	2026-08-28 11:00:27.388
e613bcae-8047-4264-85d4-7bdd5e7fe506	06a59353-2622-4a73-8d57-c1612a52668c	Home	/	0	t	t	2026-08-28 18:20:26.832
c7ccf081-f4cc-4726-b24d-357cb1ea725f	06a59353-2622-4a73-8d57-c1612a52668c	Shop	/shop	1	t	t	2026-08-28 18:20:26.832
6ae6dd33-1613-4b28-9549-fbd721fa4dfa	06a59353-2622-4a73-8d57-c1612a52668c	About	/about	2	t	f	2026-08-28 18:20:26.832
ccb4c3e4-4ac9-4d45-9f77-7dc30dd2889a	06a59353-2622-4a73-8d57-c1612a52668c	FAQ	/faq	3	t	f	2026-08-28 18:20:26.832
83ebc05a-f592-483b-9ab0-a781801f67af	06a59353-2622-4a73-8d57-c1612a52668c	Contact	/contact	4	t	t	2026-08-28 18:20:26.832
36b195fb-8964-4b27-b08b-91e65c913788	58455a48-85b6-4aba-ae9f-ef2eacdb901d	Home	/	0	t	t	2026-08-29 17:20:09.111
f67fdd4f-02ec-4712-ae48-23833e66c0ee	58455a48-85b6-4aba-ae9f-ef2eacdb901d	Shop	/shop	1	t	t	2026-08-29 17:20:09.111
476a6e74-b47a-4b4d-8be6-13b823cedd99	58455a48-85b6-4aba-ae9f-ef2eacdb901d	About	/about	2	t	f	2026-08-29 17:20:09.111
08144f70-3377-4246-a5c6-e7afe0714ee3	58455a48-85b6-4aba-ae9f-ef2eacdb901d	FAQ	/faq	3	t	f	2026-08-29 17:20:09.111
430c95e9-cc7f-4dab-9b0b-ab197a91267a	58455a48-85b6-4aba-ae9f-ef2eacdb901d	Contact	/contact	4	t	t	2026-08-29 17:20:09.111
3b6f4eaf-f016-480b-ae1d-3cdb58f764e8	dfec8b0e-a249-4374-b520-e1efec7eb887	Home	/	0	t	t	2026-08-29 17:57:51.569
8a09a02b-3093-4442-952f-8f24b92df012	dfec8b0e-a249-4374-b520-e1efec7eb887	Shop	/shop	1	t	t	2026-08-29 17:57:51.569
484967e4-cab1-4da4-8f22-574b03a51a67	dfec8b0e-a249-4374-b520-e1efec7eb887	About	/about	2	t	f	2026-08-29 17:57:51.569
02483d50-dafa-49fa-97be-a9a65143a2ba	dfec8b0e-a249-4374-b520-e1efec7eb887	FAQ	/faq	3	t	f	2026-08-29 17:57:51.569
f9b4a7fe-9077-4f46-873a-4dea20a79552	dfec8b0e-a249-4374-b520-e1efec7eb887	Contact	/contact	4	t	t	2026-08-29 17:57:51.569
2fcbabad-5e3b-4967-bb78-e2eefb256691	f325c639-1d17-4bc0-8936-fad99fbac0da	Home	/	0	t	t	2026-08-29 17:58:06.089
037e21b5-ce6a-4f2f-8aa6-0e974d0b1052	f325c639-1d17-4bc0-8936-fad99fbac0da	Shop	/shop	1	t	t	2026-08-29 17:58:06.089
597612e1-734f-4d9e-b40c-aa5e52474ba2	f325c639-1d17-4bc0-8936-fad99fbac0da	About	/about	2	t	f	2026-08-29 17:58:06.089
15e52d80-0ebd-4891-a738-54547ae56bc9	f325c639-1d17-4bc0-8936-fad99fbac0da	FAQ	/faq	3	t	f	2026-08-29 17:58:06.089
00d588bb-8b23-4ef5-bb7f-66cfce14beb6	f325c639-1d17-4bc0-8936-fad99fbac0da	Contact	/contact	4	t	t	2026-08-29 17:58:06.089
5499e70e-c9f8-4460-9938-112c4287188b	12064b33-d854-41b9-b18f-259169376d3c	Home	/	0	t	t	2026-08-29 17:58:32.69
8b7e1a14-549f-41aa-8e0d-f11c4715f090	12064b33-d854-41b9-b18f-259169376d3c	Shop	/shop	1	t	t	2026-08-29 17:58:32.69
b3b1ac88-b52f-4cda-8cc6-54a0221cee5b	12064b33-d854-41b9-b18f-259169376d3c	About	/about	2	t	f	2026-08-29 17:58:32.69
3c2867e0-27d7-405f-bf84-82f63b8a064a	12064b33-d854-41b9-b18f-259169376d3c	FAQ	/faq	3	t	f	2026-08-29 17:58:32.69
79048355-e9d1-4833-8861-20b908fe8b46	12064b33-d854-41b9-b18f-259169376d3c	Contact	/contact	4	t	t	2026-08-29 17:58:32.69
2303d231-4232-4a5b-bc24-58c865c07cbc	0cdc5f31-532d-4cf9-9540-775b011e0f8b	Home	/	0	t	t	2026-08-29 17:58:33.148
f6269f8a-c44d-4172-aaf0-9ed9251fc82e	0cdc5f31-532d-4cf9-9540-775b011e0f8b	Shop	/shop	1	t	t	2026-08-29 17:58:33.148
f90003a3-4dee-456a-887e-8eb48e5e4616	0cdc5f31-532d-4cf9-9540-775b011e0f8b	About	/about	2	t	f	2026-08-29 17:58:33.148
c8c00e4d-9a72-4643-aec7-e35549d5a2ef	0cdc5f31-532d-4cf9-9540-775b011e0f8b	FAQ	/faq	3	t	f	2026-08-29 17:58:33.148
b4783f7e-6339-4b34-a8c1-1d84451dca5b	0cdc5f31-532d-4cf9-9540-775b011e0f8b	Contact	/contact	4	t	t	2026-08-29 17:58:33.148
5f76dde7-09a8-481c-b391-069be1cd096f	0954bd57-98bd-451c-8488-bef1384ffd9a	Home	/	0	t	t	2026-08-29 18:41:59.407
c5c99c7e-e717-43ab-8ae8-98753afbd96a	0954bd57-98bd-451c-8488-bef1384ffd9a	Shop	/shop	1	t	t	2026-08-29 18:41:59.407
0830ba94-2983-46da-b7c1-e39b34171b31	0954bd57-98bd-451c-8488-bef1384ffd9a	About	/about	2	t	f	2026-08-29 18:41:59.407
ca740e36-5aec-4d07-ac4a-d62c49f09431	0954bd57-98bd-451c-8488-bef1384ffd9a	FAQ	/faq	3	t	f	2026-08-29 18:41:59.407
69e26994-2c45-417a-bfb9-851c02f0f0db	0954bd57-98bd-451c-8488-bef1384ffd9a	Contact	/contact	4	t	t	2026-08-29 18:41:59.407
\.


--
-- Data for Name: StorefrontSection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontSection" (id, "storefrontId", section, enabled, "sortOrder") FROM stdin;
ce64237f-23ae-4c8a-abbc-addcc66cdedc	6cbf24cd-d14a-431d-894c-a52d0f5379ff	hero	t	0
3c71acc0-d1db-423b-8502-85b67f5b006b	6cbf24cd-d14a-431d-894c-a52d0f5379ff	categories	t	1
100e4482-b532-4569-9911-28d16195a52c	6cbf24cd-d14a-431d-894c-a52d0f5379ff	featured	t	2
a6395b7a-f4c4-44e8-932d-36abfeb819ab	6cbf24cd-d14a-431d-894c-a52d0f5379ff	popular	t	3
3a66a847-df46-4755-93ad-5d6ad08b0874	6cbf24cd-d14a-431d-894c-a52d0f5379ff	new	t	4
1e64eb71-474f-4937-ad50-4eaa28cfd6a4	6cbf24cd-d14a-431d-894c-a52d0f5379ff	promo	t	5
76a6bb84-600e-42bf-8a18-452df2d03947	6cbf24cd-d14a-431d-894c-a52d0f5379ff	about	t	6
b1db3f32-34d0-460c-a400-afc00654416d	6cbf24cd-d14a-431d-894c-a52d0f5379ff	why	t	7
7ebc6df4-18b8-43f1-bfec-18e63d707b70	6cbf24cd-d14a-431d-894c-a52d0f5379ff	testimonials	t	8
29c48d16-86e4-4bcd-a8fd-b1f80ccfcbda	6cbf24cd-d14a-431d-894c-a52d0f5379ff	faq	t	9
cb55e18a-68b8-471c-bd76-d32dc65c8986	6cbf24cd-d14a-431d-894c-a52d0f5379ff	cta	t	10
50a3082d-dc65-4267-84d5-1fbc16bbd226	6cbf24cd-d14a-431d-894c-a52d0f5379ff	newsletter	f	11
61d94dca-4284-46f1-9ae5-e1c0d79bc62b	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	hero	t	0
71c32f2c-feb4-4e66-a714-089ad3f01ba6	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	categories	t	1
fec52235-307a-42da-9517-2e4af3543059	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	featured	t	2
0ed8f7f2-d441-4ce6-8dd9-aedea4bc4827	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	popular	t	3
1a1a1bdf-cf53-4895-92c1-1c1523c0a4c1	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	new	t	4
49a95684-9199-4dd4-922a-cd3af739b84e	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	promo	t	5
d45d688c-1c04-4126-84cc-53c2b916e592	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	about	t	6
a5ef12ce-dba0-4b4a-8dc6-38a3aa578701	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	why	t	7
b0888bca-fde4-475c-884b-584ac8011868	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	testimonials	t	8
73a1f369-9466-4cd3-8be0-308b6d10d9aa	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	faq	t	9
29c9e287-3dee-43c6-ad76-511c2eb03cda	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	cta	t	10
773fc7aa-d661-4ce2-a481-b1ea4c3e91c7	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	newsletter	f	11
8401c4dd-8398-4739-ab68-d65d13bb369b	a39ec761-b5f0-4d0e-8fa1-8157c489a483	popular	t	3
3f00e62e-295f-4ceb-9609-df4439c50a26	a39ec761-b5f0-4d0e-8fa1-8157c489a483	new	t	4
7fc44596-0c06-4358-8ab9-1030e8fe4565	a39ec761-b5f0-4d0e-8fa1-8157c489a483	promo	t	5
ec3abb37-576c-4377-ae3d-70d467d6ffb7	a39ec761-b5f0-4d0e-8fa1-8157c489a483	about	t	6
928ec90c-fff9-4538-a481-3f7917e12b9a	a39ec761-b5f0-4d0e-8fa1-8157c489a483	why	t	7
095039f2-fc10-48b9-aeb5-d8692486da5d	a39ec761-b5f0-4d0e-8fa1-8157c489a483	testimonials	t	8
d1ce65cf-daa2-4039-a23b-31aaf26b9856	a39ec761-b5f0-4d0e-8fa1-8157c489a483	faq	t	9
cd767567-e995-4e2d-977b-769d87cd5e29	a39ec761-b5f0-4d0e-8fa1-8157c489a483	cta	t	10
2687758e-264b-4cc3-b926-81390086e8ce	a39ec761-b5f0-4d0e-8fa1-8157c489a483	newsletter	t	11
2ea48adf-4b74-4c1e-8c20-4a44e0483220	06a59353-2622-4a73-8d57-c1612a52668c	hero	t	0
c8faf970-f64a-4a78-ab13-90129abc16ee	06a59353-2622-4a73-8d57-c1612a52668c	categories	t	1
ed82bb51-e8d4-43bc-ac5c-0bfe99c57b23	06a59353-2622-4a73-8d57-c1612a52668c	featured	t	2
316af3d5-aded-4e03-b762-a477dbaf07c1	a39ec761-b5f0-4d0e-8fa1-8157c489a483	featured	t	0
7251d174-7725-4ff7-ad8b-5f7c89c643a3	a39ec761-b5f0-4d0e-8fa1-8157c489a483	hero	t	1
df0be81f-bb20-40ed-9bd7-60dc1bbabf4e	a39ec761-b5f0-4d0e-8fa1-8157c489a483	categories	t	2
ac6a02a8-c379-4464-afd6-d6cd3a9f17dc	06a59353-2622-4a73-8d57-c1612a52668c	popular	t	3
2691ad85-0a4a-41e4-930e-e437065f1be5	06a59353-2622-4a73-8d57-c1612a52668c	new	t	4
c48fed3b-c75e-4ec5-abe1-b374d7e64fbe	06a59353-2622-4a73-8d57-c1612a52668c	promo	t	5
54744101-09df-4c34-8f2d-9834e8ceb406	06a59353-2622-4a73-8d57-c1612a52668c	about	t	6
5814f528-1578-4059-9aa3-4b939b4c920d	06a59353-2622-4a73-8d57-c1612a52668c	why	t	7
82e4faf8-2870-466f-8445-e448a4ca6d58	06a59353-2622-4a73-8d57-c1612a52668c	testimonials	t	8
8b02c223-92f1-41cc-931d-2f3506cef623	06a59353-2622-4a73-8d57-c1612a52668c	faq	t	9
d857a7ef-928a-4989-aaef-eb6571bad13d	06a59353-2622-4a73-8d57-c1612a52668c	cta	t	10
9a7f3b40-fb6d-4751-afd9-b962e11ae8e3	06a59353-2622-4a73-8d57-c1612a52668c	newsletter	f	11
7fcdbebb-24ec-493a-aa03-c52c420e8fd2	58455a48-85b6-4aba-ae9f-ef2eacdb901d	hero	t	0
f3773c02-8757-4353-9619-6762369995e4	58455a48-85b6-4aba-ae9f-ef2eacdb901d	categories	t	1
3cef234a-11f5-4c2b-bac8-5342efc6a78a	58455a48-85b6-4aba-ae9f-ef2eacdb901d	featured	t	2
d4a46447-0942-46bc-bf4d-319e359bca99	58455a48-85b6-4aba-ae9f-ef2eacdb901d	popular	t	3
36ef01c5-c6e2-4ee2-8129-4aec5cc7f38a	58455a48-85b6-4aba-ae9f-ef2eacdb901d	new	t	4
71d32930-5dd7-4cad-a612-93c8d1e7462a	58455a48-85b6-4aba-ae9f-ef2eacdb901d	promo	t	5
d43a9992-cd81-4869-8127-3c23ea3929b2	58455a48-85b6-4aba-ae9f-ef2eacdb901d	about	t	6
f1228de6-e06c-4992-b72a-7150be959391	58455a48-85b6-4aba-ae9f-ef2eacdb901d	why	t	7
8b3e2f8b-dbda-43dc-b19f-5bf14e672ab4	58455a48-85b6-4aba-ae9f-ef2eacdb901d	testimonials	t	8
05f64fcb-5a7c-4d71-a89a-28a7b45dd2d7	58455a48-85b6-4aba-ae9f-ef2eacdb901d	faq	t	9
993b95a0-94e7-4bf8-9c7b-cdca1a4ade1b	58455a48-85b6-4aba-ae9f-ef2eacdb901d	cta	t	10
613f1dc2-3f3d-4d7a-bd70-2a1369e66133	58455a48-85b6-4aba-ae9f-ef2eacdb901d	newsletter	f	11
96dd7763-75d9-4d3a-b5d4-f2b850dfeb6f	dfec8b0e-a249-4374-b520-e1efec7eb887	hero	t	0
bd849cef-5124-40c4-9277-32181f667827	dfec8b0e-a249-4374-b520-e1efec7eb887	categories	t	1
52cce854-cb25-45cf-9ea2-7ecf6d753b49	dfec8b0e-a249-4374-b520-e1efec7eb887	featured	t	2
bf3bd869-0e94-4356-94aa-43e743559e5a	dfec8b0e-a249-4374-b520-e1efec7eb887	popular	t	3
a9ebcbd5-8e9d-48d6-a55f-79ade338d84c	dfec8b0e-a249-4374-b520-e1efec7eb887	new	t	4
78a3ea2f-9a99-4975-872c-560bd2239cfc	dfec8b0e-a249-4374-b520-e1efec7eb887	promo	t	5
f14a44e8-fa86-48b5-b877-8207e221ea78	dfec8b0e-a249-4374-b520-e1efec7eb887	about	t	6
bf07f6af-690c-4b9e-8b55-54956ef57603	dfec8b0e-a249-4374-b520-e1efec7eb887	why	t	7
519abdcf-fcfd-458c-97ae-fa9242324677	dfec8b0e-a249-4374-b520-e1efec7eb887	testimonials	t	8
a6087c3a-3e2e-46f7-a46a-b66de381e3ae	dfec8b0e-a249-4374-b520-e1efec7eb887	faq	t	9
45d561a3-9b93-476e-83e0-221910065945	dfec8b0e-a249-4374-b520-e1efec7eb887	cta	t	10
da063783-0016-4910-b067-e33b3c4c7f4b	dfec8b0e-a249-4374-b520-e1efec7eb887	newsletter	f	11
14fe9015-8c0d-434b-be8f-ecdaae852fb6	f325c639-1d17-4bc0-8936-fad99fbac0da	hero	t	0
7ff3c166-51a7-468a-99b7-ed4926203062	f325c639-1d17-4bc0-8936-fad99fbac0da	categories	t	1
18c1f8b1-3871-4786-ab38-c459d7b49ab7	f325c639-1d17-4bc0-8936-fad99fbac0da	featured	t	2
7eb82d6e-abfe-4962-a4e7-12c4bfcf576c	f325c639-1d17-4bc0-8936-fad99fbac0da	popular	t	3
120fcaac-8ade-4cc6-a9ad-4089079f458a	f325c639-1d17-4bc0-8936-fad99fbac0da	new	t	4
e20c0c1d-82c2-4ea5-8a75-312f899e3d35	f325c639-1d17-4bc0-8936-fad99fbac0da	promo	t	5
ff82fa74-e9e5-428c-b834-7c89435f1136	f325c639-1d17-4bc0-8936-fad99fbac0da	about	t	6
6843a918-2117-4d6f-833c-091a7aad2a79	f325c639-1d17-4bc0-8936-fad99fbac0da	why	t	7
f59fcf7f-a99e-4a32-afcf-41e5ad5a9801	f325c639-1d17-4bc0-8936-fad99fbac0da	testimonials	t	8
0018c839-ae5c-4dcc-b8fa-81e58a1143c3	f325c639-1d17-4bc0-8936-fad99fbac0da	faq	t	9
a0dfde8b-a30c-42fe-ad02-bfd7145c2ac0	f325c639-1d17-4bc0-8936-fad99fbac0da	cta	t	10
544a9886-3fe5-49dd-8e13-99492da7c57c	f325c639-1d17-4bc0-8936-fad99fbac0da	newsletter	f	11
51cb214e-5556-4442-bb60-b408c9805fe8	12064b33-d854-41b9-b18f-259169376d3c	hero	t	0
8cf060bf-5816-4168-82b7-ae3af15d7806	12064b33-d854-41b9-b18f-259169376d3c	categories	t	1
9c98b2c6-acf9-464e-919d-c8410a2d5952	12064b33-d854-41b9-b18f-259169376d3c	featured	t	2
fee20c1c-2830-4e1d-a3ae-0144d3008dab	12064b33-d854-41b9-b18f-259169376d3c	popular	t	3
dccfebcc-5d94-4a1b-a918-27c207c7de51	12064b33-d854-41b9-b18f-259169376d3c	new	t	4
ec0a791e-4a3a-404e-be94-9b541d7c6116	12064b33-d854-41b9-b18f-259169376d3c	promo	t	5
6d32528a-75ec-4fff-ba38-be6752406b99	12064b33-d854-41b9-b18f-259169376d3c	about	t	6
62fc019f-b5a3-4ebe-bb4a-28630158188b	12064b33-d854-41b9-b18f-259169376d3c	why	t	7
60b8b2df-4d48-49a1-a5d4-269f52799bfb	12064b33-d854-41b9-b18f-259169376d3c	testimonials	t	8
effd1c81-4746-41cd-8ac5-cea0287198a6	12064b33-d854-41b9-b18f-259169376d3c	faq	t	9
f68c2c53-730b-47d0-9d6f-e027048b8cc4	12064b33-d854-41b9-b18f-259169376d3c	cta	t	10
ecbae88d-0f20-4337-8884-6e0cf908187d	12064b33-d854-41b9-b18f-259169376d3c	newsletter	f	11
e3005d07-99fa-4f5a-a1bb-d97d2a99b5fa	0cdc5f31-532d-4cf9-9540-775b011e0f8b	hero	t	0
fd9a0aa0-670e-4e5a-babd-a2b024171da3	0cdc5f31-532d-4cf9-9540-775b011e0f8b	categories	t	1
f98d9a38-960a-411e-b17e-5938f92fc76a	0cdc5f31-532d-4cf9-9540-775b011e0f8b	featured	t	2
e338f4fe-933f-40a2-85ad-4c3e830083ea	0cdc5f31-532d-4cf9-9540-775b011e0f8b	popular	t	3
043ca828-0049-4459-8c6f-12247b653478	0cdc5f31-532d-4cf9-9540-775b011e0f8b	new	t	4
7e3638f9-d1ae-4c1b-87dc-debd784c640f	0cdc5f31-532d-4cf9-9540-775b011e0f8b	promo	t	5
79fc7770-fea1-4799-9ee2-53dd98025b18	0cdc5f31-532d-4cf9-9540-775b011e0f8b	about	t	6
0bf098bd-b98e-46ee-9b98-5da9b7b91ed7	0cdc5f31-532d-4cf9-9540-775b011e0f8b	why	t	7
5143310b-aea2-4d3c-a6d7-f7e7fd80258b	0cdc5f31-532d-4cf9-9540-775b011e0f8b	testimonials	t	8
50761ac1-25cf-4f78-b43c-31420893fe54	0cdc5f31-532d-4cf9-9540-775b011e0f8b	faq	t	9
5c9eb434-ed43-4749-927e-02642839b0ea	0cdc5f31-532d-4cf9-9540-775b011e0f8b	cta	t	10
4c0f64bb-30ee-4239-ab2c-291810b98eaa	0cdc5f31-532d-4cf9-9540-775b011e0f8b	newsletter	f	11
e2c2cd4e-7914-4803-9907-0d813fec5b8f	6cbf24cd-d14a-431d-894c-a52d0f5379ff	stats	t	12
50c476cf-d1ff-4dab-befe-8caf251eda25	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	stats	t	12
4358e697-41ef-4d25-b6a7-98726fe19180	a39ec761-b5f0-4d0e-8fa1-8157c489a483	stats	t	12
964f60c5-34bf-4bfc-be99-b796c3bcaba5	06a59353-2622-4a73-8d57-c1612a52668c	stats	t	12
18ebcf63-b77d-4523-9fd8-47b75a4b876e	58455a48-85b6-4aba-ae9f-ef2eacdb901d	stats	t	12
51504805-ac76-4014-9d17-d11bcb181ede	dfec8b0e-a249-4374-b520-e1efec7eb887	stats	t	12
903a8cfe-4388-45c7-8ad9-6dd838db3810	f325c639-1d17-4bc0-8936-fad99fbac0da	stats	t	12
6893efd3-ab8b-4435-b548-814782ee300f	9edfd553-9cbe-445d-a84b-9209933279ce	hero	t	0
25d18136-49ae-476b-86ba-d97352ded7ad	9edfd553-9cbe-445d-a84b-9209933279ce	categories	t	1
84fc6169-af11-46a1-85f4-4ff9bc9690fe	9edfd553-9cbe-445d-a84b-9209933279ce	featured	t	2
f381d545-48f7-4b92-bf47-33f5c5f369f1	9edfd553-9cbe-445d-a84b-9209933279ce	popular	t	3
36dcfdc9-7931-4f7a-a388-0ee0fee54acf	9edfd553-9cbe-445d-a84b-9209933279ce	new	t	4
3217f557-e5bf-459f-8e99-f9a0bf8d24e5	9edfd553-9cbe-445d-a84b-9209933279ce	stats	t	5
efad0284-428a-4889-a0fa-def155299cba	9edfd553-9cbe-445d-a84b-9209933279ce	promo	t	6
8ee179db-bdec-43ff-976b-ba01900ce8e6	9edfd553-9cbe-445d-a84b-9209933279ce	about	t	7
3333e0de-a60a-49ad-86b9-fb1721ece76c	9edfd553-9cbe-445d-a84b-9209933279ce	why	t	8
c5814191-3d05-4f25-a1d8-0cc6e31d8a84	9edfd553-9cbe-445d-a84b-9209933279ce	testimonials	t	9
82b7dfa8-8210-475e-a50f-c8e5ac6402da	9edfd553-9cbe-445d-a84b-9209933279ce	faq	t	10
d16046d2-49eb-4d0b-835e-23a00381cb6f	9edfd553-9cbe-445d-a84b-9209933279ce	cta	t	11
edbfc586-56bf-4d75-ae01-4bde4e4225fb	9edfd553-9cbe-445d-a84b-9209933279ce	newsletter	f	12
619420cb-f6d7-4013-b231-75cedb14a791	12064b33-d854-41b9-b18f-259169376d3c	stats	t	12
f40c5619-dbdc-498a-89a4-6ceab08a4880	0cdc5f31-532d-4cf9-9540-775b011e0f8b	stats	t	12
d4566928-7091-4363-ba0c-70bf13c973a0	0954bd57-98bd-451c-8488-bef1384ffd9a	hero	t	0
75c58c5d-280f-4cfc-b7a6-dec07a457f9b	0954bd57-98bd-451c-8488-bef1384ffd9a	categories	t	1
b5522809-1f77-4538-97fc-9fb954d63461	0954bd57-98bd-451c-8488-bef1384ffd9a	featured	t	2
d87730a8-825e-4715-8f7e-314b8bbf983a	0954bd57-98bd-451c-8488-bef1384ffd9a	popular	t	3
28e947fd-db60-4fe7-9494-d57485a29da3	0954bd57-98bd-451c-8488-bef1384ffd9a	new	t	4
b2452979-aee1-4331-88ca-a9b48976c1dd	0954bd57-98bd-451c-8488-bef1384ffd9a	stats	t	5
44bcbf5c-e430-4983-b872-6b5251a01195	0954bd57-98bd-451c-8488-bef1384ffd9a	promo	t	6
b3b42ec1-fffd-44a1-97b7-922011123086	0954bd57-98bd-451c-8488-bef1384ffd9a	about	t	7
249dce5d-f0f7-4d62-a77f-db7b38cc1ce7	0954bd57-98bd-451c-8488-bef1384ffd9a	why	t	8
340e9b4e-54af-455f-8185-fb12f85d4ca3	0954bd57-98bd-451c-8488-bef1384ffd9a	testimonials	t	9
e2f2263c-c6bf-4d33-9b9b-3d8d094f751d	0954bd57-98bd-451c-8488-bef1384ffd9a	faq	t	10
ca805633-06dc-4ee5-82ca-08dc09ef0c0c	0954bd57-98bd-451c-8488-bef1384ffd9a	cta	t	11
d441aba8-556f-45f2-82df-c990aeb2cd36	0954bd57-98bd-451c-8488-bef1384ffd9a	newsletter	f	12
\.


--
-- Data for Name: StorefrontSeo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontSeo" (id, "storefrontId", title, description, keywords, "ogImageUrl", "ogImagePublicId", "ogTitle", "ogDescription") FROM stdin;
b95035ad-f2b4-43db-be22-6450cb5aa574	6cbf24cd-d14a-431d-894c-a52d0f5379ff	\N	\N	\N	\N	\N	\N	\N
97648b43-9fdd-43ba-8266-319ab191dede	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	\N	\N	\N	\N	\N	\N	\N
de9442bf-cca6-475c-9884-672e97066cd4	a39ec761-b5f0-4d0e-8fa1-8157c489a483	fresh product just buy one click	all that you need reaches you effortlessely	premium products	https://www.google.com/aclk?sa=L&ai=DChsSEwi8_rSd8cOWAxXZmYMHHdt-BCEYACICCAEQAxoCZWY&co=1&ase=2&gclid=CjwKCAjw48TUBhBREiwAK0GnQaw4yT8VVEsoIsR1ZjtV_pEohE_Cxj4hfNjf6NKxNXtceBx_vG4B-xoCxesQAvD_BwE&cid=CAASuQHkaHiCdjEJ6v-SqfI0A_MGZ5WKxmZzFOrSn7Ec0z6TLCALP9pWftFqi4AKErjb5l6eIltGcBcInosCcJOCpqlDp6JGaFOaQjmUIKcb2WYttfsvXrQspaHfQqLhbA8Qcj-P5TlId4A9b3D6A49zVoPFh4Bc2IN3x5OhkJtzliSXSB3AUKusLXJwd8Qoy9mVObTT3vD5xMITUq_2gc4miPrz8prCzDaI8eBSxGz_53mreSKoVvALuwBoSw&cce=2&category=acrcp_v1_32&sig=AOD64_2hNXp-Oizftkd0hR-hZr_toSv4Tg&ctype=5&q=&nis=4&ved=2ahUKEwj6l6-d8cOWAxVY1QIHHRt-LKcQ5bgDKAB6BAgFEBM&adurl=	\N	duka-store	discover more
75bb2b35-a130-4a64-ac35-223d90b08a99	06a59353-2622-4a73-8d57-c1612a52668c	\N	\N	\N	\N	\N	\N	\N
15492988-0552-4c0d-994c-54530e0195cd	58455a48-85b6-4aba-ae9f-ef2eacdb901d	\N	\N	\N	\N	\N	\N	\N
2718d3b8-9aac-41eb-ae25-d9c9dabb1914	dfec8b0e-a249-4374-b520-e1efec7eb887	\N	\N	\N	\N	\N	\N	\N
5e8e6924-b5b6-4823-bb0c-3911f1f6e09d	f325c639-1d17-4bc0-8936-fad99fbac0da	\N	\N	\N	\N	\N	\N	\N
ac532a79-1346-4417-b0dd-90f463b2b2b6	12064b33-d854-41b9-b18f-259169376d3c	\N	\N	\N	\N	\N	\N	\N
b8f412d1-cbea-4e31-a8b1-262f7a3ef61e	0cdc5f31-532d-4cf9-9540-775b011e0f8b	\N	\N	\N	\N	\N	\N	\N
3ec5a774-c2af-4d03-855b-1ed55037f588	9edfd553-9cbe-445d-a84b-9209933279ce	\N	\N	\N	\N	\N	\N	\N
0a4980f7-7c86-4b4b-9107-f573cb6fd19a	0954bd57-98bd-451c-8488-bef1384ffd9a	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: StorefrontSocial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontSocial" (id, "storefrontId", facebook, instagram, tiktok, twitter, youtube, linkedin) FROM stdin;
1df1aa62-bdfa-4451-9db9-69bf5a9918af	6cbf24cd-d14a-431d-894c-a52d0f5379ff	\N	\N	\N	\N	\N	\N
b53ce3fa-36b8-4016-a9d5-597bbd5f8e0d	75e8b45d-144e-4196-96fd-0f3a0dee0ed6	\N	\N	\N	\N	\N	\N
9c94f004-4de5-4b3c-b428-e0d94988a335	a39ec761-b5f0-4d0e-8fa1-8157c489a483	https://facebook/@duka-store	\N	\N	https://tweeter/dukastock	\N	\N
0e46e393-03a8-4d60-9b86-f527292bc7f8	06a59353-2622-4a73-8d57-c1612a52668c	\N	\N	\N	\N	\N	\N
4b854b3c-db62-45c3-9d6a-10ce7d595759	58455a48-85b6-4aba-ae9f-ef2eacdb901d	\N	\N	\N	\N	\N	\N
03532b0a-0aa0-4c71-ac16-08c5c37aedbc	dfec8b0e-a249-4374-b520-e1efec7eb887	\N	\N	\N	\N	\N	\N
6dec0cc7-9261-45e7-b68c-1c28dae16093	f325c639-1d17-4bc0-8936-fad99fbac0da	\N	\N	\N	\N	\N	\N
1158bca1-8e25-431c-99c0-1454220691cb	12064b33-d854-41b9-b18f-259169376d3c	\N	\N	\N	\N	\N	\N
0a5a63c3-1982-4b60-9e1b-35fc172076f1	0cdc5f31-532d-4cf9-9540-775b011e0f8b	\N	\N	\N	\N	\N	\N
53874628-8aee-4697-b78b-2b4197a2d099	9edfd553-9cbe-445d-a84b-9209933279ce	\N	\N	\N	\N	\N	\N
5986b16b-734e-4c38-8987-aa7c89baeb01	0954bd57-98bd-451c-8488-bef1384ffd9a	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: StorefrontTestimonial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StorefrontTestimonial" (id, "storefrontId", "customerName", role, content, "imageUrl", "imagePublicId", rating, featured, enabled, "sortOrder", "createdAt") FROM stdin;
b4d94fad-e72c-48fe-9402-f6ad58d63c99	a39ec761-b5f0-4d0e-8fa1-8157c489a483	james bond	happy customer	premium services	\N	\N	5	t	t	0	2026-08-28 16:41:22.369
61953c5e-46d0-4b52-b027-b471ef0fdaeb	a39ec761-b5f0-4d0e-8fa1-8157c489a483	simon doe	happy client	premium services	https://res.cloudinary.com/dmuozeb3/image/upload/v1787935506/dukastock/storefront/testimonials/dpf2jlzwbjmsfjukxbqg.jpg	dukastock/storefront/testimonials/dpf2jlzwbjmsfjukxbqg	4	t	t	1	2026-08-28 16:45:12.361
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id, "shopId", name, phone, email, address, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TaxRate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaxRate" (id, "shopId", name, rate, type, category, "isActive", "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", email, phone, "passwordHash", role, "shopId", "createdAt", "updatedAt", avatar, "lastLoginAt", "registerId", status, "userName", "roleId") FROM stdin;
c45b3c8c-bb8e-4969-87b2-59a18542003c	Test Owner	a-1787900915580@test.app	+254722000000	$argon2id$v=19$m=65536,t=3,p=4$WAkKTXGX73rs5wszDOQObQ$fwrtUEc34o0b4FIN9dYlyVTkGIiNz3w37ynXmLP9JMs	OWNER	36e5b1c0-9f50-4000-98bf-9749a3830ff7	2026-08-28 07:08:35.866	2026-08-28 07:08:35.892	\N	\N	\N	ACTIVE	\N	\N
f061112e-5665-4cc5-86c9-6e8d4bbfa3e9	Test Owner	b-1787900915925@test.app	+254722000000	$argon2id$v=19$m=65536,t=3,p=4$kCHsT02RGgT/fm+fwnFiHg$lq/0j09ulC0rG7sFGN/mAAys7x+UzBC7RDE5AuItGsE	OWNER	2c0277f0-74d4-4339-aa86-29569c824c2c	2026-08-28 07:08:36.031	2026-08-28 07:08:36.035	\N	\N	\N	ACTIVE	\N	\N
1a5c3b0c-1523-4d0a-886a-8cc0549a417e	alpha dev	collinsodiera8@gmail.com	+254715519158	$argon2id$v=19$m=65536,t=3,p=4$80oj9KRGwszgnpjUTXo14g$WItC3uWG8L3rloGKBTNOj2wVeAUIGwLljRrOeboCheM	OWNER	66317cfd-9b7e-4f9f-bd64-f26dd5e3707d	2026-08-28 18:20:08.089	2026-08-28 18:20:08.099	\N	\N	\N	ACTIVE	\N	\N
834b38d0-1210-4ce4-8386-d0e70f858ac4	Sync Tester	sync-1788024007261@test.app	+254722000000	$argon2id$v=19$m=65536,t=3,p=4$6IZ5IS4AcKSD/p7y0eyjlw$7JDKsmuggAQ95CpcnshjF9OpLtj5bWGzEeAcMBDgbFg	OWNER	a92a814a-89c7-41d0-bf6a-2ab1bc8004b6	2026-08-29 17:20:08.84	2026-08-29 17:20:08.89	\N	\N	\N	ACTIVE	\N	\N
f4086037-8201-4f8f-affb-92feba107e45	Sync Tester	sync-1788026271121@test.app	+254722000000	$argon2id$v=19$m=65536,t=3,p=4$W+Msj5X8l8iNuuKxJaSnTA$7oZOyBFNmBHaIYxK6cvoDl7FF9JPSlKp8l8/ENycr7I	OWNER	73bd792f-6b71-4ed9-b3a5-e262ccf8248a	2026-08-29 17:57:51.449	2026-08-29 17:57:51.456	\N	\N	\N	ACTIVE	\N	\N
96c6a302-1d3a-4480-9e7e-a6d85a6687f6	Iso Tester	iso-a-1788026285781@test.app	+254722000001	$argon2id$v=19$m=65536,t=3,p=4$jKcna7dWPJBLgcJXahAJng$ffdkEN551FqI0gajGh2l1CHM6gOCPI2iRQ9wu0ykUwI	OWNER	203957bf-5a60-4946-b41a-6d6b0b09dde1	2026-08-29 17:58:06.023	2026-08-29 17:58:06.026	\N	\N	\N	ACTIVE	\N	\N
846b74bf-d3fd-408c-9cd9-8565b3892462	Iso Tester B	iso-b-1788026285781@test.app	+254722000002	$argon2id$v=19$m=65536,t=3,p=4$ZkSXqDTBV0esYa+NWFVl3g$yRiVsEjFqRzMDLMLEnFtGKUViP19c425xEh0sDB57CY	OWNER	1888feee-4c42-4668-920c-8a963bd24121	2026-08-29 17:58:06.402	2026-08-29 17:58:06.406	\N	\N	\N	ACTIVE	\N	\N
55595391-0893-4040-aeef-93b9eb1f2d37	Iso Tester	iso-a-1788026312365@test.app	+254722000001	$argon2id$v=19$m=65536,t=3,p=4$bimsxvyQm3febVCwm1ygEg$mitLUvrxTA7mV4p855ssBaRa116Hm9UQ7v6VDR7q45I	OWNER	f158f2aa-2ccf-4df2-ba92-9d188edd231c	2026-08-29 17:58:32.628	2026-08-29 17:58:32.634	\N	\N	\N	ACTIVE	\N	\N
4cb8b109-fab6-4622-8685-a5d7e4c29ec4	Iso Tester B	iso-b-1788026312365@test.app	+254722000002	$argon2id$v=19$m=65536,t=3,p=4$TqpBC+bfPgNRN+PUHL++7g$+gVYRgC40DOnn0MChHw3x1iRXPc3X53omAsdmRJDaHs	OWNER	f564a2d1-1d03-411b-b375-a4f2f9b5cbd0	2026-08-29 17:58:33.094	2026-08-29 17:58:33.102	\N	\N	\N	ACTIVE	\N	\N
dafa8dcf-aea8-41cf-9787-3607f4fcd52c	Alpha AGX	alphaagx@gmail.com	+254715519467	$argon2id$v=19$m=65536,t=3,p=4$QAvo2FILMvawL/AZlJRIBg$zGqAeyHWuFfGBIaKf480OIynaQwfdsV7qtS4BmxSfIM	OWNER	20a7d3bf-dbe3-452c-8e41-889f793ba205	2026-08-29 18:41:50.034	2026-08-29 18:41:50.058	\N	\N	\N	ACTIVE	\N	\N
fa2413b2-aaab-43af-93ee-a6c39faac026	jeremiah odiero	jeremiah@gmail.com	+254735519158	$argon2id$v=19$m=65536,t=3,p=4$FRuAECJDFe0Hd9XlPy3ivA$ziUOeqwvlsCGWfXXR2JFBNCPcrjSrNZOrsg96GFPx5A	CASHIER	20a7d3bf-dbe3-452c-8e41-889f793ba205	2026-08-30 19:34:07.022	2026-08-30 19:35:14.361	\N	2026-08-30 19:35:14.359	\N	ACTIVE	jeremiah02	\N
b6cdc775-a7de-4a96-a3c8-9c065dd2b3cf	Collins Odiera	mamanjeri@gmail.com	+254715519158	$argon2id$v=19$m=65536,t=3,p=4$fpboiu6wtAoxPGYkAYAmYA$CaSXNeq4Ko4JrVYFw0SVo0sSF0Xe/94gMc/kFlZwFps	OWNER	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	2026-08-28 07:12:57.884	2026-08-30 19:36:22	\N	2026-08-30 19:36:21.999	\N	ACTIVE	\N	\N
8931ae96-07d9-4f2e-bde6-c48d5ffa3e47	mary adhiambo	mary@gmail.com	0768763848	$argon2id$v=19$m=65536,t=3,p=4$llOXZUEQX0vQsqngEj4D0g$RPPEw7xBaHB9PJS8ftG1lrLE6LJKWZP1bTdym3pxy8k	CASHIER	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	2026-08-31 19:48:03.186	2026-08-31 19:48:03.186	\N	\N	05d3eb3e-868d-43f5-99eb-856875110e39	ACTIVE	\N	\N
edce4d0b-932b-4cfc-b5b9-5cafc2c81588	mary andee	maryandee@gmail.com	0749305867	$argon2id$v=19$m=65536,t=3,p=4$0I/TuIeyjDUxfs51Ml6cfA$3tIpW3w5xhYzfAL3xIfnMkOWgdACyf/vfUfAdhUL/IU	CASHIER	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	2026-08-31 19:49:10.321	2026-08-31 19:49:10.321	\N	\N	05d3eb3e-868d-43f5-99eb-856875110e39	ACTIVE	\N	\N
17202f24-d0d5-45e7-a07c-a498fedb81ec	mary ndee	maryndee@gmail.com	0723435367	$argon2id$v=19$m=65536,t=3,p=4$DpiMgITzKBSmt4SFUodYEg$WulYRY9q6D+MSZQQA1VNah5MCeGI0gqUtvGqQKETF1M	CASHIER	83e9175d-f2d0-4e4c-b8ef-cd42b68ecf7e	2026-08-31 19:50:42.587	2026-08-31 19:50:42.587	\N	\N	05d3eb3e-868d-43f5-99eb-856875110e39	ACTIVE	\N	\N
\.


--
-- Data for Name: UserPermissionOverride; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserPermissionOverride" (id, "userId", "permissionId", granted, "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
31cef5bf-d07c-473a-a417-0e373cf67ac5	cafc193ee0dc70cf63a6a95c515dd202e796e7647c6b8b655cdfda1bde7b4917	2026-08-27 12:20:29.3376+03	20260827092028_init	\N	\N	2026-08-27 12:20:28.692413+03	1
bccb00f7-f9e0-4ddf-9614-09e7de29d77d	0da652a91476504ca259a307183e5db14d0b6a8f500d27db045f57f5961fa441	2026-08-28 09:23:25.604019+03	20260828000000_add_orders_customers_cloudinary	\N	\N	2026-08-28 09:23:25.073953+03	1
847946d9-fa60-418f-99b5-5262a475af51	85915228f175813dfd1e7697381834075c64e63845bd2e129e181ff44632f890	2026-08-28 09:31:41.79501+03	20260828000100_add_stock_movement_values	\N	\N	2026-08-28 09:31:41.768603+03	1
cac0765a-8e78-4f73-971b-ab87b0141b70	80b553739f022eb9cb181a629163aaaa44bf4594c4bd0c9ec979ee529947230c	2026-08-28 09:58:50.183955+03	20260828065849_add_storefront_cms	\N	\N	2026-08-28 09:58:49.948849+03	1
d09282f5-aa8e-4a40-9af4-6fcf9d175b79	c77071b5c4c54b11e765f8ac7744e555124ace6b2f812dc316c31a63e3752d5e	2026-08-30 21:45:16.822546+03	20260830184516_receipt_system	\N	\N	2026-08-30 21:45:16.639607+03	1
008bde00-2511-4151-aad4-99f55abcf419	3966afcba8ec4b9ccc2b421208b2a8b1319dcee76ed48f16ab36d6b0623cc4c8	2026-08-30 22:08:16.772689+03	20260830190816_staff_rbac_registers	\N	\N	2026-08-30 22:08:16.656028+03	1
3c2320d5-9559-4ea3-8c06-072d8f1bd8ec	28510df74637cff3840e19e453f9625ed7ec2392f8d2fa50d0fa97b83239b915	2026-08-31 20:23:24.319648+03	20260831172257_roles_permissions	\N	\N	2026-08-31 20:23:23.438652+03	1
b726c6a8-e9dd-499a-8170-91a6f96df183	edcf8417ca748f4d6995c809d57514722aaf616ae06dbe95ea9d333bc196beda	2026-09-01 20:32:03.959825+03	20260901172939_add_payments_returns_variants_batches_tax	\N	\N	2026-09-01 20:32:03.500971+03	1
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Batch Batch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_pkey" PRIMARY KEY (id);


--
-- Name: CashMovement CashMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: Invitation Invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseItem PurchaseItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: Register Register_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Register"
    ADD CONSTRAINT "Register_pkey" PRIMARY KEY (id);


--
-- Name: ReturnItem ReturnItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnItem"
    ADD CONSTRAINT "ReturnItem_pkey" PRIMARY KEY (id);


--
-- Name: Return Return_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Return"
    ADD CONSTRAINT "Return_pkey" PRIMARY KEY (id);


--
-- Name: RoleLimit RoleLimit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoleLimit"
    ADD CONSTRAINT "RoleLimit_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SaleItem SaleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: Shift Shift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_pkey" PRIMARY KEY (id);


--
-- Name: Shop Shop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontAbout StorefrontAbout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontAbout"
    ADD CONSTRAINT "StorefrontAbout_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontBranding StorefrontBranding_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontBranding"
    ADD CONSTRAINT "StorefrontBranding_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontContact StorefrontContact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontContact"
    ADD CONSTRAINT "StorefrontContact_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontFaq StorefrontFaq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFaq"
    ADD CONSTRAINT "StorefrontFaq_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontFeature StorefrontFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFeature"
    ADD CONSTRAINT "StorefrontFeature_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontFeatured StorefrontFeatured_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFeatured"
    ADD CONSTRAINT "StorefrontFeatured_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontHero StorefrontHero_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontHero"
    ADD CONSTRAINT "StorefrontHero_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontNavItem StorefrontNavItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontNavItem"
    ADD CONSTRAINT "StorefrontNavItem_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontSection StorefrontSection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSection"
    ADD CONSTRAINT "StorefrontSection_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontSeo StorefrontSeo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSeo"
    ADD CONSTRAINT "StorefrontSeo_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontSocial StorefrontSocial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSocial"
    ADD CONSTRAINT "StorefrontSocial_pkey" PRIMARY KEY (id);


--
-- Name: StorefrontTestimonial StorefrontTestimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontTestimonial"
    ADD CONSTRAINT "StorefrontTestimonial_pkey" PRIMARY KEY (id);


--
-- Name: Storefront Storefront_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Storefront"
    ADD CONSTRAINT "Storefront_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: TaxRate TaxRate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaxRate"
    ADD CONSTRAINT "TaxRate_pkey" PRIMARY KEY (id);


--
-- Name: UserPermissionOverride UserPermissionOverride_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissionOverride"
    ADD CONSTRAINT "UserPermissionOverride_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_shopId_idx" ON public."AuditLog" USING btree ("shopId");


--
-- Name: Batch_expiryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Batch_expiryDate_idx" ON public."Batch" USING btree ("expiryDate");


--
-- Name: Batch_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Batch_productId_idx" ON public."Batch" USING btree ("productId");


--
-- Name: Batch_shopId_batchNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Batch_shopId_batchNumber_key" ON public."Batch" USING btree ("shopId", "batchNumber");


--
-- Name: Batch_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Batch_shopId_idx" ON public."Batch" USING btree ("shopId");


--
-- Name: Batch_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Batch_status_idx" ON public."Batch" USING btree (status);


--
-- Name: Batch_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Batch_variantId_idx" ON public."Batch" USING btree ("variantId");


--
-- Name: CashMovement_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashMovement_createdAt_idx" ON public."CashMovement" USING btree ("createdAt");


--
-- Name: CashMovement_registerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashMovement_registerId_idx" ON public."CashMovement" USING btree ("registerId");


--
-- Name: CashMovement_shiftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashMovement_shiftId_idx" ON public."CashMovement" USING btree ("shiftId");


--
-- Name: CashMovement_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashMovement_shopId_idx" ON public."CashMovement" USING btree ("shopId");


--
-- Name: Category_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_shopId_idx" ON public."Category" USING btree ("shopId");


--
-- Name: Category_shopId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_shopId_name_key" ON public."Category" USING btree ("shopId", name);


--
-- Name: Customer_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_phone_idx" ON public."Customer" USING btree (phone);


--
-- Name: Customer_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_shopId_idx" ON public."Customer" USING btree ("shopId");


--
-- Name: Expense_expenseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Expense_expenseDate_idx" ON public."Expense" USING btree ("expenseDate");


--
-- Name: Expense_shopId_expenseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Expense_shopId_expenseDate_idx" ON public."Expense" USING btree ("shopId", "expenseDate");


--
-- Name: Expense_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Expense_shopId_idx" ON public."Expense" USING btree ("shopId");


--
-- Name: Invitation_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invitation_email_idx" ON public."Invitation" USING btree (email);


--
-- Name: Invitation_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invitation_shopId_idx" ON public."Invitation" USING btree ("shopId");


--
-- Name: Invitation_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invitation_token_key" ON public."Invitation" USING btree (token);


--
-- Name: Notification_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);


--
-- Name: Notification_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_shopId_idx" ON public."Notification" USING btree ("shopId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: OrderItem_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_variantId_idx" ON public."OrderItem" USING btree ("variantId");


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: Order_shopId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_shopId_createdAt_idx" ON public."Order" USING btree ("shopId", "createdAt");


--
-- Name: Order_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_shopId_idx" ON public."Order" USING btree ("shopId");


--
-- Name: Order_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_source_idx" ON public."Order" USING btree (source);


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Payment_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_createdAt_idx" ON public."Payment" USING btree ("createdAt");


--
-- Name: Payment_registerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_registerId_idx" ON public."Payment" USING btree ("registerId");


--
-- Name: Payment_saleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_saleId_idx" ON public."Payment" USING btree ("saleId");


--
-- Name: Payment_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_shopId_idx" ON public."Payment" USING btree ("shopId");


--
-- Name: Permission_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Permission_group_idx" ON public."Permission" USING btree ("group");


--
-- Name: Permission_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Permission_key_key" ON public."Permission" USING btree (key);


--
-- Name: ProductVariant_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductVariant_productId_idx" ON public."ProductVariant" USING btree ("productId");


--
-- Name: ProductVariant_shopId_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_shopId_barcode_key" ON public."ProductVariant" USING btree ("shopId", barcode);


--
-- Name: ProductVariant_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductVariant_shopId_idx" ON public."ProductVariant" USING btree ("shopId");


--
-- Name: ProductVariant_shopId_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_shopId_sku_key" ON public."ProductVariant" USING btree ("shopId", sku);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_name_idx" ON public."Product" USING btree (name);


--
-- Name: Product_shopId_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_shopId_barcode_key" ON public."Product" USING btree ("shopId", barcode);


--
-- Name: Product_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_shopId_idx" ON public."Product" USING btree ("shopId");


--
-- Name: Product_shopId_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_shopId_sku_key" ON public."Product" USING btree ("shopId", sku);


--
-- Name: Product_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_supplierId_idx" ON public."Product" USING btree ("supplierId");


--
-- Name: PurchaseItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseItem_productId_idx" ON public."PurchaseItem" USING btree ("productId");


--
-- Name: PurchaseItem_purchaseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseItem_purchaseId_idx" ON public."PurchaseItem" USING btree ("purchaseId");


--
-- Name: PurchaseItem_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseItem_variantId_idx" ON public."PurchaseItem" USING btree ("variantId");


--
-- Name: Purchase_purchaseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Purchase_purchaseDate_idx" ON public."Purchase" USING btree ("purchaseDate");


--
-- Name: Purchase_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Purchase_shopId_idx" ON public."Purchase" USING btree ("shopId");


--
-- Name: Purchase_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Purchase_supplierId_idx" ON public."Purchase" USING btree ("supplierId");


--
-- Name: Refund_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_createdAt_idx" ON public."Refund" USING btree ("createdAt");


--
-- Name: Refund_refundNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_refundNumber_idx" ON public."Refund" USING btree ("refundNumber");


--
-- Name: Refund_refundNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Refund_refundNumber_key" ON public."Refund" USING btree ("refundNumber");


--
-- Name: Refund_returnId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_returnId_idx" ON public."Refund" USING btree ("returnId");


--
-- Name: Refund_saleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_saleId_idx" ON public."Refund" USING btree ("saleId");


--
-- Name: Refund_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_shopId_idx" ON public."Refund" USING btree ("shopId");


--
-- Name: Register_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Register_shopId_idx" ON public."Register" USING btree ("shopId");


--
-- Name: Register_shopId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Register_shopId_name_key" ON public."Register" USING btree ("shopId", name);


--
-- Name: ReturnItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReturnItem_productId_idx" ON public."ReturnItem" USING btree ("productId");


--
-- Name: ReturnItem_returnId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReturnItem_returnId_idx" ON public."ReturnItem" USING btree ("returnId");


--
-- Name: ReturnItem_saleItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReturnItem_saleItemId_idx" ON public."ReturnItem" USING btree ("saleItemId");


--
-- Name: Return_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Return_createdAt_idx" ON public."Return" USING btree ("createdAt");


--
-- Name: Return_returnNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Return_returnNumber_idx" ON public."Return" USING btree ("returnNumber");


--
-- Name: Return_returnNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Return_returnNumber_key" ON public."Return" USING btree ("returnNumber");


--
-- Name: Return_saleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Return_saleId_idx" ON public."Return" USING btree ("saleId");


--
-- Name: Return_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Return_shopId_idx" ON public."Return" USING btree ("shopId");


--
-- Name: RoleLimit_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RoleLimit_roleId_key" ON public."RoleLimit" USING btree ("roleId");


--
-- Name: RolePermission_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON public."RolePermission" USING btree ("roleId", "permissionId");


--
-- Name: Role_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Role_shopId_idx" ON public."Role" USING btree ("shopId");


--
-- Name: Role_shopId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Role_shopId_name_key" ON public."Role" USING btree ("shopId", name);


--
-- Name: SaleItem_batchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SaleItem_batchId_idx" ON public."SaleItem" USING btree ("batchId");


--
-- Name: SaleItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SaleItem_productId_idx" ON public."SaleItem" USING btree ("productId");


--
-- Name: SaleItem_saleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SaleItem_saleId_idx" ON public."SaleItem" USING btree ("saleId");


--
-- Name: SaleItem_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SaleItem_variantId_idx" ON public."SaleItem" USING btree ("variantId");


--
-- Name: Sale_cashierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_cashierId_idx" ON public."Sale" USING btree ("cashierId");


--
-- Name: Sale_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_createdAt_idx" ON public."Sale" USING btree ("createdAt");


--
-- Name: Sale_receiptNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sale_receiptNumber_key" ON public."Sale" USING btree ("receiptNumber");


--
-- Name: Sale_registerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_registerId_idx" ON public."Sale" USING btree ("registerId");


--
-- Name: Sale_shopId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_shopId_createdAt_idx" ON public."Sale" USING btree ("shopId", "createdAt");


--
-- Name: Sale_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_shopId_idx" ON public."Sale" USING btree ("shopId");


--
-- Name: Sale_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sale_source_idx" ON public."Sale" USING btree (source);


--
-- Name: Shift_cashierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Shift_cashierId_idx" ON public."Shift" USING btree ("cashierId");


--
-- Name: Shift_registerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Shift_registerId_idx" ON public."Shift" USING btree ("registerId");


--
-- Name: Shift_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Shift_shopId_idx" ON public."Shift" USING btree ("shopId");


--
-- Name: Shop_ownerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Shop_ownerId_key" ON public."Shop" USING btree ("ownerId");


--
-- Name: StockMovement_batchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_batchId_idx" ON public."StockMovement" USING btree ("batchId");


--
-- Name: StockMovement_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_createdAt_idx" ON public."StockMovement" USING btree ("createdAt");


--
-- Name: StockMovement_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_productId_createdAt_idx" ON public."StockMovement" USING btree ("productId", "createdAt");


--
-- Name: StockMovement_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_productId_idx" ON public."StockMovement" USING btree ("productId");


--
-- Name: StockMovement_shopId_createdBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_shopId_createdBy_idx" ON public."StockMovement" USING btree ("shopId", "createdBy");


--
-- Name: StockMovement_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_shopId_idx" ON public."StockMovement" USING btree ("shopId");


--
-- Name: StockMovement_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_variantId_idx" ON public."StockMovement" USING btree ("variantId");


--
-- Name: StorefrontAbout_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontAbout_storefrontId_key" ON public."StorefrontAbout" USING btree ("storefrontId");


--
-- Name: StorefrontBranding_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontBranding_storefrontId_key" ON public."StorefrontBranding" USING btree ("storefrontId");


--
-- Name: StorefrontContact_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontContact_storefrontId_key" ON public."StorefrontContact" USING btree ("storefrontId");


--
-- Name: StorefrontFaq_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontFaq_storefrontId_idx" ON public."StorefrontFaq" USING btree ("storefrontId");


--
-- Name: StorefrontFeature_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontFeature_storefrontId_idx" ON public."StorefrontFeature" USING btree ("storefrontId");


--
-- Name: StorefrontFeatured_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontFeatured_storefrontId_idx" ON public."StorefrontFeatured" USING btree ("storefrontId");


--
-- Name: StorefrontFeatured_storefrontId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontFeatured_storefrontId_productId_key" ON public."StorefrontFeatured" USING btree ("storefrontId", "productId");


--
-- Name: StorefrontHero_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontHero_storefrontId_key" ON public."StorefrontHero" USING btree ("storefrontId");


--
-- Name: StorefrontNavItem_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontNavItem_storefrontId_idx" ON public."StorefrontNavItem" USING btree ("storefrontId");


--
-- Name: StorefrontSection_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontSection_storefrontId_idx" ON public."StorefrontSection" USING btree ("storefrontId");


--
-- Name: StorefrontSection_storefrontId_section_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontSection_storefrontId_section_key" ON public."StorefrontSection" USING btree ("storefrontId", section);


--
-- Name: StorefrontSeo_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontSeo_storefrontId_key" ON public."StorefrontSeo" USING btree ("storefrontId");


--
-- Name: StorefrontSocial_storefrontId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StorefrontSocial_storefrontId_key" ON public."StorefrontSocial" USING btree ("storefrontId");


--
-- Name: StorefrontTestimonial_storefrontId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StorefrontTestimonial_storefrontId_idx" ON public."StorefrontTestimonial" USING btree ("storefrontId");


--
-- Name: Storefront_shopId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Storefront_shopId_key" ON public."Storefront" USING btree ("shopId");


--
-- Name: Supplier_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Supplier_shopId_idx" ON public."Supplier" USING btree ("shopId");


--
-- Name: TaxRate_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaxRate_shopId_idx" ON public."TaxRate" USING btree ("shopId");


--
-- Name: TaxRate_shopId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TaxRate_shopId_name_key" ON public."TaxRate" USING btree ("shopId", name);


--
-- Name: UserPermissionOverride_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserPermissionOverride_userId_idx" ON public."UserPermissionOverride" USING btree ("userId");


--
-- Name: UserPermissionOverride_userId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserPermissionOverride_userId_permissionId_key" ON public."UserPermissionOverride" USING btree ("userId", "permissionId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: User_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_shopId_idx" ON public."User" USING btree ("shopId");


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: AuditLog AuditLog_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Batch Batch_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Batch Batch_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Batch Batch_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Batch Batch_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Batch Batch_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CashMovement CashMovement_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CashMovement CashMovement_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CashMovement CashMovement_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Customer Customer_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expense Expense_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invitation Invitation_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invitation Invitation_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_taxRateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES public."TaxRate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseItem PurchaseItem_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public."Batch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseItem PurchaseItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseItem PurchaseItem_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItem PurchaseItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Purchase Purchase_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchase Purchase_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Refund Refund_returnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES public."Return"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Refund Refund_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Refund Refund_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Register Register_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Register"
    ADD CONSTRAINT "Register_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReturnItem ReturnItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnItem"
    ADD CONSTRAINT "ReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReturnItem ReturnItem_returnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnItem"
    ADD CONSTRAINT "ReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES public."Return"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReturnItem ReturnItem_saleItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnItem"
    ADD CONSTRAINT "ReturnItem_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES public."SaleItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReturnItem ReturnItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReturnItem"
    ADD CONSTRAINT "ReturnItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Return Return_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Return"
    ADD CONSTRAINT "Return_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Return Return_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Return"
    ADD CONSTRAINT "Return_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RoleLimit RoleLimit_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RoleLimit"
    ADD CONSTRAINT "RoleLimit_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Role Role_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public."Batch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SaleItem SaleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleItem SaleItem_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shift Shift_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shift Shift_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shift Shift_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shop Shop_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public."Batch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockMovement StockMovement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StorefrontAbout StorefrontAbout_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontAbout"
    ADD CONSTRAINT "StorefrontAbout_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontBranding StorefrontBranding_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontBranding"
    ADD CONSTRAINT "StorefrontBranding_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontContact StorefrontContact_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontContact"
    ADD CONSTRAINT "StorefrontContact_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontFaq StorefrontFaq_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFaq"
    ADD CONSTRAINT "StorefrontFaq_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontFeature StorefrontFeature_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFeature"
    ADD CONSTRAINT "StorefrontFeature_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontFeatured StorefrontFeatured_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFeatured"
    ADD CONSTRAINT "StorefrontFeatured_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontFeatured StorefrontFeatured_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontFeatured"
    ADD CONSTRAINT "StorefrontFeatured_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontHero StorefrontHero_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontHero"
    ADD CONSTRAINT "StorefrontHero_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontNavItem StorefrontNavItem_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontNavItem"
    ADD CONSTRAINT "StorefrontNavItem_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontSection StorefrontSection_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSection"
    ADD CONSTRAINT "StorefrontSection_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontSeo StorefrontSeo_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSeo"
    ADD CONSTRAINT "StorefrontSeo_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontSocial StorefrontSocial_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontSocial"
    ADD CONSTRAINT "StorefrontSocial_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StorefrontTestimonial StorefrontTestimonial_storefrontId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StorefrontTestimonial"
    ADD CONSTRAINT "StorefrontTestimonial_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES public."Storefront"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Storefront Storefront_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Storefront"
    ADD CONSTRAINT "Storefront_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Supplier Supplier_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaxRate TaxRate_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaxRate"
    ADD CONSTRAINT "TaxRate_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPermissionOverride UserPermissionOverride_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissionOverride"
    ADD CONSTRAINT "UserPermissionOverride_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPermissionOverride UserPermissionOverride_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPermissionOverride"
    ADD CONSTRAINT "UserPermissionOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."Register"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dCueDa0mAXfGAf9tVaa7XkoaJDgUaJs5N9MvEK7nrqVK4TtPelchZtMZV61Towt

