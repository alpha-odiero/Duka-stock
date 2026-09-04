import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

// Returns a shop-scoped entity or throws 404. This is the single choke point
// that guarantees users can never read another shop's data — every lookup
// must include the authenticated shop's id.
export async function getShopScoped<T extends 'product' | 'supplier' | 'category' | 'sale' | 'purchase' | 'expense'>(
  kind: T,
  id: string,
  shopId: string,
) {
  const where = { id, shopId };
  let record: unknown = null;
  switch (kind) {
    case 'product':
      record = await prisma.product.findFirst({ where });
      break;
    case 'supplier':
      record = await prisma.supplier.findFirst({ where });
      break;
    case 'category':
      record = await prisma.category.findFirst({ where });
      break;
    case 'sale':
      record = await prisma.sale.findFirst({ where });
      break;
    case 'purchase':
      record = await prisma.purchase.findFirst({ where });
      break;
    case 'expense':
      record = await prisma.expense.findFirst({ where });
      break;
  }
  if (!record) throw new NotFoundError(`${kind} not found`);
  return record;
}
