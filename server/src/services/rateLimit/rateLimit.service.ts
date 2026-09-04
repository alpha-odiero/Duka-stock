import { redis } from '../../infrastructure/redis/redis.client';
import { logger } from '../../lib/logger';

// Distributed rate limiting backed by Redis so limits are enforced consistently
// across multiple API instances (horizontal scaling). Uses a fixed-window
// counter per key; the window rolls with a DEL of the counter after expiry.
//
// Multitenancy: keys are scoped by a key (e.g. shopId + IP + route) so one
// business can never consume another business's budget.
//
// Fail-open: if Redis is unavailable the limiter lets requests through and
// falls back to letting the in-process middleware handle abuse.

export interface RateLimitRule {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  retryInSeconds: number;
}

const SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = tonumber(redis.call("INCR", key))
if current == 1 then
  redis.call("EXPIRE", key, window)
end
local ttl = redis.call("TTL", key)
return {current, ttl}
`;

export async function consumeRateLimit(rule: RateLimitRule): Promise<RateLimitResult> {
  if (redis.status !== 'ready') {
    // Fail-open: no Redis, no distributed enforcement. Rely on local
    // middleware. Return allowed so requests aren't dropped.
    return { allowed: true, current: 0, limit: rule.limit, retryInSeconds: 0 };
  }
  try {
    const res = await redis.eval(SCRIPT, 1, rule.key, rule.limit, rule.windowSeconds) as [number, number];
    const current = res[0];
    const ttl = res[1];
    return {
      allowed: current <= rule.limit,
      current,
      limit: rule.limit,
      retryInSeconds: Math.max(0, ttl),
    };
  } catch (error) {
    logger.debug('Rate limit check failed (fail-open)', {
      key: rule.key,
      message: error instanceof Error ? error.message : String(error),
    });
    return { allowed: true, current: 0, limit: rule.limit, retryInSeconds: 0 };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  if (redis.status !== 'ready') return;
  try {
    await redis.del(key);
  } catch (error) {
    logger.debug('Rate limit reset failed (fail-open)', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
