import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { add, mul, round2, sub } from '../src/utils/money';

// Critical financial precision: KES cents must never suffer float errors.
describe('money utility (decimal arithmetic)', () => {
  it('rounds to 2 decimal places', () => {
    const v = round2('10.005');
    expect(v.toNumber()).toBe(10.01);
  });

  it('adds money without float drift', () => {
    const sum = add('0.10', '0.20');
    expect(sum.toNumber()).toBe(0.3);
    expect(sum.toString()).toBe('0.3');
  });

  it('multiplication of price x quantity is exact', () => {
    const total = mul('45.55', 3);
    expect(total.toNumber()).toBe(136.65);
  });

  it('subtracts money exactly', () => {
    const diff = sub('100.00', '33.33');
    expect(diff.toNumber()).toBe(66.67);
  });

  it('supports chained reduce over many items', () => {
    const prices = ['12.34', '56.78', '90.01', '7.77'];
    const total = prices.reduce((acc, p) => acc.add(new Prisma.Decimal(p)), new Prisma.Decimal(0));
    expect(total.toNumber()).toBeCloseTo(166.9, 2);
  });
});
