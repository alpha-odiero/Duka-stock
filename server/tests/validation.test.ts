import { describe, expect, it } from 'vitest';
import { registerSchema, loginSchema, productCreateSchema } from '../src/modules/products/products.schema';
import { createSaleSchema } from '../src/modules/sales/sales.schema';
import { expenseCreateSchema } from '../src/modules/expenses/expenses.schema';
import { stockInSchema, stockOutSchema } from '../src/modules/stock/stock.schema';

// Re-export schemas that are not otherwise accessible via the products module
// alias to keep the test readable.
import * as authSchema from '../src/modules/auth/auth.schema';

describe('schema validation', () => {
  describe('auth register', () => {
    it('accepts a valid registration', () => {
      const r = authSchema.registerSchema.safeParse({
        fullName: 'Jane Wanjiku',
        email: 'jane@example.com',
        phone: '+254712345678',
        password: 'StrongPass1',
        shopName: 'Corner Shop',
        shopLocation: 'Nairobi',
      });
      expect(r.success).toBe(true);
    });

    it('rejects a short password', () => {
      const r = authSchema.registerSchema.safeParse({
        fullName: 'Jane',
        email: 'jane@example.com',
        password: 'short',
        shopName: 'Corner Shop',
      });
      expect(r.success).toBe(false);
    });

    it('rejects an invalid email', () => {
      const r = authSchema.registerSchema.safeParse({
        fullName: 'Jane',
        email: 'not-an-email',
        password: 'StrongPass1',
        shopName: 'Corner Shop',
      });
      expect(r.success).toBe(false);
    });
  });

  it('rejects a sale without items', () => {
    const r = createSaleSchema.safeParse({ items: [], paymentMethod: 'CASH' });
    expect(r.success).toBe(false);
  });

  it('rejects a sale item with negative quantity', () => {
    const r = createSaleSchema.safeParse({
      items: [{ productId: '00000000-0000-4000-8000-000000000000', quantity: -2 }],
    });
    expect(r.success).toBe(false);
  });

  it('accepts a valid sale', () => {
    const r = createSaleSchema.safeParse({
      items: [{ productId: '00000000-0000-4000-8000-000000000000', quantity: 3 }],
      paymentMethod: 'MPESA',
    });
    expect(r.success).toBe(true);
  });

  it('rejects an expense with zero amount', () => {
    const r = expenseCreateSchema.safeParse({
      category: 'RENT',
      description: 'Monthly rent',
      amount: 0,
    });
    expect(r.success).toBe(false);
  });

  it('accepts a valid expense', () => {
    const r = expenseCreateSchema.safeParse({
      category: 'TRANSPORT',
      description: 'Delivery',
      amount: '300',
    });
    expect(r.success).toBe(true);
  });

  it('rejects negative stock out quantity', () => {
    const r = stockOutSchema.safeParse({ quantity: -5, type: 'DAMAGE' });
    expect(r.success).toBe(false);
  });

  it('rejects non-integer stock in quantity', () => {
    const r = stockInSchema.safeParse({ quantity: 2.5 });
    expect(r.success).toBe(false);
  });

  it('rejects negative product prices', () => {
    const r = productCreateSchema.safeParse({
      name: 'Milk',
      buyingPrice: -1,
      sellingPrice: -2,
    });
    expect(r.success).toBe(false);
  });
});
