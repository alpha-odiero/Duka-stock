import type { Prisma, StockMovementDirection, StockMovementType } from '@prisma/client';
import { InsufficientStockError, NotFoundError } from '../lib/errors';

// Centralized inventory logic. Every stock change in the system — POS sales,
// online orders, purchases, returns, damage, loss, adjustments and manual
// stock-in — flows through these helpers so the stock bookkeeping stays
// consistent and every change produces an auditable StockMovement row.
//
// All helpers require an active transaction client (Prisma.TransactionClient)
// and are expected to be called from within the caller's $transaction, so that
// the row lock and movement insertion commit atomically with the surrounding
// operation.
//
// Products may be tracked:
//   - plain            : stock on Product.quantity (legacy, fully supported)
//   - with variants    : stock lives on ProductVariant.quantity; the parent
//                        Product.quantity is maintained as the aggregate sum so
//                        existing queries/slash views keep working.
//   - with batches     : stock lives on Batch.quantityRemaining; Product and
//                        optional Variant quantities are aggregated sums.

export interface MovementMeta {
  referenceId?: string | null;
  createdBy?: string | null;
  reason?: string;
  referenceType?: string | null;
}

export interface Target {
  productId: string;
  variantId?: string | null;
  batchId?: string | null;
}

type Tx = Prisma.TransactionClient;

async function createMovement(
  tx: Tx,
  data: {
    shopId: string;
    target: Target;
    type: StockMovementType;
    direction: StockMovementDirection;
    quantity: number;
    runningBalance: number;
    meta: MovementMeta;
  },
) {
  await tx.stockMovement.create({
    data: {
      shopId: data.shopId,
      productId: data.target.productId,
      variantId: data.target.variantId ?? null,
      batchId: data.target.batchId ?? null,
      type: data.type,
      direction: data.direction,
      quantity: data.quantity,
      runningBalance: data.runningBalance,
      reason: data.meta.reason ?? (data.direction === 'IN' ? 'Stock added' : 'Stock removed'),
      referenceId: data.meta.referenceId ?? null,
      referenceType: data.meta.referenceType ?? null,
      createdBy: data.meta.createdBy ?? null,
    },
  });
}

// Deducts stock with concurrency-safe oversell protection by locking the row
// with FOR UPDATE, on either a plain product or a variant. Throws
// InsufficientStockError if more than available and never lets quantity go
// negative. When a variant is used the parent product aggregate is decremented
// too, keeping Product.quantity consistent with the sum of its variants.
export async function deductStock(
  tx: Tx,
  shopId: string,
  productId: string,
  quantity: number,
  type: StockMovementType,
  meta: MovementMeta & { variantId?: string | null } = {},
) {
  if (quantity <= 0) return null;

  const variantId = meta.variantId ?? null;

  if (variantId) {
    const rows = await tx.$queryRaw<
      { id: string; quantity: number; productId: string }[]
    >`SELECT id, quantity, "productId" FROM "ProductVariant" WHERE id = ${variantId} AND "shopId" = ${shopId} FOR UPDATE`;

    if (rows.length === 0) throw new NotFoundError('Variant not found');
    const row = rows[0];

    if (quantity > row.quantity) {
      throw new InsufficientStockError(row.quantity, quantity, 'variant');
    }

    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { quantity: { decrement: quantity } },
      select: { id: true, quantity: true },
    });

    // Keep the parent product aggregate in sync, and grab its name/threshold so
    // POS/dashboards can show the variant line as its parent product.
    const product = await tx.product.findUniqueOrThrow({
      where: { id: row.productId },
      select: { name: true, lowStockThreshold: true },
    });

    await tx.product.update({
      where: { id: row.productId, shopId },
      data: { quantity: { decrement: quantity } },
    });

    await createMovement(tx, {
      shopId,
      target: { productId: row.productId, variantId },
      type,
      direction: 'OUT',
      quantity,
      runningBalance: updatedVariant.quantity,
      meta,
    });

    return {
      kind: 'variant' as const,
      id: updatedVariant.id,
      name: product.name,
      quantity: updatedVariant.quantity,
      lowStockThreshold: product.lowStockThreshold,
    };
  }

  const rows = await tx.$queryRaw<
    { id: string; quantity: number; sellingPrice: string; buyingPrice: string; name: string; lowStockThreshold: number }[]
  >`SELECT id, quantity, "sellingPrice", "buyingPrice", name, "lowStockThreshold" FROM "Product" WHERE id = ${productId} AND "shopId" = ${shopId} FOR UPDATE`;

  if (rows.length === 0) throw new NotFoundError(`Product ${productId} not found`);
  const row = rows[0];

  if (quantity > row.quantity) {
    throw new InsufficientStockError(row.quantity, quantity, row.name);
  }

  const updated = await tx.product.update({
    where: { id: productId },
    data: { quantity: { decrement: quantity } },
    select: { id: true, name: true, quantity: true, lowStockThreshold: true },
  });

  await createMovement(tx, {
    shopId,
    target: { productId },
    type,
    direction: 'OUT',
    quantity,
    runningBalance: updated.quantity,
    meta,
  });

  return { kind: 'product' as const, id: updated.id, name: updated.name, quantity: updated.quantity, lowStockThreshold: updated.lowStockThreshold };
}

