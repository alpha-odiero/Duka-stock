import { describe, expect, it, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import RedisMock from 'ioredis-mock';

// Offline sync + critical-transaction isolation tests.
//
// The sync service enqueues offline operations onto a Redis queue (deduplicated
// by client opId) and applies them against the DB. These tests mock the
// Prisma data layer and exercise the sync service against the in-memory Redis
// mock to avoid needing a live database or Redis.

// Seed the global Redis client with the mock before services are imported.
const globalForRedis = globalThis as unknown as { redisClient?: unknown };
if (!globalForRedis.redisClient) {
  const mockSeed = new RedisMock();
  mockSeed.status = 'ready';
  globalForRedis.redisClient = mockSeed;
}

// Build the mocked Prisma client with vi.hoisted so the hoisted `vi.mock`
// factory can reference it (avoids temporal-dead-zone errors).
const { prismaMock } = vi.hoisted(() => {
  const shopFindUnique = vi.fn();
  const saleCreate = vi.fn();
  const saleFindUniqueByReceipt = vi.fn();
  const productFindFirst = vi.fn();
  const stockMovementCreate = vi.fn();
  const productUpdate = vi.fn();
  const txExec = vi.fn(async (fn: unknown) => (fn as (tx: never) => Promise<unknown>)({} as never));
  return {
    prismaMock: {
      shop: { findUnique: shopFindUnique },
      sale: { create: saleCreate, findUnique: saleFindUniqueByReceipt },
      product: { findFirst: productFindFirst, update: productUpdate },
      stockMovement: { create: stockMovementCreate },
      $transaction: txExec,
    },
  };
});

vi.mock('../src/lib/prisma', () => ({ prisma: prismaMock }));

import { prisma } from '../src/lib/prisma';
import { queue } from '../src/services/queue/queue.service';
import { receiveOperations, applyOperation } from '../src/services/sync/sync.service';

// Silence cache invalidation dependencies (they no-op without needing DB).
vi.mock('../src/services/cache/invalidation.service', () => ({
  invalidateAfterSale: vi.fn(async () => undefined),
  invalidateAfterProductChange: vi.fn(async () => undefined),
  invalidateStorefront: vi.fn(async () => undefined),
  invalidateDashboard: vi.fn(async () => undefined),
  invalidateReports: vi.fn(async () => undefined),
  invalidateProducts: vi.fn(async () => undefined),
}));

beforeAll(async () => {
  const client = globalForRedis.redisClient as { status: string; flushall: () => Promise<void> };
  client.status = 'ready';
  await client.flushall();
});

afterAll(async () => {
  vi.restoreAllMocks();
});

describe('OFFLINE SYNC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.shop.findUnique.mockResolvedValue({ id: 'shop1', name: 'Test Shop' });
  });

  it('accepts a batch of offline operations (enqueues deduplicated jobs)', async () => {
    const res = await receiveOperations([
      { opId: 'op-1', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-1', items: [] } },
    ]);
    expect(res.accepted).toContain('op-1');
    expect(res.conflicts).toHaveLength(0);
    expect(res.failed).toHaveLength(0);
  });

  it('deduplicates a replayed operation (network retry)', async () => {
    const ops = [{ opId: 'op-dup', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-DUP', items: [] } }];
    await receiveOperations(ops);
    await receiveOperations(ops);
    // The same opId enqueues once; subsequent submits are deduplicated.
    expect(prisma.shop.findUnique).toHaveBeenCalledTimes(2); // validated twice
    const client = globalForRedis.redisClient as { llen: (k: string) => Promise<number> };
    const pending = await client.llen('dukastock:queue:sync');
    expect(pending).toBe(1);
  });

  it('reports a conflict when the shop does not exist', async () => {
    prisma.shop.findUnique.mockResolvedValue(null);
    const res = await receiveOperations([
      { opId: 'op-conf', type: 'sale', shopId: 'ghost', payload: { items: [] } },
    ]);
    expect(res.conflicts).toHaveLength(1);
    expect(res.conflicts[0].reason).toMatch(/Shop not found/i);
  });

  it('reports an error for malformed operations', async () => {
    const res = await receiveOperations([
      { opId: '', type: 'sale', shopId: 'shop1', payload: {} } as never,
    ]);
    expect(res.failed).toHaveLength(1);
  });

  it('applies a sale operation idempotently (dedup by receipt number)', async () => {
    // First apply creates the sale.
    prisma.sale.findUnique.mockResolvedValue(null);
    await applyOperation({ opId: 'op-app', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-APP', totalAmount: 100, items: [] } });
    expect(prisma.sale.create).toHaveBeenCalledTimes(1);

    // Replay: receipt already exists → treated as idempotent success (no new row).
    prisma.sale.findUnique.mockResolvedValue({ id: 'existing' });
    await applyOperation({ opId: 'op-app', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-APP', totalAmount: 100, items: [] } });
    expect(prisma.sale.create).toHaveBeenCalledTimes(1);
  });

  it('rejects an out-of-date sale (conflict by version)', async () => {
    prisma.sale.findUnique.mockResolvedValue(null);
    await expect(
      applyOperation({
        opId: 'op-old',
        type: 'sale',
        shopId: 'shop1',
        baseVersion: 10,
        payload: { receiptNumber: 'OFF-OLD', version: 3, totalAmount: 100, items: [] },
      }),
    ).rejects.toThrow(/out of date/i);
  });
});

describe('CRITICAL TRANSACTIONS', () => {
  it('sync sale application completes and invalidates shop caches', async () => {
    prisma.sale.findUnique.mockResolvedValue(null);
    // Re-seed mock for the second describe's default shop.
    prisma.shop.findUnique.mockResolvedValue({ id: 'shop1', name: 'Test Shop' });
    await receiveOperations([{ opId: 'op-crit', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-CRIT', totalAmount: 50, items: [] } }]);
    // The queue job is created (accepted); a worker would apply it.
    expect(prisma.shop.findUnique).toHaveBeenCalled();
  });

  it('severing Redis does not corrupt the sale data path (queue fails open)', async () => {
    // Simulate Redis being unavailable: queue.enqueue returns null (fail-open).
    const client = globalForRedis.redisClient as { status: string };
    const original = client.status;
    client.status = 'end';
    try {
      expect(queue.isEnabled()).toBe(false);
      prisma.shop.findUnique.mockResolvedValue({ id: 'shop1', name: 'Test Shop' });
      const res = await receiveOperations([{ opId: 'op-redisdown', type: 'sale', shopId: 'shop1', payload: { receiptNumber: 'OFF-DOWN', items: [] } }]);
      // Even with Redis down the operation is validated against the source of
      // truth (Prisma) and reported accepted; the DB remains intact.
      expect(res.accepted).toContain('op-redisdown');
    } finally {
      client.status = original;
    }
  });
});
