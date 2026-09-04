import { Prisma } from '@prisma/client';
import type { BatchStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import { addStock, deductFromBatch, setStock } from '../../services/inventory.service';
import { round2 } from '../../utils/money';

// Days before expiry that flips a batch to EXPIRING_SOON.
const EXPIRING_SOON_DAYS = 30;

export function computeBatchStatus(expiryDate: Date): BatchStatus {
  const now = new Date();
  if (expiryDate < now) return 'EXPIRED';
  const ms = expiryDate.getTime() - now.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  if (days <= EXPIRING_SOON_DAYS) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

async function refreshBatchStatus(tx: Prisma.TransactionClient, batchId: string) {
  const batch = await tx.batch.findUniqueOrThrow({ where: { id: batchId } });
  const status = computeBatchStatus(batch.expiryDate);
  if (status !== batch.status) {
    await tx.batch.update({ where: { id: batchId }, data: { status } });
  }
}

export async function listBatches(
  shopId: string,
  query: { page: number; limit: number; productId?: string; variantId?: string; status?: string; search?: string },
) {
  const { page, limit, productId, variantId, status, search } = query;
  const where: Prisma.BatchWhereInput = { shopId };
  if (productId) where.productId = productId;
  if (variantId) where.variantId = variantId;
  if (status) where.status = status as BatchStatus;
  if (search) {
    where.OR = [
      { batchNumber: { contains: search, mode: 'insensitive' } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, batches] = await Promise.all([
    prisma.batch.count({ where }),
    prisma.batch.findMany({
      where,
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: { select: { id: true, name: true, unit: true } },
        supplier: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { batches, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getBatch(shopId: string, id: string) {
  const batch = await prisma.batch.findFirst({
    where: { id, shopId },
    include: {
      product: { select: { id: true, name: true, unit: true } },
      supplier: { select: { id: true, name: true } },
      purchase: { select: { id: true, purchaseDate: true } },
    },
  });
  if (!batch) throw new NotFoundError('Batch not found');
  return batch;
}

// Creates a batch and adds its quantity to available stock in one transaction.
// Typically used when goods are received with expiry info (a purchase will also
// call this per line).
export async function createBatch(
  shopId: string,
  input: {
    productId: string;
    variantId?: string | null;
    batchNumber: string;
    supplierId?: string | null;
    purchaseId?: string | null;
    manufacturingDate?: string | null;
    expiryDate: string;
    quantity: number;
    costPerUnit: Prisma.Decimal.Value;
  },
  userId?: string,
  movementType: 'PURCHASE' | 'STOCK_IN' = 'PURCHASE',
) {
  const product = await prisma.product.findFirst({ where: { id: input.productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');

  if (input.variantId) {
    const variant = await prisma.productVariant.findFirst({ where: { id: input.variantId, shopId, productId: input.productId } });
    if (!variant) throw new NotFoundError('Variant not found');
  }

  const existing = await prisma.batch.findFirst({ where: { shopId, batchNumber: input.batchNumber } });
  if (existing) throw new ConflictError('A batch with this number already exists');

  const expiryDate = new Date(input.expiryDate);
  const existingCount = await prisma.batch.count({ where: { shopId, productId: input.productId } });
  const batchNumber = input.batchNumber || `B-${String(existingCount + 1).padStart(4, '0')}`;

  const batch = await prisma.$transaction(async (tx) => {
    const data: Prisma.BatchCreateInput = {
      shop: { connect: { id: shopId } },
      product: { connect: { id: input.productId } },
      variant: input.variantId ? { connect: { id: input.variantId } } : undefined,
      batchNumber,
      supplier: input.supplierId ? { connect: { id: input.supplierId } } : undefined,
      purchase: input.purchaseId ? { connect: { id: input.purchaseId } } : undefined,
      manufacturingDate: input.manufacturingDate ? new Date(input.manufacturingDate) : null,
      expiryDate,
      quantityReceived: input.quantity,
      quantityRemaining: input.quantity,
      costPerUnit: round2(input.costPerUnit),
      status: computeBatchStatus(expiryDate),
    };

    const created = await tx.batch.create({ data });

    if (input.quantity > 0) {
      await addStock(tx, input.productId, input.quantity, movementType, {
        shopId,
        variantId: input.variantId ?? null,
        reason: `Batch ${batchNumber}`,
        referenceType: 'Purchase',
        referenceId: input.purchaseId ?? null,
        createdBy: userId ?? null,
      });
    }
    return created;
  });

  return prisma.batch.findUniqueOrThrow({ where: { id: batch.id } });
}

export async function adjustBatch(
  shopId: string,
  id: string,
  newQuantity: number,
  reason: string | undefined,
  userId?: string,
) {
  const batch = await prisma.batch.findFirst({ where: { id, shopId } });
  if (!batch) throw new NotFoundError('Batch not found');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await setStock(tx, shopId, batch.productId, newQuantity, {
      batchId: id,
      variantId: batch.variantId ?? undefined,
      reason: reason || 'Batch stock adjustment',
      createdBy: userId ?? null,
    });
    await refreshBatchStatus(tx, id);
    return result;
  });

  return updated;
}

// Writes off the remaining quantity of an expired (or unwanted) batch and marks
// it EXPIRED/CONSUMED.
export async function discardBatch(shopId: string, id: string, userId?: string, reason?: string) {
  const batch = await prisma.batch.findFirst({ where: { id, shopId } });
  if (!batch) throw new NotFoundError('Batch not found');
  if (batch.quantityRemaining <= 0) throw new ValidationError('This batch already has no stock');

  await prisma.$transaction(async (tx) => {
    await deductFromBatch(tx, shopId, batch.productId, batch.id, batch.quantityRemaining, 'EXPIRED', {
      reason: reason || `Batch ${batch.batchNumber} written off as expired`,
      referenceType: 'Batch',
      referenceId: batch.id,
      createdBy: userId ?? null,
    });
    await tx.batch.update({
      where: { id: batch.id },
      data: { status: 'CONSUMED', quantityRemaining: 0 },
    });
  });

  return getBatch(shopId, id);
}

// Re-evaluates every active batch's status against today (EXPIRED/EXPIRING_SOON).
// Safe to call from a scheduled job or on any dashboard load.
export async function refreshExpiringStatuses(shopId: string) {
  const batches = await prisma.batch.findMany({
    where: { shopId, status: { in: ['ACTIVE', 'EXPIRING_SOON'] }, quantityRemaining: { gt: 0 } },
    select: { id: true, expiryDate: true, status: true },
  });

  let updated = 0;
  for (const b of batches) {
    const status = computeBatchStatus(b.expiryDate);
    if (status !== 'ACTIVE' && status !== b.status) {
      const batch = await prisma.batch.update({ where: { id: b.id }, data: { status } });
      if (batch) updated += 1;
    }
  }
  return { checked: batches.length, updated };
}

export async function deleteBatch(shopId: string, id: string) {
  const batch = await prisma.batch.findFirst({ where: { id, shopId } });
  if (!batch) throw new NotFoundError('Batch not found');
  if (batch.quantityRemaining > 0) {
    throw new ValidationError('Cannot delete a batch with remaining stock. Adjust or discard it first.');
  }
  await prisma.batch.delete({ where: { id } });
}