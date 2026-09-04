import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError } from '../../lib/errors';
import { addStock } from '../../services/inventory.service';
import { cached, keyOf } from '../../services/cache/cache.service';
import { invalidateAfterProductChange } from '../../services/cache/invalidation.service';
import { redisConfig } from '../../config/env';
import { round2 } from '../../utils/money';
import type { ProductQuery } from './products.schema';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

async function ensureUniqueSlug(shopId: string, name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findFirst({
      where: { shopId, slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export async function listProducts(shopId: string, q: ProductQuery) {
  const { page, limit, search, categoryId, supplierId, status, sort } = q;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { shopId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (supplierId) where.supplierId = supplierId;
  if (status) {
    if (status === 'low') where.quantity = { lte: prisma.product.fields.lowStockThreshold, gt: 0 };
    if (status === 'out') where.quantity = 0;
    if (status === 'in_stock') where.quantity = { gt: 0 };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'name_asc':
        return { name: 'asc' };
      case 'name_desc':
        return { name: 'desc' };
      case 'price_asc':
        return { sellingPrice: 'asc' };
      case 'price_desc':
        return { sellingPrice: 'desc' };
      case 'quantity_asc':
        return { quantity: 'asc' };
      case 'quantity_desc':
        return { quantity: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  })();

  // Cache the paginated listing (including POS search which reuses this path).
  // Keyed by the fully-normalized query so different filters don't collide.
  // A short TTL keeps real-time inventory reasonably fresh; writes invalidate.
  const cacheKey = keyOf([
    redisConfig.keyPrefix,
    'products',
    'shop',
    shopId,
    'list',
    page,
    limit,
    search?.trim().toLowerCase() || '',
    categoryId || '',
    supplierId || '',
    status || '',
    sort || '',
  ]);

  return cached(cacheKey, 60, async () => {
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true, supplier: true },
      }),
    ]);

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });
}

export async function getProduct(shopId: string, id: string) {
  const cacheKey = keyOf([redisConfig.keyPrefix, 'products', 'shop', shopId, 'detail', id]);
  return cached(cacheKey, 60, async () => {
    const product = await prisma.product.findFirst({
      where: { id, shopId },
      include: {
        category: true,
        supplier: true,
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 30 },
        saleItems: {
          orderBy: { sale: { createdAt: 'desc' } },
          take: 20,
          include: { sale: { select: { receiptNumber: true, createdAt: true, paymentMethod: true } } },
        },
      },
    });
    if (!product) throw new NotFoundError('Product not found');
    return product;
  });
}

async function ensureUnique(shopId: string, data: { sku?: string | null; barcode?: string | null }, excludeId?: string) {
  if (data.sku) {
    const dup = await prisma.product.findFirst({
      where: { shopId, sku: data.sku, id: excludeId ? { not: excludeId } : undefined },
    });
    if (dup) throw new ConflictError('A product with this SKU already exists');
  }
  if (data.barcode) {
    const dup = await prisma.product.findFirst({
      where: { shopId, barcode: data.barcode, id: excludeId ? { not: excludeId } : undefined },
    });
    if (dup) throw new ConflictError('A product with this barcode already exists');
  }
}

export async function createProduct(shopId: string, input: Record<string, unknown>, userId?: string) {
  if (input.categoryId) await verifyCategory(shopId, String(input.categoryId));
  if (input.supplierId) await verifySupplier(shopId, String(input.supplierId));
  if (input.taxRateId) await verifyTaxRate(shopId, String(input.taxRateId));
  await ensureUnique(shopId, { sku: input.sku as string | null, barcode: input.barcode as string | null });

  const quantity = Number(input.quantity ?? 0);
  const slug = await ensureUniqueSlug(shopId, input.name as string);
  const variants = Array.isArray(input.variants) ? (input.variants as Record<string, unknown>[]) : [];
  // When a product ships with variants, stock lives on the variants — the
  // parent starts at 0 and becomes the aggregate of its variants.
  const hasVariants = variants.length > 0;

  const data: Prisma.ProductCreateInput = {
    shop: { connect: { id: shopId } },
    name: input.name as string,
    slug,
    sku: (input.sku as string) || null,
    barcode: (input.barcode as string) || null,
    buyingPrice: input.buyingPrice as Prisma.Decimal.Value,
    sellingPrice: input.sellingPrice as Prisma.Decimal.Value,
    quantity: hasVariants ? 0 : quantity,
    lowStockThreshold: Number(input.lowStockThreshold ?? 5) || 0,
    unit: (input.unit as string) || 'piece',
    imageUrl: (input.imageUrl as string) || null,
    cloudinaryPublicId: (input.cloudinaryPublicId as string) || null,
    description: (input.description as string) || null,
    category: input.categoryId ? { connect: { id: input.categoryId as string } } : undefined,
    supplier: input.supplierId ? { connect: { id: input.supplierId as string } } : undefined,
    taxRate: input.taxRateId ? { connect: { id: input.taxRateId as string } } : undefined,
  };

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data });

    if (hasVariants) {
      for (const v of variants) {
        const selling = round2((v.sellingPrice as Prisma.Decimal.Value) ?? input.sellingPrice);
        const buying = round2((v.buyingPrice as Prisma.Decimal.Value) ?? input.buyingPrice);
        const createdVariant = await tx.productVariant.create({
          data: {
            shopId,
            productId: created.id,
            name: v.name as string,
            sku: (v.sku as string) || null,
            barcode: (v.barcode as string) || null,
            buyingPrice: buying,
            sellingPrice: selling,
            quantity: 0,
            lowStockThreshold: Number(v.lowStockThreshold ?? input.lowStockThreshold ?? 5) || 0,
            imageUrl: (v.imageUrl as string) || null,
          },
        });
        const vqty = Number(v.quantity ?? 0);
        if (vqty > 0) {
          await addStock(tx, created.id, vqty, 'STOCK_IN', {
            shopId,
            variantId: createdVariant.id,
            reason: 'Opening variant stock',
            createdBy: userId ?? null,
          });
        }
      }
    }
    return created;
  });

  // Re-read with variants so the response is complete.
  const created = await prisma.product.findUniqueOrThrow({
    where: { id: product.id },
    include: { variants: { orderBy: { sortOrder: 'asc' } }, taxRate: true },
  });

  await invalidateAfterProductChange(shopId, created.id);
  return created;
}

