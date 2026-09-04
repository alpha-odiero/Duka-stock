import { prisma } from '../../lib/prisma';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { round2 } from '../../utils/money';

export async function listTaxRates(shopId: string, includeInactive = false) {
  return prisma.taxRate.findMany({
    where: { shopId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

export async function getTaxRate(shopId: string, id: string) {
  const tax = await prisma.taxRate.findFirst({ where: { id, shopId } });
  if (!tax) throw new NotFoundError('Tax rate not found');
  return tax;
}

// Seeds a sensible default tax rate for a new shop (called at shop creation).
export async function seedDefaultTaxRate(shopId: string) {
  const existing = await prisma.taxRate.findFirst({ where: { shopId } });
  if (existing) return existing;
  return prisma.taxRate.create({
    data: {
      shopId,
      name: 'VAT (Zero-rated)',
      rate: 0,
      type: 'INCLUSIVE',
      category: 'ZERO_RATED',
      isActive: true,
      isDefault: true,
    },
  });
}

export async function createTaxRate(
  shopId: string,
  input: {
    name: string;
    rate: number | string;
    type: 'INCLUSIVE' | 'EXCLUSIVE';
    category: 'TAXABLE' | 'TAX_EXEMPT' | 'ZERO_RATED' | 'STANDARD';
    isActive?: boolean;
    isDefault?: boolean;
  },
) {
  const dup = await prisma.taxRate.findFirst({ where: { shopId, name: input.name } });
  if (dup) throw new ValidationError('A tax rate with this name already exists');

  const tax = await prisma.taxRate.create({
    data: {
      shopId,
      name: input.name,
      rate: round2(input.rate),
      type: input.type,
      category: input.category,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
    },
  });

  // Keep at most one default per shop.
  if (tax.isDefault) {
    await prisma.taxRate.updateMany({ where: { shopId, id: { not: tax.id }, isDefault: true }, data: { isDefault: false } });
  }
  return tax;
}

export async function updateTaxRate(shopId: string, id: string, input: Record<string, unknown>) {
  const existing = await prisma.taxRate.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Tax rate not found');

  if (input.name !== undefined) {
    const dup = await prisma.taxRate.findFirst({ where: { shopId, name: input.name as string, id: { not: id } } });
    if (dup) throw new ValidationError('A tax rate with this name already exists');
  }

  const tax = await prisma.taxRate.update({
    where: { id },
    data: {
      name: input.name as string | undefined,
      rate: input.rate !== undefined ? round2(input.rate as number | string) : undefined,
      type: input.type as 'INCLUSIVE' | 'EXCLUSIVE' | undefined,
      category: input.category as 'TAXABLE' | 'TAX_EXEMPT' | 'ZERO_RATED' | 'STANDARD' | undefined,
      isActive: input.isActive as boolean | undefined,
      isDefault: input.isDefault as boolean | undefined,
    },
  });

  if (tax.isDefault) {
    await prisma.taxRate.updateMany({ where: { shopId, id: { not: id }, isDefault: true }, data: { isDefault: false } });
  }
  return tax;
}

export async function deleteTaxRate(shopId: string, id: string) {
  const tax = await prisma.taxRate.findFirst({ where: { id, shopId }, include: { _count: { select: { products: true } } } });
  if (!tax) throw new NotFoundError('Tax rate not found');
  if (tax._count.products > 0) {
    throw new ValidationError('This tax rate is assigned to products. Unassign it first.');
  }
  await prisma.taxRate.delete({ where: { id } });
}