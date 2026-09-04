import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, resetDb, disconnect } from './helpers';

const app = createApp();
const BASE = '/api/v1';

async function registerUser(agent: ReturnType<typeof request.agent>, email: string, shopName: string) {
  const res = await agent.post(`${BASE}/auth/register`).send({
    fullName: 'Test Owner',
    email,
    phone: '+25472222222',
    password: 'StrongPass1',
    shopName,
    shopLocation: 'Nairobi',
  });
  expect(res.status).toBe(201);
  return res.body.data.user;
}

async function createProduct(agent: ReturnType<typeof request.agent>, body: Record<string, unknown>) {
  const res = await agent.post(`${BASE}/products`).send(body);
  expect(res.status).toBe(201);
  return res.body.data.product;
}

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await disconnect();
});

describe('split payments', () => {
  it('records one Payment row per method and computes change due', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `split-${Date.now()}@test.app`, 'Split Mart');

    const product = await createProduct(agent, {
      name: 'Chai 250ml',
      buyingPrice: 40,
      sellingPrice: 72,
      quantity: 10,
    });

    // Exact split: 200 cash + 88 M-Pesa = 288 = 4 x 72.
    const exact = await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, quantity: 4 }],
      payments: [
        { method: 'CASH', amount: 200 },
        { method: 'MPESA', amount: 88, reference: 'TEST-REF-1' },
      ],
    });
    expect(exact.status).toBe(201);
    expect(Number(exact.body.data.sale.totalAmount)).toBe(288);
    expect(exact.body.data.sale.paymentMethod).toBe('CASH');
    expect(exact.body.data.sale.changeDue).toBe(null);
    expect(exact.body.data.sale.payments).toHaveLength(2);
    const methods = exact.body.data.sale.payments.map((p: { paymentMethod: string }) => p.paymentMethod);
    expect(methods).toEqual(expect.arrayContaining(['CASH', 'MPESA']));

    // Excess tendered is returned as change.
    const excess = await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, quantity: 1 }],
      payments: [{ method: 'CASH', amount: 100 }],
    });
    expect(excess.status).toBe(201);
    expect(Number(excess.body.data.sale.changeDue)).toBe(28);
  });
});

describe('product variants', () => {
  it('sells from a variant and keeps the parent aggregate in sync', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `variant-${Date.now()}@test.app`, 'Variant Mart');

    const product = await createProduct(agent, {
      name: 'Oil 1L',
      buyingPrice: 120,
      sellingPrice: 200,
      unit: 'bottle',
      variants: [
        { name: 'Small', sellingPrice: 150, buyingPrice: 100, quantity: 5 },
        { name: 'Large', sellingPrice: 260, buyingPrice: 180, quantity: 3 },
      ],
    });

    const large = product.variants.find((v: { name: string }) => v.name === 'Large');
    expect(large).toBeDefined();
    expect(Number(product.quantity)).toBe(8);

    const saleRes = await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, variantId: large.id, quantity: 2 }],
      paymentMethod: 'CASH',
      amountPaid: 600,
    });
    expect(saleRes.status).toBe(201);
    expect(Number(saleRes.body.data.sale.totalAmount)).toBe(520); // 2 x 260
    expect(Number(saleRes.body.data.sale.changeDue)).toBe(80);

    const after = await agent.get(`${BASE}/products/${product.id}`);
    expect(after.body.data.product.quantity).toBe(6);

    const vRes = await agent.get(`${BASE}/variants/${large.id}`);
    expect(vRes.status).toBe(200);
    expect(Number(vRes.body.data.variant.quantity)).toBe(1);
  });
});

