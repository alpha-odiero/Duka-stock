import { Prisma } from '@prisma/client';
import type { PaymentMethod, SaleSource, OrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { InsufficientStockError, NotFoundError, ValidationError } from '../../lib/errors';
import { mul, round2, sub } from '../../utils/money';
import { deductStock } from '../../services/inventory.service';
import { createNotification } from '../../utils/notifications';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderOptions {
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  source: SaleSource;
  discount?: number | string;
  discountPercent?: number;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  customerId?: string | null;
  deliveryAddress?: string;
  notes?: string;
  createdBy?: string | null;
}

// Looks up an existing customer by phone (or id) within the shop, otherwise
// creates a lightweight customer record so the order links to it.
export async function resolveCustomer(
  tx: Prisma.TransactionClient,
  shopId: string,
  opts: CreateOrderOptions,
): Promise<string | null> {
  if (opts.customerId) {
    const exists = await tx.customer.findFirst({ where: { id: opts.customerId, shopId }, select: { id: true } });
    if (exists) return exists.id;
  }
  const phone = opts.customer?.phone?.trim();
  if (!phone) return opts.customerId ?? null;
  const byPhone = await tx.customer.findFirst({ where: { shopId, phone }, select: { id: true } });
  if (byPhone) return byPhone.id;
  const created = await tx.customer.create({
    data: {
      shopId,
      name: opts.customer?.name?.trim() || (opts.customer?.phone ? `Customer ${opts.customer.phone}` : 'Walk-in Customer'),
      phone: phone || null,
      email: opts.customer?.email?.trim() || null,
      address: opts.customer?.address?.trim() || null,
    },
    select: { id: true },
  });
  return created.id;
}

// Creates an order (online storefront or POS-entered) with full inventory
// integration: it validates prices/quants, deducts stock via the centralized
// inventory service, records movements, and links a customer — all atomically.
// Online orders also fire a notification so the owner sees NEW ONLINE ORDER.
export async function createOrder(shopId: string, opts: CreateOrderOptions) {
  const source = opts.source ?? 'ONLINE';
  const discount = round2(opts.discount ?? 0);

  const result = await prisma.$transaction(async (tx) => {
    const orderItems: {
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      buyingPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      profit: Prisma.Decimal;
    }[] = [];

    for (const item of opts.items) {
      const product = await tx.$queryRaw<
        { id: string; quantity: number; sellingPrice: string; buyingPrice: string; name: string }[]
      >`SELECT id, quantity, "sellingPrice", "buyingPrice", name FROM "Product" WHERE id = ${item.productId} AND "shopId" = ${shopId} AND "isActive" = true FOR UPDATE`;

      if (product.length === 0) throw new NotFoundError(`Product ${item.productId} not found or unavailable`);

      const row = product[0];
      if (item.quantity > row.quantity) {
        throw new InsufficientStockError(row.quantity, item.quantity, row.name);
      }

      const unitPrice = round2(row.sellingPrice);
      const buyingPrice = round2(row.buyingPrice);
      const subtotal = mul(unitPrice, item.quantity);
      const profit = sub(mul(unitPrice, item.quantity), mul(buyingPrice, item.quantity));

      orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, buyingPrice, subtotal, profit });
    }

    const subtotalAmount = orderItems.reduce((acc, it) => acc.add(it.subtotal), round2(0)).toDecimalPlaces(2);

    let finalDiscount = discount;
    if (opts.discountPercent) {
      finalDiscount = subtotalAmount.mul(opts.discountPercent).div(100).toDecimalPlaces(2);
    }
    if (finalDiscount.greaterThan(subtotalAmount)) {
      throw new ValidationError('Discount cannot exceed the subtotal');
    }

    const totalAmount = subtotalAmount.sub(finalDiscount).toDecimalPlaces(2);

    const customerId = await resolveCustomer(tx, shopId, opts);

    let orderNumber!: string;
    let order!: { id: string };
    for (let attempt = 0; attempt < 3; attempt++) {
      const lastOrder = await tx.order.findFirst({
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const lastNum = lastOrder ? parseInt(lastOrder.orderNumber.replace('ORD-', ''), 10) : 0;
      orderNumber = `ORD-${String(lastNum + 1).padStart(6, '0')}`;

      try {
        order = await tx.order.create({
          data: {
            shopId,
            orderNumber,
            source,
            status: 'PENDING',
            customerId,
            customerName: opts.customer?.name?.trim() || null,
            customerPhone: opts.customer?.phone?.trim() || null,
            customerEmail: opts.customer?.email?.trim() || null,
            deliveryAddress: opts.deliveryAddress?.trim() || opts.customer?.address?.trim() || null,
            notes: opts.notes?.trim() || null,
            subtotal: subtotalAmount,
            discount: finalDiscount,
            totalAmount,
            paymentMethod: opts.paymentMethod,
            createdBy: opts.createdBy ?? null,
            items: {
              create: orderItems.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                buyingPrice: it.buyingPrice,
                subtotal: it.subtotal,
                profit: it.profit,
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

    const productUpdates: { id: string; name: string; newQty: number; threshold: number }[] = [];
    for (const it of orderItems) {
      const updated = await deductStock(tx, shopId, it.productId, it.quantity, source === 'ONLINE' ? 'ONLINE_ORDER' : 'POS_SALE', {
        reason: `Order ${orderNumber}`,
        referenceId: order.id,
        createdBy: opts.createdBy ?? null,
      });
      productUpdates.push({ id: updated!.id, name: updated!.name, newQty: updated!.quantity, threshold: updated!.lowStockThreshold });
    }

    const fullOrder = await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: { include: { product: { select: { name: true, unit: true } } } }, customer: true },
    });

    return { order: fullOrder, productUpdates };
  });

  // Notifications after commit.
  if (source === 'ONLINE') {
    await createNotification({
      shopId,
      title: 'New online order',
      message: `Order ${result.order.orderNumber} · ${result.order.customerName ?? 'Walk-in Customer'} · ${result.order.items.length} item(s)`,
      type: 'order',
    });
  }

  return result;
}

export async function listOrders(shopId: string, query: {
  page: number;
  limit: number;
  status?: OrderStatus;
  source?: SaleSource;
  from?: string;
  to?: string;
  search?: string;
}) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = { shopId };
  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: 'insensitive' } },
      { customerName: { contains: query.search, mode: 'insensitive' } },
      { customerPhone: { contains: query.search, mode: 'insensitive' } },
    ];
  }

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

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true, imageUrl: true, unit: true } } } },
        customer: true,
      },
    }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getOrder(shopId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: { id, shopId },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true, unit: true } } } },
      customer: true,
      shop: { select: { name: true, phone: true, email: true, location: true } },
    },
  });
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

export async function updateOrderStatus(shopId: string, id: string, status: OrderStatus) {
  const existing = await prisma.order.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Order not found');
  return prisma.order.update({ where: { id }, data: { status } });
}
