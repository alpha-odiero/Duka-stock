import { Prisma } from '@prisma/client';
import type { PaymentMethod, SaleSource } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ForbiddenError, InsufficientStockError, NotFoundError, ValidationError } from '../../lib/errors';
import { mul, round2, sub } from '../../utils/money';
import { deductFromBatch, deductStock, deductStockFEFO } from '../../services/inventory.service';

export interface SaleItemInput {
  productId: string;
  quantity: number;
  variantId?: string | null;
  batchId?: string | null;
}

export interface SalePaymentInput {
  method: PaymentMethod;
  amount: number | string;
  reference?: string | null;
}

export interface CreateSaleOptions {
  source?: SaleSource;
  discount?: number | string;
  discountPercent?: number;
  customerId?: string | null;
  paymentReference?: string | null;
  amountPaid?: number | string | null;
  registerId?: string | null;
  // Multiple payment instruments for a single sale (split payments). When
  // provided, each entry produces a Payment child row. The sum must cover the
  // sale total; any excess is returned as change.
  payments?: SalePaymentInput[];
}

// Records a sale and its items inside a single transaction, decrementing stock
// through the centralized inventory service (including variant & FEFO batch
// deduction) and creating payment child rows for split payments. Discounts are
// validated so the total never goes negative. If anything fails the whole sale
// rolls back — no partial sale, stock change, or movement is ever persisted.
export async function createSale(
  shopId: string,
  items: SaleItemInput[],
  paymentMethod: PaymentMethod,
  userId: string | undefined,
  opts: CreateSaleOptions = {},
) {
  const source = opts.source ?? 'POS';
  const discount = round2(opts.discount ?? 0);

  return prisma.$transaction(async (tx) => {
    // The cashier is ALWAYS derived from the authenticated user — never from
    // anything the frontend submits. This guarantees sale.cashierId maps to the
    // staff member who actually performed the transaction.
    let cashierName: string | null = null;
    if (userId) {
      const actor = await tx.user.findUnique({
        where: { id: userId, shopId },
        select: { fullName: true, role: true, status: true },
      });
      if (actor) {
        cashierName = actor.fullName;
        if (actor.status === 'INACTIVE' || actor.status === 'SUSPENDED') {
          throw new ForbiddenError('Your account has been deactivated');
        }
      }
    }

    // Resolve the register the sale was performed on. It must belong to this
    // shop; we snapshot its display name onto the sale for stable reprints.
    let registerName: string | null = null;
    if (opts.registerId) {
      const register = await tx.register.findFirst({
        where: { id: opts.registerId, shopId },
      });
      if (!register) throw new ValidationError('Register does not belong to this shop');
      registerName = register.name;
    }

    const saleItems: {
      productId: string;
      variantId: string | null;
      batchId: string | null;
      quantity: number;
      unitPrice: Prisma.Decimal;
      buyingPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      profit: Prisma.Decimal;
    }[] = [];

    for (const item of items) {
      const itemVariantId = item.variantId ?? null;
      const itemBatchId = item.batchId ?? null;

      // Price sources differ by granularity. Variants carry their own prices;
      // a batch inherits the product/variant price. Lock the pricing row so
      // concurrent sales can't oversell.
      if (itemVariantId) {
        const variant = await tx.$queryRaw<
          { id: string; quantity: number; sellingPrice: string; buyingPrice: string; productId: string }[]
        >`SELECT id, quantity, "sellingPrice", "buyingPrice", "productId" FROM "ProductVariant" WHERE id = ${itemVariantId} AND "shopId" = ${shopId} FOR UPDATE`;

        if (variant.length === 0) throw new NotFoundError(`Variant ${itemVariantId} not found`);
        const row = variant[0];

        if (itemBatchId) {
          // Validate the batch belongs to this variant and has enough stock.
          const batch = await tx.batch.findFirst({
            where: { id: itemBatchId, shopId, productId: row.productId, variantId: itemVariantId },
            select: { id: true, quantityRemaining: true, batchNumber: true },
          });
          if (!batch) throw new NotFoundError('Batch not found for this variant');
          if (item.quantity > batch.quantityRemaining) {
            throw new InsufficientStockError(batch.quantityRemaining, item.quantity, `batch ${batch.batchNumber}`);
          }
        }

        if (item.quantity > row.quantity) {
          throw new InsufficientStockError(row.quantity, item.quantity, 'variant');
        }

        const sellingPrice = round2(row.sellingPrice);
        const buyingPrice = round2(row.buyingPrice);
        const subtotalLine = mul(sellingPrice, item.quantity);
        saleItems.push({
          productId: row.productId,
          variantId: itemVariantId,
          batchId: itemBatchId,
          quantity: item.quantity,
          unitPrice: sellingPrice,
          buyingPrice,
          subtotal: subtotalLine,
          profit: sub(subtotalLine, mul(buyingPrice, item.quantity)),
        });
        continue;
      }

      // Plain product (no variant). Optionally FEFO from batches if tracked.
      const product = await tx.$queryRaw<
        { id: string; quantity: number; sellingPrice: string; buyingPrice: string; name: string }[]
      >`SELECT id, quantity, "sellingPrice", "buyingPrice", name FROM "Product" WHERE id = ${item.productId} AND "shopId" = ${shopId} FOR UPDATE`;

      if (product.length === 0) throw new NotFoundError(`Product ${item.productId} not found`);
      const row = product[0];

      if (itemBatchId) {
        const batch = await tx.batch.findFirst({
          where: { id: itemBatchId, shopId, productId: item.productId },
          select: { id: true, quantityRemaining: true, batchNumber: true },
        });
        if (!batch) throw new NotFoundError('Batch not found');
        if (item.quantity > batch.quantityRemaining) {
          throw new InsufficientStockError(batch.quantityRemaining, item.quantity, `batch ${batch.batchNumber}`);
        }
      }

      if (item.quantity > row.quantity) {
        throw new InsufficientStockError(row.quantity, item.quantity, row.name);
      }

      const sellingPrice = round2(row.sellingPrice);
      const buyingPrice = round2(row.buyingPrice);
      const subtotalLine = mul(sellingPrice, item.quantity);
      saleItems.push({
        productId: item.productId,
        variantId: null,
        batchId: itemBatchId,
        quantity: item.quantity,
        unitPrice: sellingPrice,
        buyingPrice,
        subtotal: subtotalLine,
        profit: sub(subtotalLine, mul(buyingPrice, item.quantity)),
      });
    }

    const subtotal = saleItems.reduce((acc, it) => acc.add(it.subtotal), round2(0)).toDecimalPlaces(2);

    // Resolve the actual discount amount: either an explicit fixed discount or
    // a percentage applied to the subtotal.
    let finalDiscount = discount;
    if (opts.discountPercent) {
      finalDiscount = subtotal.mul(opts.discountPercent).div(100).toDecimalPlaces(2);
    }

    // Discount must not exceed subtotal — never allow a negative total.
    if (finalDiscount.greaterThan(subtotal)) {
      throw new ValidationError('Discount cannot exceed the subtotal');
    }

    const totalAmount = subtotal.sub(finalDiscount).toDecimalPlaces(2);

    // Resolve the payments covering this sale.
    const paidEntries = opts.payments && opts.payments.length > 0 ? opts.payments : null;

    let tendered: Prisma.Decimal;
    let changeDue: Prisma.Decimal | null = null;
    let saleMethod: PaymentMethod;
    const paymentRows: { method: PaymentMethod; amount: Prisma.Decimal; reference: string | null }[] = [];

    if (paidEntries) {
      // Split / explicit payments: each entry is a Payment row. Sum them up.
      let running = round2(0);
      for (const p of paidEntries) {
        const amt = round2(p.amount);
        if (amt.lessThanOrEqualTo(0)) throw new ValidationError('Payment amount must be positive');
        running = running.add(amt);
        paymentRows.push({ method: p.method, amount: amt, reference: p.reference?.trim() || null });
      }
      tendered = running.toDecimalPlaces(2);
      saleMethod = paidEntries.reduce<PaymentMethod>((best, p) => (p.method === 'CASH' ? 'CASH' : best), paidEntries[0].method);

      if (tendered.lessThan(totalAmount)) {
        throw new ValidationError('Total payments must cover the sale amount');
      }
      const splitDiff = tendered.sub(totalAmount).toDecimalPlaces(2);
      changeDue = splitDiff.greaterThan(0) ? splitDiff : null;
    } else {
      // Legacy single-payment path: derive a single Payment row.
      const amountPaid = opts.amountPaid ?? totalAmount;
      const amt = round2(amountPaid);
      if (amt.lessThan(totalAmount)) {
        throw new ValidationError('Amount paid must cover the sale amount');
      }
      saleMethod = paymentMethod;
      const paid = amt.greaterThan(totalAmount) ? amt : totalAmount;
      tendered = paid;
      if (paid.greaterThan(totalAmount)) {
        changeDue = paid.sub(totalAmount).toDecimalPlaces(2);
      } else {
        changeDue = null;
      }
      paymentRows.push({
        method: saleMethod,
        amount: opts.amountPaid !== null && opts.amountPaid !== undefined ? amt : totalAmount,
        reference: opts.paymentReference?.trim() || null,
      });
    }

    let receiptNumber!: string;
    let sale!: { id: string };
    for (let attempt = 0; attempt < 3; attempt++) {
      const lastSale = await tx.sale.findFirst({
        orderBy: { receiptNumber: 'desc' },
        select: { receiptNumber: true },
      });
      const lastNum = lastSale ? parseInt(lastSale.receiptNumber.replace('DS-', ''), 10) : 0;
      receiptNumber = `DS-${String(lastNum + 1).padStart(6, '0')}`;

      try {
        sale = await tx.sale.create({
          data: {
            shopId,
            receiptNumber,
            source,
            subtotal,
            discount: finalDiscount,
            totalAmount,
            paymentMethod: saleMethod,
            paymentStatus: 'PAID',
            paymentReference: opts.paymentReference?.trim() || null,
            amountPaid: tendered,
            changeDue,
            cashierId: userId ?? null,
            registerId: opts.registerId ?? null,
            registerName,
            customerId: opts.customerId ?? null,
            createdBy: cashierName ?? userId ?? null,
            createdById: userId ?? null,
            items: {
              create: saleItems.map((it) => ({
                productId: it.productId,
                variantId: it.variantId,
                batchId: it.batchId,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                buyingPrice: it.buyingPrice,
                subtotal: it.subtotal,
                profit: it.profit,
              })),
            },
            payments: {
              create: paymentRows.map((p) => ({
                shopId,
                paymentMethod: p.method,
                amount: p.amount,
                reference: p.reference,
                status: 'PAID',
                registerId: opts.registerId ?? null,
                createdById: userId ?? null,
              })),
            },
          },
        });
        break;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          if (attempt === 2) throw error;
          continue;
        }
        throw error;
      }
    }

    // Decrement stock and record a movement for each item via the centralized
    // inventory service (FEFO batch / variant aware).
    const productUpdates: { id: string; name: string; newQty: number; threshold: number }[] = [];
    for (const it of saleItems) {
      let updated: Awaited<ReturnType<typeof deductStock> | ReturnType<typeof deductFromBatch> | ReturnType<typeof deductStockFEFO>> | null = null;
      const meta = {
        reason: `Sale ${receiptNumber}`,
        referenceId: sale.id,
        referenceType: 'Sale',
        createdBy: userId ?? null,
      };

      if (it.batchId) {
        updated = await deductFromBatch(tx, shopId, it.productId, it.batchId, it.quantity, source === 'ONLINE' ? 'ONLINE_ORDER' : 'POS_SALE', meta);
      } else if (it.variantId) {
        updated = await deductStock(tx, shopId, it.productId, it.quantity, source === 'ONLINE' ? 'ONLINE_ORDER' : 'POS_SALE', {
          ...meta,
          variantId: it.variantId,
        });
      } else if (source === 'ONLINE') {
        updated = await deductStock(tx, shopId, it.productId, it.quantity, 'ONLINE_ORDER', meta);
      } else {
        // Try FEFO batches first; falls back to plain product deduction.
        updated = await deductStockFEFO(tx, shopId, it.productId, it.quantity, 'POS_SALE', meta);
      }

      if (updated && updated.kind === 'product') {
        productUpdates.push({ id: updated.id, name: updated.name, newQty: updated.quantity, threshold: updated.lowStockThreshold });
      }
    }

    const fullSale = await tx.sale.findUniqueOrThrow({
      where: { id: sale.id },
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: true,
        payments: true,
      },
    });

    return { sale: fullSale, productUpdates };
  });
}

