import { randomUUID } from 'crypto';
import { redis } from '../../infrastructure/redis/redis.client';
import { lock } from '../lock/lock.service';
import { redisConfig } from '../../config/env';
import { logger } from '../../lib/logger';

// Lightweight Redis-backed job queue.
//
// Jobs are pushed to a list keyed by queue name. Workers BLMPOP off the list and
// process items. Failed jobs are pushed to a retry list with their attempt count
// until maxAttempts is reached, at which point they're moved to a dead-letter
// list for inspection.
//
// Deduplication is supported via an idempotency key: enqueueing two jobs with
// the same dedupKey within the dedup window enqueues only the first.
//
// Everything is multi-tenant aware through the job's shopId and namespaced keys.

export interface Job<T = unknown> {
  id: string;
  type: string;
  queue: string;
  shopId: string;
  payload: T;
  dedupKey?: string;
  dedupTtlSeconds?: number;
  createdAt: number;
  attempt: number;
  maxAttempts: number;
}

export interface JobResult {
  ok: boolean;
  job?: Job;
  // When ok is false and retryable, worker should re-enqueue.
  retryable?: boolean;
  error?: string;
}

export type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

interface QueueInternals {
  key(queue: string): string;
}

const internals: QueueInternals = {
  key(queue: string): string {
    return `${redisConfig.keyPrefix}:queue:${queue}`;
  },
};

function baseJob<T>(queue: string, type: string, shopId: string, payload: T): Job<T> {
  return {
    id: randomUUID(),
    type,
    queue,
    shopId,
    payload,
    createdAt: Date.now(),
    attempt: 0,
    maxAttempts: 3,
  };
}

const DEDUP_TTL = 30; // seconds — dedup window by default

export const queue = {
  isEnabled(): boolean {
    return redisConfig.enabled && redis.status === 'ready';
  },

  // Enqueue a job for processing. Returns the job, or null if deduplicated.
  async enqueue<T>(
    opts: { queue: string; type: string; shopId: string; payload: T },
    extra: { dedupKey?: string; dedupTtlSeconds?: number; maxAttempts?: number } = {},
  ): Promise<Job<T> | null> {
    if (!queue.isEnabled()) return null;
    const job = baseJob(opts.queue, opts.type, opts.shopId, opts.payload);
    if (extra.maxAttempts) job.maxAttempts = extra.maxAttempts;

    if (extra.dedupKey) {
      const dedupRedisKey = `${redisConfig.keyPrefix}:dedup:${opts.queue}:${extra.dedupKey}`;
      // Acquire atomically; if already present the job is a duplicate.
      const acquired = await redis.set(dedupRedisKey, job.id, 'EX', extra.dedupTtlSeconds ?? DEDUP_TTL, 'NX');
      if (acquired !== 'OK') return null; // duplicate — skip
    }

    await redis.lpush(internals.key(opts.queue), JSON.stringify(job));
    return job;
  },

  // Push a job back for a retry (increments attempt). Returns false once max
  // attempts are exceeded (caller should move it to dead-letter).
  async retry(job: Job): Promise<boolean> {
    if (!queue.isEnabled()) return false;
    const next: Job = { ...job, attempt: job.attempt + 1 };
    if (next.attempt >= next.maxAttempts) {
      await queue.dead(job, `Max attempts (${job.maxAttempts}) exceeded`);
      return false;
    }
    await redis.lpush(internals.key(job.queue), JSON.stringify(next));
    return true;
  },

  // Mark a job as permanently failed.
  async dead(job: Job, reason: string): Promise<void> {
    if (!queue.isEnabled()) return;
    const deadKey = `${internals.key(job.queue)}:dead`;
    await redis.lpush(deadKey, JSON.stringify({ ...job, failedAt: Date.now(), reason }));
  },

  // Dequeue the next job for a queue (used by workers). Non-blocking lpop with
  // a short idle pause keeps the worker simple and works identically against a
  // real Redis or an in-memory mock (blocking commands are widely unsupported
  // in stubs). Polling every 100ms is fine for background job latency.
  async pop(queueName: string, _pollMs = 5): Promise<Job | null> {
    if (!queue.isEnabled()) return null;
    const res = await redis.lpop(internals.key(queueName));
    if (!res) return null;
    return JSON.parse(res) as Job;
  },

  // Acknowledge (finalize) a job. Used to clean up dedup keys on success.
  async ack(job: Job): Promise<void> {
    if (!queue.isEnabled()) return;
    if (job.dedupKey) {
      await redis.del(`${redisConfig.keyPrefix}:dedup:${job.queue}:${job.dedupKey}`);
    }
  },

  // Run a worker loop for a queue, executing handler per job. Returns a
  // stop function. Handles retries and dead-lettering. A distributed lock
  // around each job prevents duplicate concurrent processing of the same job id.
  async worker(queueName: string, handler: JobHandler, opts: { concurrency?: number } = {}): Promise<() => Promise<void>> {
    let stopped = false;
    const workers: Promise<void>[] = [];
    const concurrency = opts.concurrency ?? 1;

    const run = async () => {
      const processOne = async () => {
        const job = await queue.pop(queueName, 3);
        if (!job) {
          // Idle: pause briefly before polling again so we don't spin the loop.
          await new Promise((r) => setTimeout(r, 100));
          return;
        }
        // Guard against concurrent processing of the same job across instances.
        const jobLock = `${redisConfig.keyPrefix}:joblock:${job.id}`;
        const token = await lock.tryAcquire(jobLock, 30_000);
        if (token === null) {
          // Another instance is processing it — re-queue for later.
          await queue.retry(job);
          return;
        }
        try {
          await handler({ ...job, attempt: job.attempt } as Job);
          await queue.ack(job);
        } catch (error) {
          logger.warn('Job handler failed', {
            queue: queueName,
            jobId: job.id,
            attempt: job.attempt,
            message: error instanceof Error ? error.message : String(error),
          });
          await queue.retry(job);
        } finally {
          await lock.release(jobLock, token);
        }
      };

      while (!stopped) {
        await processOne();
      }
    };

    for (let i = 0; i < concurrency; i++) workers.push(run());

    return async () => {
      stopped = true;
      await Promise.all(workers);
    };
  },
};