describe('batches (expiry / FEFO)', () => {
  it('creates batches on purchase and consumes oldest-expiry first', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `batch-${Date.now()}@test.app`, 'Batch Mart');

    const product = await createProduct(agent, {
      name: 'Med 500mg',
      buyingPrice: 30,
      sellingPrice: 60,
      quantity: 0,
    });

    // Receipt with two dated batches of the same product.
    const purchaseRes = await agent.post(`${BASE}/purchases`).send({
      items: [
        { productId: product.id, quantity: 5, unitCost: 30, batchNumber: 'BATCH-A', expiryDate: '2026-10-01T00:00:00.000Z' },
        { productId: product.id, quantity: 6, unitCost: 30, batchNumber: 'BATCH-B', expiryDate: '2027-01-01T00:00:00.000Z' },
      ],
    });
    expect(purchaseRes.status).toBe(201);
    expect(Number(purchaseRes.body.data.purchase.totalAmount)).toBe(330);

    const listRes = await agent.get(`${BASE}/batches?page=1&limit=10`);
    expect(listRes.body.data.batches).toHaveLength(2);

    const items = purchaseRes.body.data.purchase.items;
    const batchAId = items.find((i: { batch: { batchNumber: string } }) => i.batch?.batchNumber === 'BATCH-A').batch.id;
    const batchBId = items.find((i: { batch: { batchNumber: string } }) => i.batch?.batchNumber === 'BATCH-B').batch.id;

    // Product aggregate reflects both batches.
    const stockRes = await agent.get(`${BASE}/products/${product.id}`);
    expect(Number(stockRes.body.data.product.quantity)).toBe(11);

    // Sell 5 without picking a batch -> FEFO drains BATCH-A (earliest expiry).
    const saleRes = await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, quantity: 5 }],
      paymentMethod: 'CASH',
      amountPaid: 300,
    });
    expect(saleRes.status).toBe(201);

    const batchA = await agent.get(`${BASE}/batches/${batchAId}`);
    expect(Number(batchA.body.data.batch.quantityRemaining)).toBe(0);
    const batchB = await agent.get(`${BASE}/batches/${batchBId}`);
    expect(Number(batchB.body.data.batch.quantityRemaining)).toBe(6);

    const after1 = await agent.get(`${BASE}/products/${product.id}`);
    expect(Number(after1.body.data.product.quantity)).toBe(6);

    // Sell 2 more -> FEFO now draws from BATCH-B.
    await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, quantity: 2 }],
      paymentMethod: 'CASH',
      amountPaid: 200,
    });
    const batchB2 = await agent.get(`${BASE}/batches/${batchBId}`);
    expect(Number(batchB2.body.data.batch.quantityRemaining)).toBe(4);
  });
});

describe('returns & refunds', () => {
  it('auto-approves, restocks, and settles a completed refund for the owner', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `ret-${Date.now()}@test.app`, 'Return Mart');

    const product = await createProduct(agent, {
      name: 'Sugar 1kg',
      buyingPrice: 90,
      sellingPrice: 120,
      quantity: 10,
    });

    const saleRes = await agent.post(`${BASE}/sales`).send({
      items: [{ productId: product.id, quantity: 4 }],
      paymentMethod: 'CASH',
      amountPaid: 480,
    });
    const sale = saleRes.body.data.sale;
    const saleItemId = sale.items[0].id;

    const retRes = await agent.post(`${BASE}/returns`).send({
      saleId: sale.id,
      items: [{ saleItemId, quantity: 1, condition: 'GOOD' }],
      refundMethod: 'CASH',
    });
    expect(retRes.status).toBe(201);
    expect(retRes.body.data.requiresApproval).toBe(false);
    expect(retRes.body.data.return.status).toBe('COMPLETED');
    expect(Number(retRes.body.data.return.refunds[0].amount)).toBe(120);

    // Product restocked to 7 (6 sold-out stock + 1 returned).
    const stock = await agent.get(`${BASE}/products/${product.id}`);
    expect(Number(stock.body.data.product.quantity)).toBe(7);

    // Sale marked partially refunded.
    const sale2 = await agent.get(`${BASE}/sales/${sale.id}`);
    expect(sale2.body.data.sale.paymentStatus).toBe('PARTIALLY_REFUNDED');

    // Return + refund ledger both show the entry.
    const returns = await agent.get(`${BASE}/returns?page=1&limit=10`);
    expect(returns.body.data.returns).toHaveLength(1);
    const refunds = await agent.get(`${BASE}/returns/refunds?page=1&limit=10`);
    expect(refunds.body.data.refunds[0].status).toBe('COMPLETED');
  });
});

describe('taxes', () => {
  it('seeds a default rate and supports CRUD + switching default', async () => {
    const agent = request.agent(app);
    await registerUser(agent, `tax-${Date.now()}@test.app`, 'Tax Mart');

    const seeder = await agent.get(`${BASE}/taxes`);
    expect(seeder.body.data.taxes).toHaveLength(1);
    expect(seeder.body.data.taxes[0].isDefault).toBe(true);
    expect(Number(seeder.body.data.taxes[0].rate)).toBe(0);

    const created = await agent.post(`${BASE}/taxes`).send({
      name: 'VAT 16%',
      rate: 16,
      type: 'EXCLUSIVE',
      category: 'TAXABLE',
    });
    expect(created.status).toBe(201);
    expect(created.body.data.tax.name).toBe('VAT 16%');

    // Promote to default -> previous default must be cleared.
    const promoted = await agent.patch(`${BASE}/taxes/${created.body.data.tax.id}`).send({ isDefault: true });
    expect(promoted.status).toBe(200);
    const list = await agent.get(`${BASE}/taxes`);
    const defaults = list.body.data.taxes.filter((t: { isDefault: boolean }) => t.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].name).toBe('VAT 16%');

    const deleted = await agent.delete(`${BASE}/taxes/${created.body.data.tax.id}`);
    expect(deleted.status).toBe(200);
  });
});