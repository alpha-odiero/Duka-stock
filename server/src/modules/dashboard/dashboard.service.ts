import { prisma } from '../../lib/prisma';
import { add, mul, round2 } from '../../utils/money';
import { cached, keyOf } from '../../services/cache/cache.service';
import { redisConfig } from '../../config/env';

export interface DashboardOptions {
  range: '7' | '30' | '90' | 'custom';
  from?: string;
  to?: string;
}

// Builds the dashboard aggregate: main stats, sales-by-day chart, top
// products, low stock, and recent activity feed.
export async function getDashboard(shopId: string, opts: DashboardOptions) {
  // Cache the dashboard aggregate with a short TTL. The dashboard runs several
  // queries per request; caching it reduces load while invalidation (on sales,
  // product changes) keeps it fresh enough for near-real-time decisions.
  const cacheKey = keyOf([
    redisConfig.keyPrefix,
    'dashboard',
    'shop',
    shopId,
    opts.range,
    opts.from || '',
    opts.to || '',
  ]);
  return cached(cacheKey, 30, () => buildDashboard(shopId, opts));
}

async function buildDashboard(shopId: string, opts: DashboardOptions) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // ---- Main stats ----
  const [productCount, lowStockList, todaySales, todayExpenses, todaySalesBySource, todayOrders] = await Promise.all([
    prisma.product.count({ where: { shopId } }),
    prisma.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { quantity: 'asc' },
    }),
    prisma.sale.aggregate({
      where: { shopId, createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { shopId, expenseDate: { gte: startOfToday } },
      _sum: { amount: true },
    }),
    prisma.sale.groupBy({
      by: ['source'],
      where: { shopId, createdAt: { gte: startOfToday } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.count({ where: { shopId, createdAt: { gte: startOfToday } } }),
  ]);

  const todayRevenue = todaySales._sum.totalAmount ?? round2(0);
  const todayExpense = todayExpenses._sum.amount ?? round2(0);
  const posRow = todaySalesBySource.find((r) => r.source === 'POS');
  const onlineRow = todaySalesBySource.find((r) => r.source === 'ONLINE');
  const todayPosRevenue = posRow?._sum.totalAmount ?? round2(0);
  const todayOnlineRevenue = onlineRow?._sum.totalAmount ?? round2(0);
  const todayPosCount = posRow?._count ?? 0;
  const todayOnlineCount = onlineRow?._count ?? 0;

  // Today's cost of goods from sale items
  const todayItems = await prisma.saleItem.findMany({
    where: { sale: { shopId, createdAt: { gte: startOfToday } } },
  });
  let todayCogs = round2(0);
  for (const it of todayItems) todayCogs = add(todayCogs, mul(it.buyingPrice, it.quantity));
  const todayProfit = todayRevenue.sub(todayCogs).toDecimalPlaces(2);

  // Inventory value
  const allProducts = await prisma.product.findMany({
    where: { shopId },
    select: { buyingPrice: true, quantity: true },
  });
  let inventoryValue = round2(0);
  for (const p of allProducts) inventoryValue = add(inventoryValue, mul(p.buyingPrice, p.quantity));
  inventoryValue = inventoryValue.toDecimalPlaces(2);

  const lowStock = lowStockList.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold);
  const outOfStock = lowStockList.filter((p) => p.quantity === 0);
  const lowStockCount = lowStock.length + outOfStock.length;

  // ---- Sales chart ----
  let days = opts.range === '90' ? 90 : opts.range === '30' ? 30 : opts.range === '7' ? 7 : 0;
  let chartFrom = new Date(startOfToday);
  chartFrom.setDate(chartFrom.getDate() - (days === 0 ? 7 : days) + 1);
  if (opts.range === 'custom' && opts.from) {
    chartFrom = new Date(opts.from);
    chartFrom.setHours(0, 0, 0, 0);
  }
  let chartTo = new Date();
  if (opts.range === 'custom' && opts.to) {
    chartTo = new Date(opts.to);
    chartTo.setHours(23, 59, 59, 999);
  }
  if (days === 0) days = Math.max(1, Math.round((chartTo.getTime() - chartFrom.getTime()) / (1000 * 86400)) + 1);

  const chartSales = await prisma.sale.findMany({
    where: { shopId, createdAt: { gte: chartFrom, lte: chartTo } },
    select: { totalAmount: true, createdAt: true, source: true },
  });

  const byDay = new Map<string, number>();
  const byDayPos = new Map<string, number>();
  const byDayOnline = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(chartFrom);
    d.setDate(chartFrom.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, 0);
    byDayPos.set(key, 0);
    byDayOnline.set(key, 0);
  }
  for (const s of chartSales) {
    const key = s.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + round2(s.totalAmount).toNumber());
    if (s.source === 'POS') byDayPos.set(key, (byDayPos.get(key) ?? 0) + round2(s.totalAmount).toNumber());
    else if (s.source === 'ONLINE') byDayOnline.set(key, (byDayOnline.get(key) ?? 0) + round2(s.totalAmount).toNumber());
  }
  const toSeries = (m: Map<string, number>) =>
    [...m.entries()].map(([date, value]) => ({ date, revenue: round2(value).toNumber() }));
  const salesChart = toSeries(byDay);
  const posChart = toSeries(byDayPos);
  const onlineChart = toSeries(byDayOnline);

  // ---- Top products (by units sold, all time) ----
  const topRaw = await prisma.saleItem.groupBy({
    by: ['productId'],
    where: { sale: { shopId } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });
  const topIds = topRaw.map((t) => t.productId);
  const productMap = new Map<string, { name: string; imageUrl: string | null }>();
  if (topIds.length) {
    const prods = await prisma.product.findMany({
      where: { id: { in: topIds }, shopId },
      select: { id: true, name: true, imageUrl: true },
    });
    prods.forEach((p) => productMap.set(p.id, { name: p.name, imageUrl: p.imageUrl }));
  }
  const topProducts = topRaw.map((t) => ({
    id: t.productId,
    name: productMap.get(t.productId)?.name ?? 'Unknown',
    imageUrl: productMap.get(t.productId)?.imageUrl ?? null,
    unitsSold: t._sum.quantity ?? 0,
    revenue: round2(t._sum.subtotal ?? 0).toNumber(),
  }));

  // ---- Recent activity ----
  const [recentSales, recentMovements, recentExpenses, recentProducts] = await Promise.all([
    prisma.sale.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
    prisma.stockMovement.findMany({
      where: { product: { shopId } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { product: { select: { name: true } } },
    }),
    prisma.expense.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.product.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);

  const activity: {
    id: string;
    type: string;
    text: string;
    createdAt: string;
  }[] = [];

  for (const s of recentSales) {
    const totalQty = s.items.reduce((a, it) => a + it.quantity, 0);
    const first = s.items[0]?.product.name ?? 'items';
    activity.push({
      id: `sale-${s.id}`,
      type: 'sale',
      text: `Sold ${totalQty} × ${first}${s.items.length > 1 ? ` +${s.items.length - 1} more` : ''}`,
      createdAt: s.createdAt.toISOString(),
    });
  }
  for (const m of recentMovements) {
    const plus = m.quantity > 0;
    activity.push({
      id: `stock-${m.id}`,
      type: plus ? 'stock_in' : 'stock_out',
      text: plus
        ? `Added ${m.quantity} × ${m.product.name}`
        : `Removed ${Math.abs(m.quantity)} × ${m.product.name}`,
      createdAt: m.createdAt.toISOString(),
    });
  }
  for (const e of recentExpenses) {
    activity.push({
      id: `exp-${e.id}`,
      type: 'expense',
      text: `Recorded KES ${round2(e.amount).toNumber().toLocaleString()} ${e.description}`,
      createdAt: e.createdAt.toISOString(),
    });
  }
  for (const p of recentProducts) {
    activity.push({
      id: `prod-${p.id}`,
      type: 'product',
      text: `Added new product ${p.name}`,
      createdAt: p.createdAt.toISOString(),
    });
  }
  activity.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return {
    stats: {
      totalProducts: productCount,
      lowStockCount,
      todayRevenue: todayRevenue.toNumber(),
      todaySalesCount: todaySales._count,
      todayPosRevenue: todayPosRevenue.toNumber(),
      todayOnlineRevenue: todayOnlineRevenue.toNumber(),
      todayPosCount,
      todayOnlineCount,
      todayOrders: todayOrders,
      todayProfit: todayProfit.toNumber(),
      todayExpenses: todayExpense.toNumber(),
      inventoryValue: inventoryValue.toNumber(),
    },
    lowStock: lowStock.slice(0, 10),
    outOfStock: outOfStock.slice(0, 10),
    salesChart,
    posChart,
    onlineChart,
    topProducts,
    activity: activity.slice(0, 12),
  };
}
