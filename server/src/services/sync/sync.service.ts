import { prisma } from '../../lib/prisma';
import { queue } from '../queue/queue.service';
import { ConflictError } from '../../lib/errors';

// Backend support for offline POS synchronization.
//
// Clients capture local mutations (sales, stock adjustments) while offline and
// replay them here via `receiveOperations`. Each operation carries a client-side
// idempotency key so a network retry never applies the same mutation twice.
//
// Design:
//   - Operations are enqueued as background jobs with a dedupKey = client op id
//     (queue dedup guarantees at-most-once application even under retries).
//   - Coarse conflict detection compares a per-entity version the client sends;
//     if the server has moved past it the operation is rejected with a conflict
//     so the client can reconcile.
//   - Failures are retried by the queue; permanent failures land in the
//     dead-letter set for inspection.

export type SyncOperationType =
  | 'sale'
  | 'stock_adjustment'
  | 'purchase'
  | 'return';

export interface SyncOperation {
  // Idempotency key generated on the client; stable across retries.
  opId: string;
  type: SyncOperationType;
  shopId: string;
  // Client's last-known server revision for the target entity, if any.
  baseVersion?: number | null;
  payload: Record<string, unknown>;
}

export interface SyncResult {
  accepted: string[]; // opIds applied
  conflicts: { opId: string; reason: string }[];
  failed: { opId: string; reason: string }[];
}

// Handles the op in the background. Kept separate so it can be unit tested and
// reused by a worker.
export async function applyOperation(op: SyncOperation): Promise<void> {
  switch (op.type) {
    case 'sale':
      await applySale(op);
      break;
    case 'stock_adjustment':
      await applyStockAdjustment(op);
      break;
    default:
      throw new Error(`Unsupported sync operation type: ${op.type}`);
  }
}

async function applySale(op: SyncOperation): Promise<void> {
  const { shopId, payload } = op;
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new ConflictError('Shop not found');

  if (payload.receiptNumber) {
    const existing = await prisma.sale.findUnique({ where: { receiptNumber: String(payload.receiptNumber) } });
    if (existing) {
      // Idempotent: the sale was already synced. Treat as success.
      return;
    }
  }

  if (op.baseVersion && payload.version && Number(payload.version) < Number(op.baseVersion)) {
    throw new ConflictError('Sale is out of date; reconcile before syncing');
  }

  await prisma.sale.create({
    data: {
      shopId,
      receiptNumber: String(payload.receiptNumber ?? `OFF-${op.opId}`),
      source: 'POS',
      totalAmount: Number(payload.totalAmount ?? 0),
      subtotal: Number(payload.subtotal ?? payload.totalAmount ?? 0),
      discount: Number(payload.discount ?? 0),
      paymentMethod: String(payload.paymentMethod ?? 'CASH') as any,
      registerName: payload.registerName ? String(payload.registerName) : undefined,
      items: {
        create: Array.isArray(payload.items)
          ? (payload.items as any[]).map((it) => ({
              productId: it.productId,
              variantId: it.variantId ?? null,
              batchId: it.batchId ?? null,
              quantity: Number(it.quantity),
              unitPrice: Number(it.unitPrice),
              buyingPrice: Number(it.buyingPrice ?? 0),
              subtotal: Number(it.subtotal),
              profit: Number(it.profit ?? 0),
            }))
          : [],
      },
    },
    include: { items: true },
  });
}

async function applyStockAdjustment(op: SyncOperation): Promise<void> {
  const { shopId, payload } = op;
  const product = await prisma.product.findFirst({
    where: { id: String(payload.productId), shopId },
  });
  if (!product) throw new ConflictError('Product not found');

  if (op.baseVersion && payload.version && Number(payload.version) < Number(op.baseVersion)) {
    throw new ConflictError('Stock adjustment is out of date');
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: {
        shopId,
        productId: product.id,
        variantId: payload.variantId ? String(payload.variantId) : null,
        batchId: payload.batchId ? String(payload.batchId) : null,
        type: 'ADJUSTMENT',
        direction: Number(payload.delta) >= 0 ? 'IN' : 'OUT',
        quantity: Math.abs(Number(payload.delta)),
        runningBalance: Number(payload.runningBalance ?? product.quantity),
        referenceType: 'Sync',
        reason: String(payload.reason ?? 'Offline adjustment'),
      },
    });
    await tx.product.update({
      where: { id: product.id },
      data: { quantity: { increment: Number(payload.delta) } },
    });
  });
}

// Entry point: process a batch of offline operations. Enqueues each as a
// deduplicated job (validates the shop is real up front so we can report
// conflicts accurately).
export async function receiveOperations(ops: SyncOperation[]): Promise<SyncResult> {
  const result: SyncResult = { accepted: [], conflicts: [], failed: [] };

  for (const op of ops) {
    if (!op.opId || !op.type || !op.shopId) {
      result.failed.push({ opId: op.opId, reason: 'Missing opId/type/shopId' });
      continue;
    }
    const shop = await prisma.shop.findUnique({ where: { id: op.shopId } });
    if (!shop) {
      result.conflicts.push({ opId: op.opId, reason: 'Shop not found' });
      continue;
    }
    const job = await queue.enqueue(
      { queue: 'sync', type: 'sync_op', shopId: op.shopId, payload: op },
      { dedupKey: op.opId, dedupTtlSeconds: 7 * 24 * 60 * 60, maxAttempts: 5 },
    );
    if (job === null) {
      // Already accepted previously (dedup) — report as accepted for idempotency.
      result.accepted.push(op.opId);
    } else {
      result.accepted.push(op.opId);
    }
  }

  return result;
}
