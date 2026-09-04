import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { createOrder, type CreateOrderOptions } from '../orders/order.service';
import { getPublicStorefrontConfig as buildStorefrontConfig } from '../storefront/storefront.service';
import { publicOffer } from '../offers/offer.service';
import { cached, keyOf } from '../../services/cache/cache.service';
import { redisConfig } from '../../config/env';

// Cache helper for public storefront reads. Public pages are read-heavy and a
// great caching candidate; the DB remains the source of truth and CMS/product
// writes invalidate the keys. When Redis is down these degrade to DB reads.
const PUBLIC_TTL = 300; // 5 minutes

const publicShopSelect = {
  id: true,
  name: true,
  description: true,
  phone: true,
  email: true,
  location: true,
  logo: true,
  currency: true,
} satisfies Prisma.ShopSelect;

// Resolves the shop exposed by the public storefront (multi-tenant).
//
// 1. Explicit selection: `?shop=Name` matches the named shop (case-insensitive)
//    and isolates that tenant's data. This is the canonical storefront URL form.
// 2. Default (no `?shop=`): resolve the storefront the owner is actively
//    managing — the shop whose top-level storefront record was touched most
//    recently. Every CMS write (hero, about, contact, faqs, testimonials,
//    branding, ...) and every publish bumps `Storefront.updatedAt`, so editing
//    content in the dashboard immediately makes THAT shop the one served at
//    `/` and `/shop`, which is exactly what the "Preview" flow expects.
// 3. Fallback: the most recently created shop (fresh signups preview at once).
//
// Never falls back to "the first shop ever created" — that returned a stale,
// unrelated tenant and silently swallowed the dashboard's saved content.
export async function resolvePublicShop(shopName?: string) {
  if (shopName && shopName.trim()) {
    const shop = await prisma.shop.findFirst({
      where: { name: { equals: shopName.trim(), mode: 'insensitive' } },
      select: publicShopSelect,
    });
    if (!shop) throw new NotFoundError('Shop not found');
    return shop;
  }

  const active = await prisma.shop.findFirst({
    where: { storefront: { isNot: null } },
    select: publicShopSelect,
    orderBy: { storefront: { updatedAt: 'desc' } },
  });
  if (active) return active;

  const latest = await prisma.shop.findFirst({
    select: publicShopSelect,
    orderBy: { createdAt: 'desc' },
  });
  if (!latest) throw new NotFoundError('Shop not found');
  return latest;
}

export async function getPublicShopInfo(shopName?: string) {
  const shop = await resolvePublicShop(shopName);
  return shop;
}

// Composes the full public storefront config (marketing + catalog) used by the
// customer website. Only safe, intentionally-public data is returned.
export async function getPublicStorefrontConfig(shopName?: string) {
  const shop = await resolvePublicShop(shopName);
  const cacheKey = keyOf([redisConfig.keyPrefix, 'storefront', 'shop', shop.id, 'config', shopName?.trim().toLowerCase() || 'default']);
  const config = await cached(
    cacheKey,
    PUBLIC_TTL,
    () => buildStorefrontConfig(shop.id),
  );
  return { ...config, shop };
}

// Safe projection for the public storefront — never exposes buying price,
// profit, supplier, thresholds, or audit data.
const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  sellingPrice: true,
  quantity: true,
  lowStockThreshold: true,
  unit: true,
  imageUrl: true,
  category: { select: { id: true, name: true } },
  isActive: true,
} satisfies Prisma.ProductSelect;

function publicProduct(row: {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sellingPrice: Prisma.Decimal | string | number;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
}) {
  const qty = row.quantity;
  const status = qty === 0 ? 'out' : qty <= row.lowStockThreshold ? 'low' : 'in_stock';
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.sellingPrice,
    unit: row.unit,
    imageUrl: row.imageUrl,
    stockStatus: status,
    inStock: qty > 0,
    quantity: qty,
  };
}