// Deducts stock from a specific batch (used for expiry/FEFO or manual batch
// selection). Decrements the batch's remaining quantity and, if a variant is
// supplied, the variant; the parent product is always adjusted so its aggregate
// matches total available.
export async function deductFromBatch(
  tx: Tx,
  shopId: string,
  productId: string,
  batchId: string,
  quantity: number,
  type: StockMovementType,
  meta: MovementMeta,
) {
  if (quantity <= 0) return null;

  const batches = await tx.$queryRaw<
    { id: string; quantityRemaining: number; status: string }[]
  >`SELECT id, "quantityRemaining", status FROM "Batch" WHERE id = ${batchId} AND "shopId" = ${shopId} FOR UPDATE`;

  if (batches.length === 0) throw new NotFoundError('Batch not found');
  const batch = batches[0];

  if (quantity > batch.quantityRemaining) {
    throw new InsufficientStockError(batch.quantityRemaining, quantity, `batch (${batchId})`);
  }

  const updated = await tx.batch.update({
    where: { id: batchId },
    data: { quantityRemaining: { decrement: quantity } },
    select: { id: true, quantityRemaining: true, variantId: true, expiryDate: true, productId: true },
  });

  // Keep parent product aggregate in sync.
  await tx.product.update({
    where: { id: productId, shopId },
    data: { quantity: { decrement: quantity } },
  });

  // Keep variant aggregate in sync when the batch belongs to a variant.
  if (updated.variantId) {
    await tx.productVariant.update({
      where: { id: updated.variantId },
      data: { quantity: { decrement: quantity } },
    });
  }

  await createMovement(tx, {
    shopId,
    target: { productId, variantId: updated.variantId, batchId },
    type,
    direction: 'OUT',
    quantity,
    runningBalance: updated.quantityRemaining,
    meta,
  });

  return { kind: 'batch' as const, batchId, quantity: updated.quantityRemaining };
}

// FEFO (first-expired-first-out) deduction across a product's active batches.
// If the product has no active batches, falls back to plain product deduction.
// Keeps a full audit trail: one StockMovement per batch consumed.
export async function deductStockFEFO(
  tx: Tx,
  shopId: string,
  productId: string,
  quantity: number,
  type: StockMovementType,
  meta: MovementMeta & { variantId?: string | null } = {},
) {
  if (quantity <= 0) return null;

  const batches = await tx.batch.findMany({
    where: {
      shopId,
      productId,
      variantId: meta.variantId ?? null,
      status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
      quantityRemaining: { gt: 0 },
    },
    orderBy: { expiryDate: 'asc' },
    select: { id: true, quantityRemaining: true },
  });

  if (batches.length === 0) {
    return deductStock(tx, shopId, productId, quantity, type, meta);
  }

  let remaining = quantity;
  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, batch.quantityRemaining);
    await deductFromBatch(tx, shopId, productId, batch.id, take, type, meta);
    remaining -= take;
  }

  if (remaining > 0) {
    throw new InsufficientStockError(quantity - remaining, quantity, 'batches');
  }

  return { kind: 'batch' as const, quantity: 0 };
}

