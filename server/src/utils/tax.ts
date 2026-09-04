import { Prisma } from '@prisma/client';
import type { TaxType } from '@prisma/client';
import { add, mul, round2 } from './money';

type DecimalValue = Prisma.Decimal.Value | number | string;

export interface TaxLine {
  /** Pre-tax amount (base) for the line after tax is stripped/added. */
  baseAmount: Prisma.Decimal;
  /** The tax portion of the line. */
  taxAmount: Prisma.Decimal;
  /** Rate as a percentage, e.g. 16.00 for 16%. */
  rate: Prisma.Decimal;
  /** Whether the given amount already included tax. */
  inclusive: boolean;
}

// Computes the tax split for a single amount at a percentage rate.
//
// INCLUSIVE : the amount already includes tax (common for retail shelf prices).
//             base = amount / (1 + rate/100); tax = amount - base.
// EXCLUSIVE : tax is charged on top of the amount (common for invoices/B2B).
//             base = amount; tax = amount * rate/100.
export function taxForLine(amount: DecimalValue, rate: DecimalValue, type: TaxType): TaxLine {
  const raw = round2(amount);
  const r = new Prisma.Decimal(rate).div(100);

  if (type === 'INCLUSIVE') {
    const multiplier = new Prisma.Decimal(1).add(r);
    const baseAmount = round2(raw.div(multiplier));
    const taxAmount = round2(raw.sub(baseAmount));
    return { baseAmount, taxAmount, rate: new Prisma.Decimal(rate), inclusive: true };
  }

  const baseAmount = raw;
  const taxAmount = mul(raw, r);
  return { baseAmount, taxAmount, rate: new Prisma.Decimal(rate), inclusive: false };
}

// Gross (amount including tax) for an inclusive item: the amount is already gross.
export function grossAmount(line: TaxLine): Prisma.Decimal {
  return add(line.baseAmount, line.taxAmount);
}

// Combine a list of tax lines into cart totals.
export interface CartTotals {
  subtotalExcl: Prisma.Decimal; // sum of base amounts (before tax)
  taxTotal: Prisma.Decimal; // sum of all tax
  total: Prisma.Decimal; // subtotalExcl + taxTotal (gross)
}

export function combineTaxLines(lines: TaxLine[]): CartTotals {
  const subtotalExcl = add(...lines.map((l) => l.baseAmount));
  const taxTotal = add(...lines.map((l) => l.taxAmount));
  return { subtotalExcl, taxTotal, total: add(subtotalExcl, taxTotal) };
}

// Given a line amount, rate, and type, return the gross total (amount payable).
export function totalForLine(amount: DecimalValue, rate: DecimalValue, type: TaxType): Prisma.Decimal {
  const line = taxForLine(amount, rate, type);
  return grossAmount(line);
}

// Round helper for tax line snapshots.
export function taxSnapshot(line: TaxLine) {
  return {
    rate: line.rate.toNumber(),
    taxAmount: line.taxAmount,
    baseAmount: line.baseAmount,
    inclusive: line.inclusive,
  };
}