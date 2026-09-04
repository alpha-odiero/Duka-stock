import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, resetDb, disconnect } from './helpers';

const app = createApp();
const BASE = '/api/v1';

// Creates a user + shop via the real register endpoint and returns the cookie
// jar so subsequent requests authenticate.
async function registerUser(agent: ReturnType<typeof request.agent>, email: string, shopName: string) {
  const res = await agent.post(`${BASE}/auth/register`).send({
    fullName: 'Test Owner',
    email,
    phone: '+254711111111',
    password: 'StrongPass1',
    shopName,
    shopLocation: 'Nairobi',
  });
  expect(res.status).toBe(201);
  return res.body.data.user;
}

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await disconnect();
});

describe('full sale flow', () => {
  it('creates product, adds stock, sells, and tracks movements', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `sale-${Date.now()}@test.app`, 'Sale Mart');

    // create a product with opening stock
    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Milk 500ml',
      sku: 'MLK-TEST',
      buyingPrice: 45,
      sellingPrice: 60,
      quantity: 10,
      lowStockThreshold: 3,
      unit: 'piece',
    });
    expect(prodRes.status).toBe(201);
    const productId = prodRes.body.data.product.id;

    // add more stock
    const addRes = await agent.post(`${BASE}/products/${productId}/stock/in`).send({
      quantity: 5,
      reason: 'Restock',
    });
    expect(addRes.status).toBe(200);
    expect(addRes.body.data.product.quantity).toBe(15);

    // sell 4
    const saleRes = await agent.post(`${BASE}/sales`).send({
      items: [{ productId, quantity: 4 }],
      paymentMethod: 'CASH',
    });
    expect(saleRes.status).toBe(201);
    const sale = saleRes.body.data.sale;
    expect(Number(sale.totalAmount)).toBe(240); // 4 x 60
    expect(saleItemsSum(sale)).toBe(4);

    // stock decreased to 11
    const after = await agent.get(`${BASE}/products/${productId}`);
    expect(after.body.data.product.quantity).toBe(11);

    // a STOCK_IN (opening) and POS_SALE movement exist
    const moves = await agent.get(`${BASE}/products/${productId}/stock/movements`);
    const types = moves.body.data.movements.map((m: { type: string }) => m.type);
    expect(types).toContain('STOCK_IN');
    expect(types).toContain('POS_SALE');
  });

  it('rolls back a sale when stock is insufficient', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `rollback-${Date.now()}@test.app`, 'Rollback Mart');

    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Bread 400g',
      buyingPrice: 55,
      sellingPrice: 70,
      quantity: 2,
      lowStockThreshold: 2,
    });
    const productId = prodRes.body.data.product.id;

    // attempt to sell more than available
    const saleRes = await agent.post(`${BASE}/sales`).send({
      items: [{ productId, quantity: 5 }],
      paymentMethod: 'CASH',
    });
    expect(saleRes.status).toBe(409);
    expect(saleRes.body.error.code).toBe('INSUFFICIENT_STOCK');

    // stock unchanged
    const after = await agent.get(`${BASE}/products/${productId}`);
    expect(after.body.data.product.quantity).toBe(2);

    // no sale record
    const salesRes = await agent.get(`${BASE}/sales`);
    expect(salesRes.body.data.sales.length).toBe(0);

    // no SALE stock movement
    const moves = await agent.get(`${BASE}/products/${productId}/stock/movements`);
    expect(moves.body.data.movements.some((m: { type: string }) => m.type === 'POS_SALE')).toBe(false);
  });
});

describe('shop isolation', () => {
  it('Shop A user cannot access Shop B products or sales', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerUser(agentA, `aiso-${Date.now()}@test.app`, 'Shop A');
    await registerUser(agentB, `biso-${Date.now()}@test.app`, 'Shop B');

    // Shop B creates a product
    const prodB = await agentB.post(`${BASE}/products`).send({
      name: 'Shop B Secret',
      buyingPrice: 10,
      sellingPrice: 20,
      quantity: 5,
    });
    const productBId = prodB.body.data.product.id;

    // Shop A cannot read it
    const read = await agentA.get(`${BASE}/products/${productBId}`);
    expect(read.status).toBe(404);

    // Shop A cannot see it in its own list
    const listA = await agentA.get(`${BASE}/products`);
    expect(listA.body.data.products.some((p: { name: string }) => p.name === 'Shop B Secret')).toBe(false);

    // Shop A cannot modify it
    const patch = await agentA.patch(`${BASE}/products/${productBId}`).send({ name: 'Hacked' });
    expect(patch.status).toBe(404);

    // Shop A cannot add stock to it
    const stock = await agentA.post(`${BASE}/products/${productBId}/stock/in`).send({ quantity: 5 });
    expect(stock.status).toBe(404);

    // Shop B product stock is untouched
    const checkB = await agentB.get(`${BASE}/products/${productBId}`);
    expect(checkB.body.data.product.quantity).toBe(5);
    expect(checkB.body.data.product.name).toBe('Shop B Secret');
  });

  it('Shop A user cannot access Shop B sale by id', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerUser(agentA, `asale-${Date.now()}@test.app`, 'Shop A2');
    await registerUser(agentB, `bsale-${Date.now()}@test.app`, 'Shop B2');

    const prodRes = await agentB.post(`${BASE}/products`).send({
      name: 'Item',
      buyingPrice: 10,
      sellingPrice: 15,
      quantity: 5,
    });
    const productBId = prodRes.body.data.product.id;
    const saleB = await agentB.post(`${BASE}/sales`).send({
      items: [{ productId: productBId, quantity: 1 }],
      paymentMethod: 'MPESA',
    });
    const saleBId = saleB.body.data.sale.id;

    const read = await agentA.get(`${BASE}/sales/${saleBId}`);
    expect(read.status).toBe(404);
  });
});

