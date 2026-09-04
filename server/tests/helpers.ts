import { PrismaClient } from '@prisma/client';

// A dedicated client pointed at the test database (DATABASE_URL is set by the
// vitest config before modules load, so dotenv does not override it).
export const prisma = new PrismaClient();

// Resets all business tables so each suite starts from a clean slate. Order
// matters for referential integrity (children before parents).
export async function resetDb() {
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.cashMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.return.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.register.deleteMany();
  await prisma.storefrontSeo.deleteMany();
  await prisma.storefrontNavItem.deleteMany();
  await prisma.storefrontFaq.deleteMany();
  await prisma.storefrontTestimonial.deleteMany();
  await prisma.storefrontFeature.deleteMany();
  await prisma.storefrontFeatured.deleteMany();
  await prisma.storefrontSection.deleteMany();
  await prisma.storefrontBranding.deleteMany();
  await prisma.storefrontSocial.deleteMany();
  await prisma.storefrontContact.deleteMany();
  await prisma.storefrontAbout.deleteMany();
  await prisma.storefrontHero.deleteMany();
  await prisma.storefront.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
}

export async function disconnect() {
  await prisma.$disconnect();
}