export async function updateProduct(shopId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.product.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Product not found');

  if (input.categoryId) await verifyCategory(shopId, String(input.categoryId));
  if (input.supplierId) await verifySupplier(shopId, String(input.supplierId));
  await ensureUnique(
    shopId,
    { sku: (input.sku as string | null) ?? existing.sku, barcode: (input.barcode as string | null) ?? existing.barcode },
    id,
  );

  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) {
    data.name = input.name as string;
    data.slug = await ensureUniqueSlug(shopId, input.name as string, id);
  }
  if (input.sku !== undefined) data.sku = (input.sku as string) || null;
  if (input.barcode !== undefined) data.barcode = (input.barcode as string) || null;
  if (input.buyingPrice !== undefined) data.buyingPrice = input.buyingPrice as Prisma.Decimal.Value;
  if (input.sellingPrice !== undefined) data.sellingPrice = input.sellingPrice as Prisma.Decimal.Value;
  if (input.quantity !== undefined) data.quantity = Number(input.quantity) || 0;
  if (input.lowStockThreshold !== undefined) data.lowStockThreshold = Number(input.lowStockThreshold) || 0;
  if (input.unit !== undefined) data.unit = (input.unit as string) || 'piece';
  if (input.imageUrl !== undefined) data.imageUrl = (input.imageUrl as string) || null;
  if (input.cloudinaryPublicId !== undefined) data.cloudinaryPublicId = (input.cloudinaryPublicId as string) || null;
  if (input.description !== undefined) data.description = (input.description as string) || null;
  if (input.categoryId !== undefined) data.category = input.categoryId ? { connect: { id: input.categoryId as string } } : { disconnect: true };
  if (input.supplierId !== undefined) data.supplier = input.supplierId ? { connect: { id: input.supplierId as string } } : { disconnect: true };
  if (input.taxRateId !== undefined) {
    if (input.taxRateId) {
      await verifyTaxRate(shopId, String(input.taxRateId));
      data.taxRate = { connect: { id: input.taxRateId as string } };
    } else {
      data.taxRate = { disconnect: true };
    }
  }

  const result = await prisma.product.update({ where: { id }, data, include: { category: true, supplier: true, taxRate: true } });
  await invalidateAfterProductChange(shopId, id);
  return result;
}

export async function deleteProduct(shopId: string, id: string) {
  const existing = await prisma.product.findFirst({
    where: { id, shopId },
    include: { _count: { select: { saleItems: true, purchaseItems: true } } },
  });
  if (!existing) throw new NotFoundError('Product not found');
  if (existing._count.saleItems > 0 || existing._count.purchaseItems > 0) {
    throw new ConflictError('This product has sales or purchase history. Deactivate it instead of deleting.');
  }
  await prisma.product.delete({ where: { id } });
  await invalidateAfterProductChange(shopId, id);
}

async function verifyCategory(shopId: string, categoryId: string) {
  const cat = await prisma.category.findFirst({ where: { id: categoryId, shopId } });
  if (!cat) throw new NotFoundError('Category not found');
}

async function verifySupplier(shopId: string, supplierId: string) {
  const sup = await prisma.supplier.findFirst({ where: { id: supplierId, shopId } });
  if (!sup) throw new NotFoundError('Supplier not found');
}

async function verifyTaxRate(shopId: string, taxRateId: string) {
  const tax = await prisma.taxRate.findFirst({ where: { id: taxRateId, shopId } });
  if (!tax) throw new NotFoundError('Tax rate not found');
}