// Adds stock and records a movement. Supports variants (increments both variant
// and parent product). Returns the updated record.
export async function addStock(
  tx: Tx,
  productId: string,
  quantity: number,
  type: StockMovementType,
  meta: MovementMeta & { shopId?: string; variantId?: string | null } = {},
) {
  if (quantity <= 0) return null;

  const variantId = meta.variantId ?? null;

  if (variantId) {
    const updatedVariant = await tx.productVariant.update({
      where: { id: variantId },
      data: { quantity: { increment: quantity } },
      select: { id: true, quantity: true, productId: true },
    });

    await tx.product.update({
      where: { id: updatedVariant.productId },
      data: { quantity: { increment: quantity } },
    });

    const shopId = meta.shopId ?? (await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } })).shopId;

    await createMovement(tx, {
      shopId,
      target: { productId: updatedVariant.productId, variantId },
      type,
      direction: 'IN',
      quantity,
      runningBalance: updatedVariant.quantity,
      meta,
    });

    return { kind: 'variant' as const, id: updatedVariant.id, quantity: updatedVariant.quantity };
  }

  const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

  const updated = await tx.product.update({
    where: { id: productId },
    data: { quantity: { increment: quantity } },
    select: { id: true, name: true, quantity: true, lowStockThreshold: true },
  });

  await createMovement(tx, {
    shopId: meta.shopId ?? product.shopId,
    target: { productId },
    type,
    direction: 'IN',
    quantity,
    runningBalance: updated.quantity,
    meta,
  });

  return { kind: 'product' as const, id: updated.id, name: updated.name, quantity: updated.quantity, lowStockThreshold: updated.lowStockThreshold };
}

// Sets an absolute stock level (used for corrections). Records the difference
// as an ADJUSTMENT movement. Supports variants and batches.
export async function setStock(
  tx: Tx,
  shopId: string,
  productId: string,
  newQuantity: number,
  meta: MovementMeta & { variantId?: string | null; batchId?: string | null } = {},
) {
  const variantId = meta.variantId ?? null;
  const batchId = meta.batchId ?? null;

  if (variantId) {
    const variant = await tx.productVariant.findFirst({
      where: { id: variantId, shopId, productId },
      select: { id: true, quantity: true, productId: true },
    });
    if (!variant) throw new NotFoundError('Variant not found');

    const diff = newQuantity - variant.quantity;
    if (diff === 0) return { kind: 'variant' as const, id: variant.id, quantity: variant.quantity };

    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { quantity: newQuantity },
      select: { id: true, quantity: true },
    });

    await tx.product.update({
      where: { id: productId, shopId },
      data: { quantity: { increment: diff } },
    });

    await createMovement(tx, {
      shopId,
      target: { productId, variantId },
      type: 'ADJUSTMENT',
      direction: diff > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(diff),
      runningBalance: updated.quantity,
      meta,
    });

    return { kind: 'variant' as const, id: updated.id, quantity: updated.quantity };
  }

  if (batchId) {
    const batch = await tx.batch.findFirst({
      where: { id: batchId, shopId, productId },
      select: { id: true, quantityRemaining: true, variantId: true },
    });
    if (!batch) throw new NotFoundError('Batch not found');

    const diff = newQuantity - batch.quantityRemaining;
    if (diff === 0) return null;

    const updated = await tx.batch.update({
      where: { id: batchId },
      data: { quantityRemaining: newQuantity },
      select: { id: true, quantityRemaining: true, variantId: true },
    });

    await tx.product.update({
      where: { id: productId, shopId },
      data: { quantity: { increment: diff } },
    });

    if (batch.variantId) {
      await tx.productVariant.update({
        where: { id: batch.variantId },
        data: { quantity: { increment: diff } },
      });
    }

    await createMovement(tx, {
      shopId,
      target: { productId, variantId: batch.variantId, batchId },
      type: 'ADJUSTMENT',
      direction: diff > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(diff),
      runningBalance: updated.quantityRemaining,
      meta,
    });

    return null;
  }

  const product = await tx.product.findFirst({
    where: { id: productId, shopId },
    select: { id: true, name: true, quantity: true, lowStockThreshold: true },
  });
  if (!product) throw new NotFoundError('Product not found');

  const diff = newQuantity - product.quantity;
  if (diff === 0) return product;

  const updated = await tx.product.update({
    where: { id: productId },
    data: { quantity: newQuantity },
    select: { id: true, name: true, quantity: true, lowStockThreshold: true },
  });

  await createMovement(tx, {
    shopId,
    target: { productId },
    type: 'ADJUSTMENT',
    direction: diff > 0 ? 'IN' : 'OUT',
    quantity: Math.abs(diff),
    runningBalance: updated.quantity,
    meta,
  });

  return updated;
}