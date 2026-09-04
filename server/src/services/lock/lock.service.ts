import { randomUUID } from 'crypto';
import { redis } from '../../infrastructure/redis/redis.client';
import { logger } from '../../lib/logger';

// Distributed lock built on Redis SET NX PX with a unique token per acquisition.
// The token guarantees safe release: only the owner can delete the lock, so a
// stale lock can't be removed by a holder whose lock has expired.
//
// Used for coordination that spans multiple processes/instances — e.g.
// deduplicating idempotent operations, serializing critical transactions, and
// preventing concurrent job processing of the same payload.

export interface Lock {
  /** Acquire the lock, waiting up to `waitMs` for it to become free. */
  acquire(key: string, ttlMs: number, waitMs?: number): Promise<boolean>;
  /** Release the lock if we still own it (token-checked). */
  release(key: string, token: string): Promise<boolean>;
  /** Try to acquire without waiting. Returns a token or null. */
  tryAcquire(key: string, ttlMs: number): Promise<string | null>;
}

interface HeldLock {
  key: string;
  token: string;
}

const holder = new Map<string, HeldLock>();

// Lua script that releases only if the token matches — atomic and safe.
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const lock: Lock = {
  async tryAcquire(key: string, ttlMs: number): Promise<string | null> {
    if (!redis.status) return null;
    const token = randomUUID();
    try {
      const ok = await redis.set(key, token, 'PX', ttlMs, 'NX');
      if (ok !== 'OK') return null;
      holder.set(key, { key, token });
      return token;
    } catch (error) {
      logger.debug('Lock tryAcquire failed (fail-open → grant)', {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
      // Fail-open: without Redis we cannot coordinate, so do not block the
      // caller — single-instance correctness relies on the DB instead.
      return token;
    }
  },

  async acquire(key: string, ttlMs: number, waitMs: number = 0): Promise<boolean> {
    const started = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const token = await lock.tryAcquire(key, ttlMs);
      if (token !== null) return true;
      if (waitMs <= 0 || Date.now() - started >= waitMs) return false;
      await sleep(20);
    }
  },

  async release(key: string, token: string): Promise<boolean> {
    try {
      // Atomic token-checked release via Lua (safe across instances).
      await redis.eval(RELEASE_SCRIPT, 1, key, token);
      holder.delete(key);
      return true;
    } catch {
      // Fallback: get-compare-del in Node. Not atomic across instances, but
      // still prevents accidental release when the current holder differs.
      try {
        const current = await redis.get(key);
        if (current === token) await redis.del(key);
      } catch {
        // best-effort
      }
      holder.delete(key);
      return true;
    }
  },
};

// Convenience: run a critical section under a lock. If the lock cannot be
// acquired, resolves with `undefined` (callers decide how to handle contention).
export async function withLock<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
  opts: { waitMs?: number } = {},
): Promise<T | undefined> {
  const acquired = await lock.acquire(key, ttlMs, opts.waitMs ?? 0);
  if (!acquired) return undefined;
  const held = holder.get(key);
  const token = held?.token ?? '';
  try {
    return await fn();
  } finally {
    await lock.release(key, token);
  }
}
