import { Prisma } from '@prisma/client';
import type { RefundMethod, RefundStatus, ReturnCondition, ReturnReason, ReturnStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { addStock } from '../../services/inventory.service';
import { invalidateAfterProductChange } from '../../services/cache/invalidation.service';
import { mul, round2 } from '../../utils/money';

export interface ReturnApprovalInfo {
  required: boolean;
  canApprove: boolean;
}

export interface CreateReturnInput {
  saleId: string;
  items: { saleItemId: string; quantity: number; condition?: ReturnCondition }[];
  refundMethod?: RefundMethod;
  registerId?: string | null;
  notes?: string;
}

// Global (per-shop) counters for human-friendly return/refund numbers.
async function nextReturnNumber(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.return.findFirst({ orderBy: { returnNumber: 'desc' } });
  const lastNum = last ? parseInt(last.returnNumber.replace('RT-', ''), 10) : 0;
  return `RT-${String(lastNum + 1).padStart(6, '0')}`;
}

async function nextRefundNumber(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.refund.findFirst({ orderBy: { refundNumber: 'desc' } });
  const lastNum = last ? parseInt(last.refundNumber.replace('RF-', ''), 10) : 0;
  return `RF-${String(lastNum + 1).padStart(6, '0')}`;
}

// Records a cash refund movement on the register's open shift (if any) so the
// shift expected-cash reconciliation stays accurate.
async function recordCashRefund(
  tx: Prisma.TransactionClient,
  shopId: string,
  registerId: string | null,
  amount: Prisma.Decimal,
  refundId: string,
  userId: string | undefined,
) {
  if (!registerId) return;
  const openShift = await tx.shift.findFirst({
    where: { shopId, registerId, status: 'OPEN' },
    select: { id: true },
  });
  await tx.cashMovement.create({
    data: {
      shopId,
      shiftId: openShift?.id ?? null,
      registerId,
      type: 'CASH_REFUND',
      amount: round2(amount),
      referenceType: 'Refund',
      referenceId: refundId,
      description: 'Cash refund issued',
      createdById: userId ?? null,
    },
  });
}

// Completes the physical return: restocks the items, marks the refund paid and
// updates the sale's payment status. Must run inside the caller's transaction.
async function processReturnInternal(
  tx: Prisma.TransactionClient,
  shopId: string,
  returnId: string,
  actorId: string,
) {
  const ret = await tx.return.findFirst({
    where: { id: returnId, shopId },
    include: {
      items: { include: { saleItem: { select: { variantId: true, batchId: true, productId: true } } } },
      refunds: true,
    },
  });
  if (!ret) throw new NotFoundError('Return not found');

  // Restock each returned item.
  for (const item of ret.items) {
    const target = {
      variantId: item.variantId,
      batchId: null as string | null,
    };
    if (item.saleItem?.batchId) {
      // Return product to its batch when the batch is still active.
      const batch = await tx.batch.findFirst({
        where: { id: item.saleItem.batchId, shopId, productId: item.productId, variantId: item.variantId ?? null },
        select: { id: true, quantityRemaining: true, status: true },
      });
      if (batch && (batch.status === 'ACTIVE' || batch.status === 'EXPIRING_SOON')) {
        await tx.batch.update({
          where: { id: batch.id },
          data: { quantityRemaining: { increment: item.quantity } },
        });
        await tx.product.update({
          where: { id: item.productId, shopId },
          data: { quantity: { increment: item.quantity } },
        });
        if (item.saleItem.variantId) {
          await tx.productVariant.update({
            where: { id: item.saleItem.variantId },
            data: { quantity: { increment: item.quantity } },
          });
        }
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: item.productId,
            variantId: item.saleItem.variantId ?? null,
            batchId: batch.id,
            type: 'RETURN',
            direction: 'IN',
            quantity: item.quantity,
            runningBalance: batch.quantityRemaining + item.quantity,
            reason: `Return ${ret.returnNumber}`,
            referenceType: 'Return',
            referenceId: ret.id,
            createdBy: actorId,
          },
        });
        continue;
      }
      target.batchId = null;
    }

    const updated = await addStock(tx, item.productId, item.quantity, 'RETURN', {
      shopId,
      variantId: target.variantId,
      reason: `Return ${ret.returnNumber}`,
      referenceType: 'Return',
      referenceId: ret.id,
      createdBy: actorId,
    });
    void updated;
  }

  // Complete the refund.
  const refund = ret.refunds[0];
  const completedAt = new Date();
  await tx.refund.updateMany({
    where: { id: { in: ret.refunds.map((r) => r.id) }, status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
    data: { status: 'COMPLETED', processedAt: completedAt, approvedById: actorId },
  });

  if (refund && refund.refundMethod === 'CASH') {
    await recordCashRefund(tx, shopId, refund.registerId, refund.amount, refund.id, actorId);
  }

  // Recompute sale payment status from all completed refunds on the sale.
  const saleId = ret.saleId;
  const sale = await tx.sale.findUniqueOrThrow({ where: { id: saleId, shopId } });
  const completedRefunds = await tx.refund.aggregate({
    where: { saleId, shopId, status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const refundedTotal = round2(completedRefunds._sum.amount ?? 0);
  const fullyRefunded = refundedTotal.greaterThanOrEqualTo(round2(sale.totalAmount));
  await tx.sale.update({
    where: { id: saleId },
    data: { paymentStatus: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
  });

  await tx.return.update({
    where: { id: returnId },
    data: { status: 'COMPLETED', processedAt: completedAt, processedById: actorId },
  });

  return { fullyRefunded };
}

function resolveRefundMethod(
  requested: RefundMethod,
  sale: { items: { productId: string; quantity: number }[]; payments: { paymentMethod: string }[] },
): RefundMethod {
  if (requested !== 'ORIGINAL') return requested;
  if (!sale.payments || sale.payments.length === 0) return 'STORE_CREDIT';
  const methods = new Set(sale.payments.map((p) => p.paymentMethod as RefundMethod));
  if (methods.size === 1) return methods.values().next().value as RefundMethod;
  return 'STORE_CREDIT';
}

// Creates a return for a sale. Returns are approved inline when the actor can
// approve (or no approval is required), otherwise they stay PENDING for a
// manager to approve. Restocking + refund settlement happen on completion.
export async function createReturn(
  shopId: string,
  userId: string | undefined,
  input: CreateReturnInput,
  approval: ReturnApprovalInfo,
) {
  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id: input.saleId, shopId },
      include: {
        items: { include: { product: { select: { name: true } } } },
        payments: true,
      },
    });
    if (!sale) throw new NotFoundError('Sale not found');
    if (sale.paymentStatus === 'REFUNDED') throw new ValidationError('This sale has already been fully refunded');

    // Map saleItemId -> sale item.
    const saleItemById = new Map(sale.items.map((it) => [it.id, it]));

    // Total already returned per sale item (all non-rejected returns).
    const alreadyReturned = await tx.returnItem.findMany({
      where: {
        saleItemId: { in: input.items.map((i) => i.saleItemId) },
        return: { status: { notIn: ['REJECTED'] } },
      },
      select: { saleItemId: true, quantity: true },
    });
    const returnedQty = new Map<string, number>();
    for (const r of alreadyReturned) {
      returnedQty.set(r.saleItemId, (returnedQty.get(r.saleItemId) ?? 0) + r.quantity);
    }

    // Validate quantities against what remains returnable.
    const reason = 'OTHER' as ReturnReason;
    const items: {
      saleItemId: string;
      productId: string;
      variantId: string | null;
      quantity: number;
      unitPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      condition?: ReturnCondition;
    }[] = [];

    for (const item of input.items) {
      const saleItem = saleItemById.get(item.saleItemId);
      if (!saleItem) throw new ValidationError('Sale item does not belong to this sale');
      const already = returnedQty.get(item.saleItemId) ?? 0;
      const available = saleItem.quantity - already;
      if (item.quantity > available) {
        throw new ValidationError(
          `Cannot return ${item.quantity} of ${saleItem.product.name}: only ${available} left to return`,
        );
      }
      const subtotalLine = mul(saleItem.unitPrice, item.quantity);
      items.push({
        saleItemId: item.saleItemId,
        productId: saleItem.productId,
        variantId: saleItem.variantId ?? null,
        quantity: item.quantity,
        unitPrice: saleItem.unitPrice,
        subtotal: subtotalLine,
        condition: item.condition ?? 'GOOD',
      });
    }

    // Refund is proportional to the post-discount total: each line is scaled by
    // totalAmount/subtotal so the shop never refunds more than was collected.
    const saleSubtotal = sale.subtotal;
    const factor = saleSubtotal.isZero() ? round2(0) : sale.totalAmount.div(saleSubtotal);
    let refundAmount = round2(0);
    for (const it of items) {
      const share = mul(it.subtotal, factor);
      it.subtotal = share;
      refundAmount = refundAmount.add(share).toDecimalPlaces(2);
    }

    // Determine refund method from the original payments when requested.
    const refundMethod = resolveRefundMethod(input.refundMethod ?? 'ORIGINAL', sale);

    const requiresApproval = approval.required || approval.canApprove === false;

    const status = requiresApproval ? 'PENDING' : 'APPROVED';

    const returnNumber = await nextReturnNumber(tx);
    const refundNumber = await nextRefundNumber(tx);

    const ret = await tx.return.create({
      data: {
        shopId,
        saleId: sale.id,
        returnNumber,
        reason: reason as ReturnReason,
        condition: 'GOOD',
        status,
        notes: input.notes ?? null,
        createdById: userId ?? null,
        items: {
          create: items.map((it) => ({
            saleItemId: it.saleItemId,
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal,
          })),
        },
        refunds: {
          create: {
            shopId,
            saleId: sale.id,
            refundNumber,
            amount: refundAmount,
            refundMethod,
            status: requiresApproval ? 'PENDING' : 'APPROVED',
            registerId: input.registerId ?? null,
            createdById: userId ?? null,
          },
        },
      },
      include: { items: true, refunds: true },
    });

    // Auto-approved returns are processed immediately (restock + refund).
    let outcome: { fullyRefunded: boolean } | null = null;
    let completed = ret;
    if (!requiresApproval) {
      outcome = await processReturnInternal(tx, shopId, ret.id, userId ?? 'system');
      // Re-read so the response reflects the processed state (COMPLETED, etc.).
      completed = await tx.return.findUniqueOrThrow({
        where: { id: ret.id },
        include: { items: true, refunds: true },
      });
    }

    return { return: completed, requiresApproval, outcome };
  });

  // Returns restock inventory and change sale status, which affects product,
  // dashboard, report and storefront caches. Invalidate after commit.
  await invalidateAfterProductChange(shopId);
  return result;
}

