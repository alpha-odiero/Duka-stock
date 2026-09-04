import { redis } from '../../infrastructure/redis/redis.client';
import { redisConfig } from '../../config/env';
import { logger } from '../../lib/logger';

// Key scheme (multi-tenant safe): <prefix>:<namespace>:<shopId>[:<rest>]
//
// Every cache key is scoped to the authenticated shop id where applicable so
// business A can never read business B's cached data. Cache data is derived
// strictly from the database (the source of truth) and is always safe to lose.

export function keyOf(parts: (string | number | undefined)[]): string {
  return parts.filter((p) => p !== undefined && p !== null && p !== '').join(':');
}

// Shop-scoped key that includes the global prefix. Cache reads/writes are
// always namespaced per business so no tenant can read another tenant's data.
export function shopKey(namespace: string, shopId: string, ...rest: (string | number)[]): string {
  return keyOf([redisConfig.keyPrefix, namespace, 'shop', shopId, ...rest]);
}

export interface CacheGetOptions {
  ttlSeconds: number;
  // If true and Redis is unavailable/fails, the caller falls back to computing
  // the value from the database (fail-open). Defaults to true.
  failOpen?: boolean;
}

export interface CacheService {
  /** Get a JSON value. Returns null on miss, or on Redis failure when failing open. */
  get<T>(key: string): Promise<T | null>;
  /** Set a JSON value with a TTL. Best-effort: never throws to the caller. */
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  /** Delete one or more keys. Best-effort. */
  del(...keys: string[]): Promise<void>;
  /** Delete an entire namespace for a shop (used for coarse invalidation). */
  invalidateByPattern(pattern: string): Promise<void>;
  isEnabled(): boolean;
}

// Implements the fail-open contract. When Redis is not reachable:
//   - get returns null (treat as a cache miss → read from DB)
//   - set/del are no-ops
// This keeps the API correct even if Redis is down; we only lose speed.
export const cache: CacheService = {
  isEnabled() {
    return redisConfig.enabled && redis.status === 'ready';
  },

  async get<T>(key: string): Promise<T | null> {
    if (!cache.isEnabled()) return null;
    try {
      const raw = await redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      if (!redisConfig.failOpen) throw error;
      logger.debug('Cache get failed (fail-open → DB)', {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!cache.isEnabled()) return;
    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      await redis.set(key, payload, 'EX', ttlSeconds);
    } catch (error) {
      if (!redisConfig.failOpen) throw error;
      logger.debug('Cache set failed (fail-open)', {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (!cache.isEnabled() || keys.length === 0) return;
    try {
      if (keys.length === 1) await redis.del(keys[0]);
      else await redis.del(keys);
    } catch (error) {
      logger.debug('Cache del failed (fail-open)', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },

  async invalidateByPattern(pattern: string): Promise<void> {
    if (!cache.isEnabled()) return;
    try {
      // SCAN instead of KEYS to avoid blocking Redis on large keyspaces.
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length) await redis.del(keys);
      } while (cursor !== '0');
    } catch (error) {
      logger.debug('Cache pattern invalidate failed (fail-open)', {
        pattern,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },
};

// Convenience wrapper: get-or-compute with TTL. `loader` is only invoked on a
// miss (or when Redis is down). This encapsulates the fail-open behavior — when
// Redis is down the loader always runs, so the response stays correct.
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cache.set(key, value, ttlSeconds);
  return value;
}
