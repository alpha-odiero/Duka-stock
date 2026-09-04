import { prisma } from '../lib/prisma';

// Creates a shop notification. Used for low-stock and warning alerts.
export async function createNotification(opts: {
  shopId: string;
  title: string;
  message: string;
  type?: string;
}) {
  return prisma.notification.create({
    data: {
      shopId: opts.shopId,
      title: opts.title,
      message: opts.message,
      type: opts.type ?? 'info',
    },
  });
}

// When a product's stock falls to/below its threshold, generate a notification
// so the shop owner can act. Avoids duplicate alerts for the same product by
// checking for an existing unread notification of the same type for it.
export async function notifyStockLevel(shopId: string, productName: string, productId: string, quantity: number, threshold: number) {
  const type = quantity === 0 ? 'out_of_stock' : 'low_stock';
  try {
    const existing = await prisma.notification.findFirst({
      where: {
        shopId,
        type,
        message: { contains: productName },
        read: false,
      },
    });
    if (existing) return;

    const title = quantity === 0 ? 'Out of stock' : 'Low stock';
    const message =
      quantity === 0
        ? `${productName} is out of stock.`
        : `${productName} is running low. Only ${quantity} remaining (threshold ${threshold}).`;
    await createNotification({ shopId, title, message, type });
  } catch {
    // Notification creation must never break the core operation.
  }
}