// Approves (and settles) or rejects a pending return. Requires the
// returns.approve permission — enforced at the route.
export async function approveReturn(
  shopId: string,
  userId: string,
  returnId: string,
  input: { approved: boolean; notes?: string },
) {
  const result = await prisma.$transaction(async (tx) => {
    const ret = await tx.return.findFirst({
      where: { id: returnId, shopId },
      include: { refunds: true },
    });
    if (!ret) throw new NotFoundError('Return not found');
    if (ret.status !== 'PENDING') throw new ValidationError('Only pending returns can be approved or rejected');

    if (input.approved) {
      const outcome = await processReturnInternal(tx, shopId, ret.id, userId);
      await tx.return.update({
        where: { id: ret.id },
        data: { notes: input.notes ? `${ret.notes ?? ''}\nApproval: ${input.notes}`.trim() : ret.notes },
      });
      return { return: { ...ret, status: 'COMPLETED' }, outcome };
    }

    await tx.return.update({
      where: { id: ret.id },
      data: { status: 'REJECTED', processedAt: new Date(), processedById: userId, notes: input.notes ? `${ret.notes ?? ''}\nRejection: ${input.notes}`.trim() : ret.notes },
    });
    await tx.refund.updateMany({
      where: { returnId: ret.id, status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
      data: { status: 'CANCELLED' },
    });
    return { return: { ...ret, status: 'REJECTED' }, outcome: null };
  });

  await invalidateAfterProductChange(shopId);
  return result;
}

// ===== Queries =====

export async function listReturns(
  shopId: string,
  query: { page: number; limit: number; status?: string; from?: string; to?: string },
) {
  const { page, limit } = query;
  const where: Prisma.ReturnWhereInput = { shopId };
  if (query.status) where.status = query.status as ReturnStatus;
  if (query.from || query.to) {
    const range: Prisma.DateTimeFilter = {};
    if (query.from) range.gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      range.lte = to;
    }
    where.createdAt = range;
  }

  const [total, returns] = await Promise.all([
    prisma.return.count({ where }),
    prisma.return.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true, unit: true } } } },
        refunds: true,
        sale: { select: { id: true, receiptNumber: true, totalAmount: true } },
      },
    }),
  ]);

  return { returns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getReturn(shopId: string, id: string) {
  const ret = await prisma.return.findFirst({
    where: { id, shopId },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      refunds: true,
      sale: { select: { id: true, receiptNumber: true, totalAmount: true, createdAt: true } },
    },
  });
  if (!ret) throw new NotFoundError('Return not found');
  return ret;
}

export async function listRefunds(
  shopId: string,
  query: { page: number; limit: number; status?: string },
) {
  const { page, limit } = query;
  const where: Prisma.RefundWhereInput = { shopId };
  if (query.status) where.status = query.status as RefundStatus;

  const [total, refunds] = await Promise.all([
    prisma.refund.count({ where }),
    prisma.refund.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { return: { select: { id: true, returnNumber: true } }, sale: { select: { id: true, receiptNumber: true } } },
    }),
  ]);

  return { refunds, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}