import Redis from 'ioredis';
import { redisConfig } from '../../config/env';
import { logger } from '../../lib/logger';

// Centralized ioredis client. All Redis access in the application flows through
// the higher-level services (cache, rate-limit, lock, queue) — direct use of
// this client is limited to infrastructure code only.
//
// It is configured for resilience:
//   - command/connection timeouts so a slow/unreachable Redis never stalls a request
//   - a small retry budget so transient blips don't kill every command
//   - lazy connect + a fail-open posture for the cache (DB remains the source
//     of truth)
//   - a single global client reused across the process (connection pooling)

const globalForRedis = globalThis as unknown as { redisClient?: Redis };

function createClient(): Redis {
  const client = new Redis(redisConfig.url, {
    // Connection
    lazyConnect: true,
    maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
    connectTimeout: redisConfig.connectTimeout,
    keepAlive: redisConfig.keepAlive ?? 0,
    enableReadyCheck: true,
    // Command level
    commandTimeout: redisConfig.commandTimeout,
    // Recovery: on reconnect clear the buffer so stale commands aren't fired
    // against a fresh connection.
    retryStrategy(times) {
      if (redisConfig.maxRetriesPerRequest > 0 && times > redisConfig.maxRetriesPerRequest) {
        logger.warn('Redis max retries reached, giving up on automatic reconnect', { times });
        return null;
      }
      // Exponential backoff capped at 5s.
      return Math.min(times * 200, 5000);
    },
    // TLS for secure managed Redis (ElastiCache, Upstash, etc.) over custom
    // port; controlled via REDIS_TLS=true and the URL's TLS scheme.
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  });

  // CRITICAL: ioredis throws an unhandled 'error' event (crashing the process)
  // if no 'error' listener is attached. This lets Redis failures degrade
  // gracefully instead of taking the whole API down with it — the application
  // fails open to the database, which remains the source of truth.
  client.on('error', (err) => {
    logger.warn('Redis client error (fail-open, database unaffected)', {
      message: err instanceof Error ? err.message : String(err),
    });
  });

  return client;
}

export const redis: Redis = globalForRedis.redisClient ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisClient = redis;
}

// Connects Redis during application bootstrap. Non-fatal when disabled or
// unreachable — the API keeps serving from the database (fail-open).
export async function connectRedis(): Promise<boolean> {
  if (!redisConfig.enabled) {
    logger.info('Redis integration disabled (REDIS_ENABLED=false). Cache/queues/locks will no-op.');
    return false;
  }
  try {
    await redis.connect();
    // Ensure commands wait for a ready connection.
    await new Promise<void>((resolve, reject) => {
      redis.once('ready', () => resolve());
      redis.once('error', (err) => reject(err));
      setTimeout(() => resolve(), 1500);
    });
    logger.info('Connected to Redis');
    return true;
  } catch (error) {
    logger.warn('Redis connection failed — continuing with database only (fail-open)', {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Graceful shutdown: close the client so pending/in-flight commands drain.
export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting' || redis.status === 'reconnecting') {
    await redis.quit().catch(() => redis.disconnect());
  }
}
