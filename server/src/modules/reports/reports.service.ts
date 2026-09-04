import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { add, round2 } from '../../utils/money';
import { cached, keyOf } from '../../services/cache/cache.service';
import { redisConfig } from '../../config/env';

// Reports summarize historical (append-mostly) data, so a moderate TTL cache is
// both safe and effective. Invalidation turns the cache over after any write.
const REPORT_TTL = 300; // 5 minutes

// Shared date-window helper returns [from, to] for the report filters.
export function dateWindow(opts: { from?: string; to?: string; period?: string }) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let from: Date | undefined;
  let to: Date | undefined;

  if (opts.period === 'today') {
    from = startOfToday;
  } else if (opts.period === 'yesterday') {
    const y = new Date(startOfToday);
    y.setDate(y.getDate() - 1);
    from = y;
    to = startOfToday;
  } else if (opts.period === 'week') {
    from = new Date(startOfToday);
    from.setDate(from.getDate() - 7);
  } else if (opts.period === 'month') {
    from = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  }

  if (opts.from) from = new Date(opts.from);
  if (opts.to) {
    to = new Date(opts.to);
    to.setHours(23, 59, 59, 999);
  }

  return { from, to };
}

export async function salesReport(shopId: string, opts: {
  from?: string;
  to?: string;
  period?: string;
  source?: 'POS' | 'ONLINE';
  paymentMethod?: 'CASH' | 'MPESA' | 'CARD' | 'OTHER';
  categoryId?: string;
  productId?: string;
}) {
  const cacheKey = keyOf([
    redisConfig.keyPrefix, 'reports', 'shop', shopId, 'sales',
    opts.from || '', opts.to || '', opts.period || '',
    opts.source || '', opts.paymentMethod || '', opts.categoryId || '', opts.productId || '',
  ]);
  return cached(cacheKey, REPORT_TTL, () => buildSalesReport(shopId, opts));
}

