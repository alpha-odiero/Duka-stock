import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import { addStock, setStock } from '../../services/inventory.service';
import { round2 } from '../../utils/money';

async function ensureUnique(
  shopId: string,
  data: { sku?: string | null; barcode?: string | null },
  excludeId?: string,
) {
  if (data.sku) {
    const existing = await prisma.productVariant.findFirst({
      where: { shopId, sku: data.sku, id: excludeId ? { not: excludeId } : undefined },
    });
    if (existing) throw new ConflictError('A variant with this SKU already exists');
  }
  if (data.barcode) {
    const existing = await prisma.productVariant.findFirst({
      where: { shopId, barcode: data.barcode, id: excludeId ? { not: excludeId } : undefined },
    });
    if (existing) throw new ConflictError('A variant with this barcode already exists');
  }
}

export async function listVariants(
  shopId: string,
  query: { page: number; limit: number; productId?: string; search?: string },
) {
  const { page, limit, productId, search } = query;
  const where: Prisma.ProductVariantWhereInput = { shopId, isActive: true };
  if (productId) where.productId = productId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, variants] = await Promise.all([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: { product: { select: { id: true, name: true, unit: true } } },
    }),
  ]);

  return { variants, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getVariant(shopId: string, id: string) {
  const variant = await prisma.productVariant.findFirst({
    where: { id, shopId },
    include: { product: { select: { id: true, name: true, unit: true } } },
  });
  if (!variant) throw new NotFoundError('Variant not found');
  return variant;
}

export async function createVariant(
  shopId: string,
  productId: string,
  input: {
    name: string;
    sku?: string | null;
    barcode?: string | null;
    buyingPrice: Prisma.Decimal.Value;
    sellingPrice: Prisma.Decimal.Value;
    quantity?: number;
    lowStockThreshold?: number;
    imageUrl?: string | null;
    isActive?: boolean;
  },
  userId?: string,
) {
  const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
  if (!product) throw new NotFoundError('Product not found');

  await ensureUnique(shopId, {
    sku: (input.sku as string | null) || null,
    barcode: (input.barcode as string | null) || null,
  });

  const variant = await prisma.$transaction(async (tx) => {
    const created = await tx.productVariant.create({
      data: {
        shopId,
        productId,
        name: input.name,
        sku: (input.sku as string) || null,
        barcode: (input.barcode as string) || null,
        buyingPrice: round2(input.buyingPrice),
        sellingPrice: round2(input.sellingPrice),
        quantity: 0,
        lowStockThreshold: Number(input.lowStockThreshold ?? 5) || 0,
        imageUrl: (input.imageUrl as string) || null,
        isActive: input.isActive ?? true,
      },
    });

    const qty = Number(input.quantity ?? 0);
    if (qty > 0) {
      await addStock(tx, productId, qty, 'STOCK_IN', {
        shopId,
        variantId: created.id,
        reason: 'Opening variant stock',
        createdBy: userId ?? null,
      });
    }
    return created;
  });

  return prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
}

export async function updateVariant(shopId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.productVariant.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Variant not found');

  await ensureUnique(
    shopId,
    {
      sku: (input.sku as string | null) ?? existing.sku,
      barcode: (input.barcode as string | null) ?? existing.barcode,
    },
    id,
  );

  const data: Prisma.ProductVariantUpdateInput = {};
  if (input.name !== undefined) data.name = input.name as string;
  if (input.sku !== undefined) data.sku = (input.sku as string) || null;
  if (input.barcode !== undefined) data.barcode = (input.barcode as string) || null;
  if (input.buyingPrice !== undefined) data.buyingPrice = round2(input.buyingPrice as Prisma.Decimal.Value);
  if (input.sellingPrice !== undefined) data.sellingPrice = round2(input.sellingPrice as Prisma.Decimal.Value);
  if (input.lowStockThreshold !== undefined) data.lowStockThreshold = Number(input.lowStockThreshold) || 0;
  if (input.imageUrl !== undefined) data.imageUrl = (input.imageUrl as string) || null;
  if (input.isActive !== undefined) data.isActive = Boolean(input.isActive);
  if (input.sortOrder !== undefined) data.sortOrder = Number(input.sortOrder) || 0;

  return prisma.productVariant.update({ where: { id }, data });
}

// Adjusts the variant's absolute stock level (creates an ADJUSTMENT movement).
export async function adjustVariantStock(
  shopId: string,
  id: string,
  newQuantity: number,
  reason: string | undefined,
  userId?: string,
) {
  const variant = await prisma.productVariant.findFirst({ where: { id, shopId } });
  if (!variant) throw new NotFoundError('Variant not found');

  const updated = await prisma.$transaction(async (tx) => {
    return setStock(tx, shopId, variant.productId, newQuantity, {
      variantId: id,
      reason: reason || 'Variant stock adjustment',
      createdBy: userId ?? null,
    });
  });

  return updated;
}

export async function deleteVariant(shopId: string, id: string) {
  const variant = await prisma.productVariant.findFirst({ where: { id, shopId } });
  if (!variant) throw new NotFoundError('Variant not found');

  const sellCount = await prisma.saleItem.count({ where: { variantId: id } });
  const buyCount = await prisma.purchaseItem.count({ where: { variantId: id } });
  if (sellCount > 0 || buyCount > 0) {
    throw new ValidationError('This variant has sales or purchase history. Deactivate it instead of deleting.');
  }

  await prisma.productVariant.delete({ where: { id } });

  // Keep the parent aggregate consistent if the variant carried stock.
  if (variant.quantity > 0) {
    await prisma.product.update({
      where: { id: variant.productId, shopId },
      data: { quantity: { decrement: variant.quantity } },
    });
  }
}