export function generateReceiptNumber(count: number) {
  return `DS-${String(count + 1).padStart(6, '0')}`;
}

// NOTE: notifications are sent after commit, from the route, to avoid writing
// inside the hot transaction.

export async function listSales(shopId: string, query: {
  page: number;
  limit: number;
  paymentMethod?: PaymentMethod;
  source?: SaleSource;
  from?: string;
  to?: string;
  period?: 'today' | 'yesterday' | 'week' | 'month' | 'all';
}) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.SaleWhereInput = { shopId };

  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
  if (query.source) where.source = query.source;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let from: Date | undefined;
  let to: Date | undefined;

  if (query.period === 'today') {
    from = startOfToday;
  } else if (query.period === 'yesterday') {
    const y = new Date(startOfToday);
    y.setDate(y.getDate() - 1);
    from = y;
    to = startOfToday;
  } else if (query.period === 'week') {
    from = new Date(startOfToday);
    from.setDate(from.getDate() - 7);
  } else if (query.period === 'month') {
    from = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  }

  if (query.from) from = new Date(query.from);
  if (query.to) {
    to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
  }

  if (from) where.createdAt = { ...(where.createdAt as object), gte: from };
  if (to) where.createdAt = { ...(where.createdAt as object), lte: to };

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: true,
      },
    }),
  ]);

  return { sales, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getSale(shopId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, shopId },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      customer: true,
      cashier: { select: { id: true, fullName: true } },
      register: { select: { id: true, name: true } },
      shop: {
        select: {
          name: true,
          description: true,
          address: true,
          city: true,
          country: true,
          location: true,
          phone: true,
          email: true,
          businessPin: true,
          website: true,
          logo: true,
          currency: true,
          timezone: true,
          registerName: true,
          receiptFooter: true,
        },
      },
    },
  });
  if (!sale) throw new NotFoundError('Sale not found');

  // The cashier is the authenticated staff member who performed the sale,
  // resolved via sale.cashierId -> User. Because staff are only soft-deleted
  // (status = INACTIVE), this name stays correct for historical sales even
  // after the account is deactivated.
  const cashier = sale.cashier?.fullName ?? sale.createdBy ?? null;
  const registerName = sale.registerName ?? sale.register?.name ?? null;

  return { ...sale, cashier, registerName };
}
