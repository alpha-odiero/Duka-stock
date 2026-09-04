import { cache, keyOf } from './cache.service';
import { redisConfig } from '../../config/env';

// Centralized cache invalidation. Every business write that invalidates cached
// data flows through here so `redis.del(...)` calls are never scattered across
// dozens of controllers. Each shop's caches are namespaced by shopId, so
// invalidating shop A never touches shop B's cached data.

const PREFIX = redisConfig.keyPrefix;

function shopNamespace(namespace: string, shopId: string): string {
  return `${PREFIX}:${namespace}:shop:${shopId}`;
}

// Invalidate product caches for a shop: the list/search index and any single
// product reads. Used on product create/update/delete and stock changes.
export async function invalidateProducts(shopId: string, productId?: string): Promise<void> {
  const keys = [
    `${shopNamespace('products', shopId)}:list*`, // searchable list index
    `${shopNamespace('products', shopId)}:detail*`,
  ];
  if (productId) keys.push(keyOf([PREFIX, 'products', 'shop', shopId, 'detail', productId]));
  await Promise.all(keys.map((k) => cache.invalidateByPattern(k)));
}

// Invalidate the dashboard aggregate for a shop.
export async function invalidateDashboard(shopId: string): Promise<void> {
  await cache.invalidateByPattern(`${shopNamespace('dashboard', shopId)}:*`);
}

// Invalidate report caches for a shop.
export async function invalidateReports(shopId: string): Promise<void> {
  await cache.invalidateByPattern(`${shopNamespace('reports', shopId)}:*`);
}

// Invalidate the public storefront config cache for a shop (CMS edits + product
// changes + stock changes affect what customers see).
export async function invalidateStorefront(shopId: string): Promise<void> {
  await cache.invalidateByPattern(`${shopNamespace('storefront', shopId)}:*`);
}

// Broad invalidation for anything that changes after a sale or stock movement
// (dashboard + products + storefront + reports all reflect new stock/revenue).
export async function invalidateAfterProductChange(shopId: string, productId?: string): Promise<void> {
  await Promise.all([
    invalidateProducts(shopId, productId),
    invalidateDashboard(shopId),
    invalidateReports(shopId),
    invalidateStorefront(shopId),
  ]);
}

export async function invalidateAfterSale(shopId: string, productIds?: string[]): Promise<void> {
  await Promise.all([
    invalidateDashboard(shopId),
    invalidateReports(shopId),
    invalidateStorefront(shopId),
    ...(productIds ?? []).map((id) => invalidateProducts(shopId, id)),
  ]);
}
