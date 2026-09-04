import { queue } from '../services/queue/queue.service';
import { applyOperation, SyncOperation } from '../services/sync/sync.service';
import { logger } from '../lib/logger';

// Background workers. Each worker drains one queue through a handler and pumps
// jobs continuously. Started during bootstrap and stopped on graceful shutdown.
//
// Workers currently registered:
//   - sync        : applies offline POS operations (sales, stock adjustments)
//
// Additional workers (report, notification, forecast, stock-alert, webhook)
// are intentionally left as registration points — they share the same queue
// abstraction and are added incrementally without touching core logic.

const stopFns: (() => Promise<void>)[] = [];

export async function startWorkers(): Promise<void> {
  if (!queue.isEnabled()) {
    logger.warn('Workers not started — Redis unavailable');
    return;
  }

  stopFns.push(await queue.worker('sync', async (job) => {
    const op = job.payload as unknown as SyncOperation;
    logger.info('Processing sync op', { opId: op.opId, type: op.type });
    await applyOperation(op);
  }));

  logger.info('Redis workers started');
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(stopFns.map((stop) => stop().catch(() => undefined)));
  stopFns.length = 0;
}