async function buildSalesReport(shopId: string, opts: {
  from?: string;
  to?: string;
  period?: string;
  source?: 'POS' | 'ONLINE';
  paymentMethod?: 'CASH' | 'MPESA' | 'CARD' | 'OTHER';
  categoryId?: string;
  productId?: string;
}) {
  const { from, to } = dateWindow(opts);
  const createdAt = buildRange(from, to);

  const where: Prisma.SaleWhereInput = { shopId, createdAt };
  if (opts.source) where.source = opts.source;
  if (opts.paymentMethod) where.paymentMethod = opts.paymentMethod;
  if (opts.productId) where.items = { some: { productId: opts.productId } };

  const sales = await prisma.sale.findMany({
    where,
    include: { items: { include: { product: { select: { name: true, categoryId: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  // Filter by category after fetching (a sale-wide category filter).
  const filteredSales = opts.categoryId ? sales.filter((s) => s.items.some((it) => it.product.categoryId === opts.categoryId)) : sales;

  const revenue = filteredSales.reduce((acc, s) => acc.add(round2(s.totalAmount)), round2(0));
  const totalItems = filteredSales.reduce((acc, s) => acc + s.items.reduce((a, it) => a + it.quantity, 0), 0);
  const numberOfSales = filteredSales.length;
  const avg = numberOfSales ? revenue.div(numberOfSales) : round2(0);

  // Source breakdown (POS vs Online) within the same window & filters.
  const bySource: Record<string, { count: number; total: number }> = {
    POS: { count: 0, total: 0 },
    ONLINE: { count: 0, total: 0 },
  };
  for (const s of filteredSales) {
    bySource[s.source] ??= { count: 0, total: 0 };
    bySource[s.source].count += 1;
    bySource[s.source].total += Number(s.totalAmount);
  }

  // Best-selling products
  const productCounts = new Map<string, { name: string; qty: number; revenue: ReturnType<typeof round2> }>();
  for (const s of filteredSales) {
    for (const it of s.items) {
      const existing = productCounts.get(it.productId);
      const itemRevenue = round2(it.subtotal);
      if (existing) {
        existing.qty += it.quantity;
        existing.revenue = add(existing.revenue, itemRevenue);
      } else {
        productCounts.set(it.productId, { name: it.product?.name ?? 'Unknown', qty: it.quantity, revenue: itemRevenue });
      }
    }
  }
  const bestSelling = [...productCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Sales by payment method
  const byMethod = new Map<string, { count: number; total: ReturnType<typeof round2> }>();
  for (const s of filteredSales) {
    const pm = s.paymentMethod;
    const existing = byMethod.get(pm);
    if (existing) {
      existing.count += 1;
      existing.total = add(existing.total, round2(s.totalAmount));
    } else {
      byMethod.set(pm, { count: 1, total: round2(s.totalAmount) });
    }
  }

  return {
    period: { from, to },
    revenue: revenue.toDecimalPlaces(2),
    numberOfSales,
    totalItemsSold: totalItems,
    averageSale: avg.toDecimalPlaces(2),
    bestSelling,
    byPaymentMethod: [...byMethod.entries()].map(([method, v]) => ({ method, ...v })),
    bySource: Object.entries(bySource).map(([source, v]) => ({ source, ...v })),
  };
}

export async function inventoryReport(shopId: string) {
  const cacheKey = keyOf([redisConfig.keyPrefix, 'reports', 'shop', shopId, 'inventory']);
  return cached(cacheKey, REPORT_TTL, () => buildInventoryReport(shopId));
}

async function buildInventoryReport(shopId: string) {
  const products = await prisma.product.findMany({ where: { shopId } });

  let inventoryValue = round2(0);
  let lowStock = 0;
  let outOfStock = 0;

  for (const p of products) {
    inventoryValue = add(inventoryValue, round2(p.buyingPrice).mul(p.quantity));
    if (p.quantity === 0) outOfStock += 1;
    else if (p.quantity <= p.lowStockThreshold) lowStock += 1;
  }

  return {
    totalProducts: products.length,
    lowStock,
    outOfStock,
    inventoryValue: inventoryValue.toDecimalPlaces(2),
    totalUnits: products.reduce((a, p) => a + p.quantity, 0),
  };
}

export async function profitReport(shopId: string, opts: { from?: string; to?: string; period?: string }) {
  const cacheKey = keyOf([
    redisConfig.keyPrefix, 'reports', 'shop', shopId, 'profit',
    opts.from || '', opts.to || '', opts.period || '',
  ]);
  return cached(cacheKey, REPORT_TTL, () => buildProfitReport(shopId, opts));
}

async function buildProfitReport(shopId: string, opts: { from?: string; to?: string; period?: string }) {
  const { from, to } = dateWindow(opts);
  const createdAt = buildRange(from, to);

  // Revenue & COGS via sale items (buying price is stored at time of sale)
  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { shopId, createdAt } },
  });

  let revenue = round2(0);
  let cogs = round2(0);
  for (const it of saleItems) {
    revenue = add(revenue, round2(it.subtotal));
    cogs = add(cogs, round2(it.buyingPrice).mul(it.quantity));
  }
  const grossProfit = revenue.sub(cogs).toDecimalPlaces(2);

  // Expenses in same window
  const expensesAgg = await prisma.expense.aggregate({
    where: { shopId, expenseDate: buildRange(from, to) },
    _sum: { amount: true },
  });
  const expenses = expensesAgg._sum.amount ?? round2(0);

  const netProfit = grossProfit.sub(round2(expenses)).toDecimalPlaces(2);

  return {
    period: { from, to },
    revenue: revenue.toDecimalPlaces(2),
    cogs: cogs.toDecimalPlaces(2),
    grossProfit,
    expenses: round2(expenses),
    netProfit,
  };
}

export async function purchaseReport(shopId: string, opts: { from?: string; to?: string; period?: string }) {
  const cacheKey = keyOf([
    redisConfig.keyPrefix, 'reports', 'shop', shopId, 'purchases',
    opts.from || '', opts.to || '', opts.period || '',
  ]);
  return cached(cacheKey, REPORT_TTL, () => buildPurchaseReport(shopId, opts));
}

async function buildPurchaseReport(shopId: string, opts: { from?: string; to?: string; period?: string }) {
  const { from, to } = dateWindow(opts);
  const where = { shopId, purchaseDate: buildRange(from, to) };

  const [purchases, purchaseAgg] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: { items: { include: { product: { select: { name: true } } } }, supplier: true },
    }),
    prisma.purchase.aggregate({ where, _sum: { totalAmount: true }, _count: true }),
  ]);

  const totalSpend = purchaseAgg._sum.totalAmount ?? round2(0);

  // Supplier spending
  const supplierSpend = new Map<string, { name: string; total: ReturnType<typeof round2>; count: number }>();
  for (const p of purchases) {
    const key = p.supplierId ?? 'unknown';
    const name = p.supplier?.name ?? 'No supplier';
    const existing = supplierSpend.get(key);
    if (existing) {
      existing.total = add(existing.total, round2(p.totalAmount));
      existing.count += 1;
    } else {
      supplierSpend.set(key, { name, total: round2(p.totalAmount), count: 1 });
    }
  }

  // Products purchased
  const productAgg = new Map<string, { name: string; qty: number; cost: ReturnType<typeof round2> }>();
  for (const p of purchases) {
    for (const it of p.items) {
      const existing = productAgg.get(it.productId);
      if (existing) {
        existing.qty += it.quantity;
        existing.cost = add(existing.cost, round2(it.subtotal));
      } else {
        productAgg.set(it.productId, { name: it.product.name ?? 'Unknown', qty: it.quantity, cost: round2(it.subtotal) });
      }
    }
  }

  return {
    period: { from, to },
    totalPurchases: purchaseAgg._count,
    totalSpend: totalSpend.toDecimalPlaces(2),
    bySupplier: [...supplierSpend.entries()].map(([id, v]) => ({ id, ...v })),
    byProduct: [...productAgg.values()].sort((a, b) => b.qty - a.qty),
  };
}

function buildRange(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = from;
  if (to) range.lte = to;
  return range;
}