describe('online storefront & shared inventory', () => {
  it('public store lists products without internal fields and online order shares inventory', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `store-${Date.now()}@test.app`, 'Store Mart');
    const shopName = 'Store Mart';

    // Only one shop exists in this suite after register; the public store
    // resolves it by name.
    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Milk 500ml',
      sku: 'MLK-ONL',
      buyingPrice: 45,
      sellingPrice: 60,
      quantity: 10,
      lowStockThreshold: 3,
      unit: 'piece',
    });
    const productId = prodRes.body.data.product.id;

    // Public catalog (no auth) returns safe fields, no buying price.
    const publicList = await request(app).get(`${BASE}/store/products?shop=${shopName}`).send();
    expect(publicList.status).toBe(200);
    expect(publicList.body.data.products.length).toBe(1);
    const publicProduct = publicList.body.data.products[0];
    expect(publicProduct.name).toBe('Milk 500ml');
    expect(publicProduct.buyingPrice).toBeUndefined();
    expect(typeof publicProduct.quantity).toBe('number');

    // Public product by slug.
    const bySlug = await request(app).get(`${BASE}/store/products/milk-500ml?shop=${shopName}`).send();
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.product.id).toBe(productId);

    // Public checkout: customer places an online order for 4 units.
    const checkout = await request(app)
      .post(`${BASE}/store/checkout?shop=${shopName}`)
      .send({
        items: [{ productId, quantity: 4 }],
        paymentMethod: 'MPESA',
        customer: { name: 'John Kamau', phone: '+254700000001', email: 'john@example.com' },
        deliveryAddress: 'Nakuru 12',
      });
    expect(checkout.status).toBe(201);
    const order = checkout.body.data.order;
    expect(order.source).toBe('ONLINE');
    expect(order.status).toBe('PENDING');
    expect(order.items[0].quantity).toBe(4);

    // Shared inventory: stock went 10 -> 6.
    const after = await agent.get(`${BASE}/products/${productId}`);
    expect(after.body.data.product.quantity).toBe(6);

    // ONLINE_ORDER movement recorded.
    const moves = await agent.get(`${BASE}/products/${productId}/stock/movements`);
    expect(moves.body.data.movements.some((m: { type: string }) => m.type === 'ONLINE_ORDER')).toBe(true);

    // Owner sees the online order in dashboard orders.
    const orders = await agent.get(`${BASE}/orders`);
    expect(orders.status).toBe(200);
    expect(orders.body.data.orders.length).toBe(1);
    expect(orders.body.data.orders[0].customerName).toBe('John Kamau');
  });

  it('rejects an online order that would oversell', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `oversell-${Date.now()}@test.app`, 'Oversell Mart');
    const shopName = 'Oversell Mart';

    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Bread',
      buyingPrice: 55,
      sellingPrice: 70,
      quantity: 2,
      lowStockThreshold: 2,
    });
    const productId = prodRes.body.data.product.id;

    const checkout = await request(app)
      .post(`${BASE}/store/checkout?shop=${shopName}`)
      .send({ items: [{ productId, quantity: 5 }], paymentMethod: 'CASH' });
    expect(checkout.status).toBe(409);
    expect(checkout.body.error.code).toBe('INSUFFICIENT_STOCK');

    // No partial order, stock unchanged, no ORDER / ONLINE_ORDER movement.
    const after = await agent.get(`${BASE}/products/${productId}`);
    expect(after.body.data.product.quantity).toBe(2);
    const orders = await agent.get(`${BASE}/orders`);
    expect(orders.body.data.orders.length).toBe(0);
  });

  it('concurrent purchases never make stock negative', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `concurrent-${Date.now()}@test.app`, 'Concurrent Mart');
    const shopName = 'Concurrent Mart';

    const prodRes = await agent.post(`${BASE}/products`).send({
      name: 'Sugar',
      buyingPrice: 100,
      sellingPrice: 120,
      quantity: 1,
      lowStockThreshold: 1,
    });
    const productId = prodRes.body.data.product.id;

    // Two customers race for the last unit.
    const results = await Promise.allSettled([
      request(app)
        .post(`${BASE}/store/checkout?shop=${shopName}`)
        .send({ items: [{ productId, quantity: 1 }], paymentMethod: 'MPESA', customer: { name: 'A' } }),
      request(app)
        .post(`${BASE}/store/checkout?shop=${shopName}`)
        .send({ items: [{ productId, quantity: 1 }], paymentMethod: 'MPESA', customer: { name: 'B' } }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201).length;
    expect(fulfilled).toBeLessThanOrEqual(1);

    // Stock is never negative.
    const after = await agent.get(`${BASE}/products/${productId}`);
    expect(after.body.data.product.quantity).toBeGreaterThanOrEqual(0);

    // And orders created match successful checkouts.
    const orders = await agent.get(`${BASE}/orders`);
    expect(orders.body.data.orders.length).toBe(fulfilled);
  });
});

function saleItemsSum(sale: { items: { quantity: number }[] }) {
  return sale.items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0);
}
