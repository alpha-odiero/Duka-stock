import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'product'
  );
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Drinks',
  'Dairy',
  'Bakery',
  'Household',
  'Personal Care',
  'Electronics',
  'Stationery',
  'Hardware',
  'Other',
];

// Development-only data. Never reaches production.
async function main() {
  // Clean slate
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // --- Owner & shop ---
  const passwordHash = await argon2.hash('Duka@12345');
  const owner = await prisma.user.create({
    data: {
      fullName: 'Mama Njeri',
      email: 'mama@dukastock.app',
      phone: '+254712345678',
      passwordHash,
    },
  });

  const shop = await prisma.shop.create({
    data: {
      ownerId: owner.id,
      name: 'Mama Njeri Mini Mart',
      description: 'Neighborhood mini mart serving Nakuru town.',
      phone: '+254712345678',
      email: 'mama@dukastock.app',
      location: 'Nakuru, Kenya',
      currency: 'KES',
    },
  });
  await prisma.user.update({ where: { id: owner.id }, data: { shopId: shop.id } });

  // --- Categories ---
  const categories: Record<string, string> = {};
  for (const name of DEFAULT_CATEGORIES) {
    const cat = await prisma.category.create({ data: { shopId: shop.id, name } });
    categories[name] = cat.id;
  }

  // --- Suppliers ---
  const kenbro = await prisma.supplier.create({
    data: {
      shopId: shop.id,
      name: 'Kenbro Wholesalers',
      phone: '+254722000111',
      email: 'sales@kenbro.co.ke',
      address: 'Nakuru CBD',
      notes: 'Main dry goods supplier.',
    },
  });
  const nakuruFresh = await prisma.supplier.create({
    data: {
      shopId: shop.id,
      name: 'Nakuru Fresh Diary',
      phone: '+254733222333',
      email: 'info@nakurufresh.co.ke',
      address: 'Nakuru West',
    },
  });

  // --- Products (Mama Njeri's stock list) ---
  const productDefs = [
    { name: 'Milk 500ml', cat: 'Dairy', buy: 45, sell: 60, qty: 23, low: 5, unit: 'piece', sku: 'MLK-500' },
    { name: 'Bread 400g', cat: 'Bakery', buy: 55, sell: 70, qty: 2, low: 5, unit: 'loaf', sku: 'BRD-400' },
    { name: 'Sugar 1kg', cat: 'Food', buy: 130, sell: 150, qty: 40, low: 10, unit: 'pack', sku: 'SGR-1' },
    { name: 'Sugar 2kg', cat: 'Food', buy: 255, sell: 290, qty: 4, low: 6, unit: 'pack', sku: 'SGR-2' },
    { name: 'Cooking Oil 1L', cat: 'Food', buy: 320, sell: 360, qty: 18, low: 5, unit: 'bottle', sku: 'OIL-1L' },
    { name: 'Soda 500ml', cat: 'Drinks', buy: 32, sell: 45, qty: 60, low: 12, unit: 'bottle', sku: 'SOD-500' },
    { name: 'Water 500ml', cat: 'Drinks', buy: 15, sell: 25, qty: 0, low: 10, unit: 'bottle', sku: 'WTR-500' },
    { name: 'Bar Soap', cat: 'Household', buy: 42, sell: 55, qty: 30, low: 8, unit: 'piece', sku: 'SOAP-BAR' },
    { name: 'Toothpaste', cat: 'Personal Care', buy: 95, sell: 120, qty: 15, low: 5, unit: 'tube', sku: 'TPT-100' },
    { name: 'Rice 2kg', cat: 'Food', buy: 240, sell: 280, qty: 25, low: 8, unit: 'pack', sku: 'RCE-2' },
  ];

  const products: Record<string, { id: string; buy: number; sell: number }> = {};
  const supplierByProduct: Record<string, string> = {
    'Milk 500ml': nakuruFresh.id,
    'Bread 400g': nakuruFresh.id,
    'Sugar 1kg': kenbro.id,
    'Sugar 2kg': kenbro.id,
    'Cooking Oil 1L': kenbro.id,
  };

  for (const def of productDefs) {
    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: categories[def.cat],
        supplierId: supplierByProduct[def.name] ?? null,
        name: def.name,
        slug: slugify(def.name),
        sku: def.sku,
        buyingPrice: def.buy,
        sellingPrice: def.sell,
        quantity: def.qty,
        lowStockThreshold: def.low,
        unit: def.unit,
      },
    });
    products[def.name] = { id: product.id, buy: def.buy, sell: def.sell };
    if (def.qty > 0) {
      await prisma.stockMovement.create({
        data: { productId: product.id, type: 'STOCK_IN', quantity: def.qty, reason: 'Opening stock' },
      });
    }
  }

  // --- Recent purchases ---
  const purchase = await prisma.purchase.create({
    data: {
      shopId: shop.id,
      supplierId: kenbro.id,
      purchaseDate: new Date(Date.now() - 4 * 86400000),
      totalAmount: 14590,
      notes: 'Weekly top-up',
      createdBy: owner.id,
      items: {
        create: [
          { productId: products['Sugar 1kg'].id, quantity: 20, unitCost: 130, subtotal: 2600 },
          { productId: products['Cooking Oil 1L'].id, quantity: 15, unitCost: 320, subtotal: 4800 },
          { productId: products['Rice 2kg'].id, quantity: 15, unitCost: 240, subtotal: 3600 },
          { productId: products['Soda 500ml'].id, quantity: 40, unitCost: 32, subtotal: 1280 },
          { productId: products['Bar Soap'].id, quantity: 15, unitCost: 42, subtotal: 630 },
          { productId: products['Toothpaste'].id, quantity: 6, unitCost: 95, subtotal: 570 },
        ],
      },
    },
  });
  for (const btn of [
    { productId: products['Sugar 1kg'].id, qty: 20 },
    { productId: products['Cooking Oil 1L'].id, qty: 15 },
    { productId: products['Rice 2kg'].id, qty: 15 },
    { productId: products['Soda 500ml'].id, qty: 40 },
    { productId: products['Bar Soap'].id, qty: 15 },
    { productId: products['Toothpaste'].id, qty: 6 },
  ]) {
    await prisma.stockMovement.create({
      data: {
        productId: btn.productId,
        type: 'PURCHASE',
        quantity: btn.qty,
        reason: `Purchase ${purchase.id}`,
        referenceId: purchase.id,
        createdBy: owner.id,
      },
    });
  }

  // --- A few sales spread over the last week ---
  const paymentMethods = ['CASH', 'MPESA', 'CASH', 'MPESA', 'CASH'] as const;
  const saleSets = [
    [{ name: 'Milk 500ml', qty: 3 }, { name: 'Bread 400g', qty: 1 }, { name: 'Sugar 1kg', qty: 2 }],
    [{ name: 'Soda 500ml', qty: 4 }, { name: 'Cooking Oil 1L', qty: 1 }],
    [{ name: 'Milk 500ml', qty: 5 }, { name: 'Rice 2kg', qty: 2 }],
    [{ name: 'Toothpaste', qty: 2 }, { name: 'Bar Soap', qty: 3 }],
    [{ name: 'Sugar 2kg', qty: 1 }, { name: 'Soda 500ml', qty: 6 }],
  ];

  let saleCount = 0;
  for (let i = 0; i < saleSets.length; i++) {
    const date = new Date(Date.now() - (4 - i) * 86400000);
    date.setHours(11 + i, 20, 0, 0);
    const set = saleSets[i];
    let total = 0;
    const saleItems = set.map((it) => {
      const p = products[it.name];
      const subtotal = p.sell * it.qty;
      total += subtotal;
      return {
        productId: p.id,
        quantity: it.qty,
        unitPrice: p.sell,
        buyingPrice: p.buy,
        subtotal,
        profit: (p.sell - p.buy) * it.qty,
      };
    });
    saleCount += 1;
    const receipt = `DS-${String(saleCount).padStart(6, '0')}`;
    const sale = await prisma.sale.create({
      data: {
        shopId: shop.id,
        receiptNumber: receipt,
        totalAmount: total,
        paymentMethod: paymentMethods[i],
        createdBy: owner.id,
        createdById: owner.id,
        createdAt: date,
        items: { create: saleItems },
      },
    });
    for (const it of saleItems) {
      await prisma.product.update({
        where: { id: it.productId },
        data: { quantity: { decrement: it.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: it.productId,
          type: 'POS_SALE',
          quantity: it.quantity,
          reason: `Sale ${receipt}`,
          referenceId: sale.id,
          createdBy: owner.id,
        },
      });
    }
  }

  // --- Expenses ---
  await prisma.expense.createMany({
    data: [
      { shopId: shop.id, category: 'RENT', description: 'Monthly shop rent', amount: 5000, expenseDate: new Date(Date.now() - 10 * 86400000), createdBy: owner.id },
      { shopId: shop.id, category: 'ELECTRICITY', description: 'Power bill', amount: 800, expenseDate: new Date(Date.now() - 6 * 86400000), createdBy: owner.id },
      { shopId: shop.id, category: 'TRANSPORT', description: 'Delivery to shop', amount: 300, expenseDate: new Date(Date.now() - 2 * 86400000), createdBy: owner.id },
    ],
  });

  // --- Notifications for low/out of stock ---
  await prisma.notification.createMany({
    data: [
      { shopId: shop.id, title: 'Out of stock', message: 'Water 500ml is out of stock.', type: 'out_of_stock' },
      { shopId: shop.id, title: 'Low stock', message: 'Bread 400g is running low. Only 2 remaining (threshold 5).', type: 'low_stock' },
      { shopId: shop.id, title: 'Low stock', message: 'Sugar 2kg is running low. Only 4 remaining (threshold 6).', type: 'low_stock' },
    ],
  });

  // --- Audit trail ---
  await prisma.auditLog.createMany({
    data: [
      { shopId: shop.id, userId: owner.id, action: 'USER_REGISTERED', entityType: 'User', entityId: owner.id, metadata: { seed: true } },
      { shopId: shop.id, userId: owner.id, action: 'SALE_CREATED', entityType: 'Sale', metadata: { seed: true } },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Seeded Mama Njeri Mini Mart');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
