import type { StockMovementType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { addStock as inventoryAddStock, deductStock as inventoryDeductStock } from '../../services/inventory.service';
import { notifyStockLevel } from '../../utils/notifications';
import { invalidateAfterProductChange } from '../../services/cache/invalidation.service';

// Adds stock through the centralized inventory service: increments quantity and
// records a STOCK_IN movement in one transaction.
export async function addStock(shopId: string, productId: string, quantity: number, reason: string | undefined, userId: string | undefined, referenceId?: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');

  const updated = await prisma.$transaction(async (tx) => {
    return inventoryAddStock(tx, productId, quantity, 'STOCK_IN', {
      reason: reason || 'Stock added',
      referenceId,
      createdBy: userId ?? null,
    });
  });

  await invalidateAfterProductChange(shopId, productId);
  return updated!;
}

// Removes stock with a reason (damage/expired/lost/adjustment) via the
// centralized inventory service, which never lets the quantity go negative.
export async function removeStock(
  shopId: string,
  productId: string,
  quantity: number,
  type: 'DAMAGE' | 'EXPIRED' | 'LOST' | 'ADJUSTMENT',
  reason: string | undefined,
  userId: string | undefined,
) {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');

  const updated = await prisma.$transaction(async (tx) => {
    return inventoryDeductStock(tx, shopId, productId, quantity, type as StockMovementType, {
      reason: reason || `Stock removed (${type.toLowerCase()})`,
      createdBy: userId ?? null,
    });
  });

  // Alert if now low/out of stock
  await notifyStockLevel(shopId, product.name, productId, updated!.quantity, product.lowStockThreshold);
  await invalidateAfterProductChange(shopId, productId);
  return updated!;
}

export async function listMovements(shopId: string, productId: string, page: number, limit: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');

  const skip = (page - 1) * limit;
  const [total, movements] = await Promise.all([
    prisma.stockMovement.count({ where: { productId } }),
    prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return { product, movements, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
