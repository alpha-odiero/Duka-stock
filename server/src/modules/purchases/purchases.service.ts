import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { mul, round2 } from '../../utils/money';
import { addStock } from '../../services/inventory.service';
import { invalidateAfterProductChange } from '../../services/cache/invalidation.service';
import { computeBatchStatus } from '../batches/batches.service';

// Creates a purchase and its items, increases product stock, records a
// STOCK_IN movement per item — and, when an item carries batch/expiry details,
// creates a Batch for it. All inside one transaction.
export async function createPurchase(
  shopId: string,
  input: {
    supplierId?: string | null;
    purchaseDate?: string;
    notes?: string;
    items: {
      productId: string;
      quantity: number;
      unitCost: Prisma.Decimal.Value;
      variantId?: string | null;
      batchNumber?: string;
      expiryDate?: string | null;
      manufacturingDate?: string | null;
    }[];
  },
  userId: string | undefined,
) {
  const full = await prisma.$transaction(async (tx) => {
    const items: {
      productId: string;
      variantId: string | null;
      quantity: number;
      unitCost: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      batchNumber?: string;
      expiryDate?: string | null;
      manufacturingDate?: string | null;
    }[] = [];

    for (const item of input.items) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, shopId },
        select: { id: true },
      });
      if (!product) throw new NotFoundError(`Product ${item.productId} not found`);

      if (item.variantId) {
        const variant = await tx.productVariant.findFirst({
          where: { id: item.variantId, shopId, productId: item.productId },
          select: { id: true },
        });
        if (!variant) throw new NotFoundError(`Variant ${item.variantId} not found for product`);
      }

      const unitCost = round2(item.unitCost);
      const subtotal = mul(unitCost, item.quantity);
      items.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitCost,
        subtotal,
        batchNumber: (item.batchNumber as string | undefined) || undefined,
        expiryDate: item.expiryDate ?? null,
        manufacturingDate: item.manufacturingDate ?? null,
      });
    }

    const totalAmount = items.reduce((acc, it) => acc.add(it.subtotal), round2(0)).toDecimalPlaces(2);

    const purchase = await tx.purchase.create({
      data: {
        shopId,
        supplierId: input.supplierId ?? null,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
        notes: input.notes || null,
        totalAmount,
        createdBy: userId ?? null,
      },
    });

    // Create each purchase line individually so a per-line batch stays linked
    // to the correct item even when the same product appears on several lines.
    for (const it of items) {
      const purchaseItem = await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
          unitCost: it.unitCost,
          subtotal: it.subtotal,
        },
      });

      // Batched items: create the Batch + restock in one go.
      if (it.batchNumber && it.expiryDate) {
        const existingBatch = await tx.batch.findFirst({
          where: { shopId, batchNumber: it.batchNumber! },
          select: { id: true },
        });
        if (existingBatch) {
          throw new NotFoundError(`Batch ${it.batchNumber} already exists`);
        }
        const expiryDate = new Date(it.expiryDate);
        const batch = await tx.batch.create({
          data: {
            shopId,
            productId: it.productId,
            variantId: it.variantId,
            batchNumber: it.batchNumber!,
            supplierId: input.supplierId ?? null,
            purchaseId: purchase.id,
            manufacturingDate: it.manufacturingDate ? new Date(it.manufacturingDate) : null,
            expiryDate,
            quantityReceived: it.quantity,
            quantityRemaining: it.quantity,
            costPerUnit: it.unitCost,
            status: computeBatchStatus(expiryDate),
          },
        });

        await addStock(tx, it.productId, it.quantity, 'PURCHASE', {
          shopId,
          variantId: it.variantId ?? null,
          reason: `Purchase ${purchase.id} / batch ${batch.batchNumber}`,
          referenceType: 'Purchase',
          referenceId: purchase.id,
          createdBy: userId ?? null,
        });

        await tx.purchaseItem.update({
          where: { id: purchaseItem.id },
          data: { batchId: batch.id },
        });
      } else {
        await addStock(tx, it.productId, it.quantity, 'PURCHASE', {
          shopId,
          variantId: it.variantId ?? null,
          reason: `Purchase ${purchase.id}`,
          referenceType: 'Purchase',
          referenceId: purchase.id,
          createdBy: userId ?? null,
        });
      }
    }

    const full = await tx.purchase.findUniqueOrThrow({
      where: { id: purchase.id },
      include: {
        items: { include: { product: { select: { name: true, unit: true } }, batch: { select: { id: true, batchNumber: true, expiryDate: true } } } },
        supplier: true,
      },
    });

    return full;
  });

  // Purchases add stock, which changes product/inventory/dashboard/report/store
  // cached reads.
  const affected = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, shopId },
    select: { id: true },
  });
  await Promise.all(affected.map((p) => invalidateAfterProductChange(shopId, p.id)));
  return full;
}

// Note: no stock is ever decreased in a purchase, so no oversell check needed.

export async function listPurchases(shopId: string, query: {
  page: number;
  limit: number;
  supplierId?: string;
  from?: string;
  to?: string;
}) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PurchaseWhereInput = { shopId };
  if (query.supplierId) where.supplierId = query.supplierId;

  if (query.from || query.to) {
    const range: Prisma.DateTimeFilter = {};
    if (query.from) range.gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      range.lte = to;
    }
    where.purchaseDate = range;
  }

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: 'desc' },
      skip,
      take: limit,
      include: { items: { include: { product: { select: { name: true, unit: true } } } }, supplier: true },
    }),
  ]);

  return { purchases, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getPurchase(shopId: string, id: string) {
  const purchase = await prisma.purchase.findFirst({
    where: { id, shopId },
    include: { items: { include: { product: { select: { name: true, unit: true } } } }, supplier: true },
  });
  if (!purchase) throw new NotFoundError('Purchase not found');
  return purchase;
}
