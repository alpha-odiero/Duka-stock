import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// These tests run against an in-memory ioredis client (see tests/redis.setup.ts).
// They cover cache, rate limiting, locking, queues, deduplication and
// multi-tenant key isolation without requiring a live Redis server.

import { cache, cached } from '../src/services/cache/cache.service';
import { consumeRateLimit, resetRateLimit } from '../src/services/rateLimit/rateLimit.service';
import { lock } from '../src/services/lock/lock.service';
import { queue } from '../src/services/queue/queue.service';
import { keyOf, shopKey } from '../src/services/cache/cache.service';
import { redis } from '../src/infrastructure/redis/redis.client';

// The setup file provides the mock client. Ensure it reports ready so the
// services treat cache/locks as enabled.
const client = redis as unknown as { status: string; flushall: () => Promise<void>; set: (...a: unknown[]) => Promise<unknown>; get: (...a: unknown[]) => Promise<unknown | null>; del: (...a: unknown[]) => Promise<number> };

beforeEach(async () => {
  client.status = 'ready';
  await client.flushall();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CACHE', () => {
  it('returns null on cache miss', async () => {
    const value = await cache.get<{ a: number }>('dukastock:products:shop:s1:list:1');
    expect(value).toBeNull();
  });

  it('returns cached value on cache hit', async () => {
    await cache.set('dukastock:products:shop:s1:list:1', { products: [], total: 0 }, 60);
    const value = await cache.get<{ products: unknown[]; total: number }>('dukastock:products:shop:s1:list:1');
    expect(value).toEqual({ products: [], total: 0 });
  });

  it('expires keys after their TTL', async () => {
    await client.set('dukastock:tmp:expires', JSON.stringify({ ok: true }), 'EX', 1);
    await new Promise((r) => setTimeout(r, 1100));
    const value = await client.get('dukastock:tmp:expires');
    expect(value).toBeNull();
  });

  it('invalidates keys by pattern', async () => {
    await cache.set('dukastock:products:shop:s1:list:1', 'a', 60);
    await cache.set('dukastock:products:shop:s1:list:2', 'b', 60);
    await cache.invalidateByPattern('dukastock:products:shop:s1:list:*');
    expect(await client.get('dukastock:products:shop:s1:list:1')).toBeNull();
    expect(await client.get('dukastock:products:shop:s1:list:2')).toBeNull();
  });

  it('cached() returns loaded value and stores it', async () => {
    const loader = vi.fn(async () => ({ count: 42 }));
    const first = await cached('dukastock:tmp:getorcompute', 60, loader);
    expect(first).toEqual({ count: 42 });
    expect(loader).toHaveBeenCalledTimes(1);
    // Second call hits cache, loader not invoked again.
    const second = await cached('dukastock:tmp:getorcompute', 60, loader);
    expect(second).toEqual({ count: 42 });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('is multi-tenant isolated: shop A keys cannot be read as shop B', async () => {
    await cache.set(shopKey('products', 'shopA', 'list', '1'), { data: 'A-data' }, 60);
    const fromB = await cache.get<{ data: string }>(shopKey('products', 'shopB', 'list', '1'));
    expect(fromB).toBeNull();
    const fromA = await cache.get<{ data: string }>(shopKey('products', 'shopA', 'list', '1'));
    expect(fromA).toEqual({ data: 'A-data' });
  });

  it('degrades to fail-open when Redis is unavailable (get→null)', async () => {
    const originalStatus = client.status;
    client.status = 'end';
    try {
      const value = await cache.get('dukastock:tmp:missing');
      expect(value).toBeNull();
    } finally {
      client.status = originalStatus;
    }
  });

  it('is disabled when Redis is not ready', async () => {
    const originalStatus = client.status;
    client.status = 'connecting';
    try {
      // Try to set when not ready — should not throw, treated as disabled.
      await cache.set('dukastock:tmp:x', 'y', 60);
      expect(cache.isEnabled()).toBe(false);
    } finally {
      client.status = originalStatus;
    }
  });
});

describe('RATE LIMITING', () => {
  it('allows requests within the limit', async () => {
    const rule = { key: 'dukastock:rl:test:ip1', limit: 3, windowSeconds: 60 };
    const r1 = await consumeRateLimit(rule);
    const r2 = await consumeRateLimit(rule);
    const r3 = await consumeRateLimit(rule);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.current).toBe(3);
  });

  it('blocks requests that exceed the limit', async () => {
    const rule = { key: 'dukastock:rl:test:ip2', limit: 2, windowSeconds: 60 };
    await consumeRateLimit(rule);
    await consumeRateLimit(rule);
    const r3 = await consumeRateLimit(rule);
    expect(r3.allowed).toBe(false);
    expect(r3.current).toBe(3);
    expect(r3.retryInSeconds).toBeGreaterThan(0);
  });

  it('resets the limit', async () => {
    const rule = { key: 'dukastock:rl:test:ip3', limit: 1, windowSeconds: 60 };
    await consumeRateLimit(rule);
    const blocked = await consumeRateLimit(rule);
    expect(blocked.allowed).toBe(false);
    await resetRateLimit(rule.key);
    const allowedAgain = await consumeRateLimit(rule);
    expect(allowedAgain.allowed).toBe(true);
  });

  it('is per-key so one tenant never consumes another budget', async () => {
    const ruleA = { key: 'dukastock:rl:tenant:A', limit: 1, windowSeconds: 60 };
    const ruleB = { key: 'dukastock:rl:tenant:B', limit: 1, windowSeconds: 60 };
    await consumeRateLimit(ruleA);
    expect((await consumeRateLimit(ruleA)).allowed).toBe(false);
    expect((await consumeRateLimit(ruleB)).allowed).toBe(true);
  });
});

describe('LOCKING', () => {
  it('acquires a lock', async () => {
    const token = await lock.tryAcquire('dukastock:lock:t1', 10000);
    expect(token).not.toBeNull();
    // A second acquire while held must fail.
    const second = await lock.tryAcquire('dukastock:lock:t1', 10000);
    expect(second).toBeNull();
  });

  it('rejects contention', async () => {
    const a = await lock.tryAcquire('dukastock:lock:t2', 10000);
    expect(a).not.toBeNull();
    const acquired = await lock.acquire('dukastock:lock:t2', 10000, 50);
    expect(acquired).toBe(false);
  });

  it('expires after TTL', async () => {
    const token = await lock.tryAcquire('dukastock:lock:t3', 100);
    expect(token).not.toBeNull();
    await new Promise((r) => setTimeout(r, 250));
    const again = await lock.tryAcquire('dukastock:lock:t3', 10000);
    expect(again).not.toBeNull();
  });

  it('releases safely (only owner can release)', async () => {
    const token = await lock.tryAcquire('dukastock:lock:t4', 10000);
    expect(token).not.toBeNull();
    // A wrong-token release must NOT free the lock (ownership is token-checked).
    await lock.release('dukastock:lock:t4', 'not-the-token');
    expect(await client.get('dukastock:lock:t4')).toBe(token);
    // Correct token releases.
    await lock.release('dukastock:lock:t4', token!);
    expect(await client.get('dukastock:lock:t4')).toBeNull();
    const free = await lock.tryAcquire('dukastock:lock:t4', 10000);
    expect(free).not.toBeNull();
  });
});

describe('QUEUES', () => {
  it('creates a job', async () => {
    const job = await queue.enqueue({ queue: 'test', type: 'ping', shopId: 's1', payload: { n: 1 } });
    expect(job).not.toBeNull();
    expect(job!.shopId).toBe('s1');
  });

  it('processes a job', async () => {
    await queue.enqueue({ queue: 'testproc', type: 'work', shopId: 's1', payload: { ok: true } });
    const popped = await queue.pop('testproc', 1);
    expect(popped).not.toBeNull();
    expect(popped!.payload).toEqual({ ok: true });
  });

  it('retries on worker failure up to maxAttempts', async () => {
    await queue.enqueue({ queue: 'retryq', type: 'fail', shopId: 's1', payload: {} }, { maxAttempts: 2 });
    const handler = async () => {
      throw new Error('boom');
    };
    const stop = await queue.worker('retryq', handler, { concurrency: 1 });
    // Let the worker pick up and retry; then stop.
    await new Promise((r) => setTimeout(r, 300));
    await stop();
    // After 2 attempts the job should land in the dead-letter list.
    const deadKey = 'dukastock:queue:retryq:dead';
    const dead = await (client as unknown as { llen: (k: string) => Promise<number> }).llen(deadKey);
    expect(dead).toBeGreaterThanOrEqual(1);
  });

  it('fails permanently (dead-letter) after exceeding retries', async () => {
    await queue.enqueue({ queue: 'deadq', type: 'fail', shopId: 's1', payload: {} }, { maxAttempts: 1 });
    const call = { queue: 'deadq', kind: 'plain' };
    void call;
    const handler = async () => {
      throw new Error('boom');
    };
    const stop = await queue.worker('deadq', handler, { concurrency: 1 });
    await new Promise((r) => setTimeout(r, 300));
    await stop();
    const deadKey = 'dukastock:queue:deadq:dead';
    const dead = await (client as unknown as { llen: (k: string) => Promise<number> }).llen(deadKey);
    expect(dead).toBeGreaterThanOrEqual(1);
  });

  it('deduplicates jobs with the same dedupKey', async () => {
    const opts = { queue: 'dedupq', type: 'op', shopId: 's1', payload: { opId: 'abc' } };
    const first = await queue.enqueue(opts, { dedupKey: 'op-abc' });
    const second = await queue.enqueue(opts, { dedupKey: 'op-abc' });
    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});

describe('MULTI-TENANCY', () => {
  it('namespace isolation: Business A cannot access Business B keys', async () => {
    await cache.set(shopKey('products', 'bizA', 'list', '1'), { data: 'A' }, 60);
    await cache.set(shopKey('products', 'bizB', 'list', '1'), { data: 'B' }, 60);

    expect(await cache.get<{ data: string }>(shopKey('products', 'bizA', 'list', '1'))).toEqual({ data: 'A' });
    expect(await cache.get<{ data: string }>(shopKey('products', 'bizB', 'list', '1'))).toEqual({ data: 'B' });

    // Invalidating shop A must not touch shop B.
    await cache.invalidateByPattern(`dukastock:products:shop:bizA:list:*`);
    expect(await cache.get<{ data: string }>(shopKey('products', 'bizA', 'list', '1'))).toBeNull();
    expect(await cache.get<{ data: string }>(shopKey('products', 'bizB', 'list', '1'))).toEqual({ data: 'B' });
  });

  it('keyOf joins parts without empty/undefined segments', () => {
    expect(keyOf(['dukastock', 'products', 'shop', 's1', undefined, 'list'])).toBe('dukastock:products:shop:s1:list');
    expect(shopKey('products', 's1', 'detail', 'p1')).toBe('dukastock:products:shop:s1:detail:p1');
  });
});
