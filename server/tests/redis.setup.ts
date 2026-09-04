import RedisMock from 'ioredis-mock';

// Redis integration tests run against an in-memory ioredis mock so the suite is
// deterministic and requires no live Redis server. The mock implements the
// ioredis interface (set/get/del/scan/eval/blpop/lpush/...), so every service
// that talks to Redis through the exported singleton works unchanged.
//
// The real `redis.client.ts` lazily reads its client from a module-level global;
// this file seeds that global BEFORE each test file imports the services, so
// `redis` (and thus cache/lock/queue/rate-limit/sync services) resolve to the
// mock. Tests that exercise "Redis unavailable" temporarily set status to
// `end`/`close` or wipe the mock.

const globalForRedis = globalThis as unknown as { redisClient?: unknown };

if (!globalForRedis.redisClient) {
  const mock = new RedisMock();
  mock.status = 'ready';
  globalForRedis.redisClient = mock;
}

beforeEach(async () => {
  const client = globalForRedis.redisClient as { flushall?: () => Promise<void>; status?: string };
  if (client && typeof client.flushall === 'function') {
    await client.flushall();
  }
});