export async function listPublicProducts(opts: {
  shopName?: string;
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}) {
  const shop = await resolvePublicShop(opts.shopName);
  const cacheKey = keyOf([
    redisConfig.keyPrefix,
    'storefront',
    'shop',
    shop.id,
    'products',
    opts.shopName?.trim().toLowerCase() || 'default',
    opts.category?.trim().toLowerCase() || '',
    opts.search?.trim().toLowerCase() || '',
    opts.featured ? 'featured' : '',
    opts.limit ?? '',
  ]);
  return cached(cacheKey, PUBLIC_TTL, async () => {
    const where: Prisma.ProductWhereInput = { shopId: shop.id, isActive: true };

    if (opts.category) {
      where.category = { name: { equals: opts.category, mode: 'insensitive' } };
    }
    if (opts.search && opts.search.trim()) {
      where.OR = [
        { name: { contains: opts.search.trim(), mode: 'insensitive' } },
        { description: { contains: opts.search.trim(), mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: publicProductSelect,
      orderBy: { createdAt: 'desc' },
      take: opts.limit && opts.limit > 0 ? opts.limit : 100,
    });

    return products.map((p) => publicProduct(p));
  });
}

export async function getPublicProduct(slug: string, shopName?: string) {
  const shop = await resolvePublicShop(shopName);
  const cacheKey = keyOf([redisConfig.keyPrefix, 'storefront', 'shop', shop.id, 'product', slug]);
  const product = await cached(cacheKey, PUBLIC_TTL, async () => {
    const p = await prisma.product.findFirst({
      where: { shopId: shop.id, slug, isActive: true },
      select: publicProductSelect,
    });
    if (!p) throw new NotFoundError('Product not found');
    return publicProduct(p);
  });
  return { shop, product };
}

export async function listPublicCategories(shopName?: string) {
  const shop = await resolvePublicShop(shopName);
  const categories = await prisma.category.findMany({
    where: { shopId: shop.id, visible: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      displayOrder: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
  return categories;
}

// Curated homepage product selection (~80 products) distributed intelligently
// across categories so no single category dominates the homepage. Only ACTIVE
// (and, by default, in-stock) products are considered. If a category has few
// products we use what exists; if it has many we cap it.
export async function listCuratedProducts(shopName?: string, target = 80) {
  const shop = await resolvePublicShop(shopName);
  const cacheKey = keyOf([redisConfig.keyPrefix, 'storefront', 'shop', shop.id, 'curated', String(target)]);
  return cached(cacheKey, PUBLIC_TTL, async () => {
    const categories = await prisma.category.findMany({
      where: { shopId: shop.id, visible: true },
      select: { id: true, _count: { select: { products: { where: { isActive: true, quantity: { gt: 0 } } } } } },
      orderBy: { displayOrder: 'asc' },
    });
    const activeCats = categories.filter((c) => c._count.products > 0);

    const results: any[] = [];
    if (activeCats.length === 0) return [];

    // Rough per-category budget, respecting small categories.
    const perCategory = Math.max(1, Math.floor(target / activeCats.length));

    for (const cat of activeCats) {
      const take = Math.min(perCategory, cat._count.products);
      const rows = await prisma.product.findMany({
        where: { shopId: shop.id, isActive: true, quantity: { gt: 0 }, categoryId: cat.id },
        select: publicProductSelect,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        take,
      });
      results.push(...rows);
      if (results.length >= target) break;
    }

    // Fill any remaining budget from generally-available active in-stock products
    if (results.length < target) {
      const have = new Set(results.map((r) => r.id));
      const fill = await prisma.product.findMany({
        where: { shopId: shop.id, isActive: true, quantity: { gt: 0 }, id: { notIn: Array.from(have) } },
        select: publicProductSelect,
        orderBy: { updatedAt: 'desc' },
        take: target - results.length,
      });
      results.push(...fill);
    }

    return results.map((p) => publicProduct(p));
  });
}

// Active, visible offers for the storefront. Expired offers are pruned
// automatically via effective status so the storefront always reflects reality.
export async function listPublicOffers(shopName?: string) {
  const shop = await resolvePublicShop(shopName);
  const cacheKey = keyOf([redisConfig.keyPrefix, 'storefront', 'shop', shop.id, 'offers']);
  return cached(cacheKey, PUBLIC_TTL, async () => {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        shopId: shop.id,
        visible: true,
        status: { in: ['ACTIVE', 'SCHEDULED'] },
        // Show published offers that are live now OR scheduled to start soon;
        // only exclude ones whose run has already ended.
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return offers.map((o) => publicOffer(o));
  });
}

export async function createPublicOrder(
  shopName: string | undefined,
  opts: CreateOrderOptions & {
    // The storefront always originates online orders.
    source?: 'ONLINE';
  },
) {
  const shop = await resolvePublicShop(shopName);
  return createOrder(shop.id, { ...opts, source: 'ONLINE' });
}
