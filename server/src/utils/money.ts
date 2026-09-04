import { Prisma } from '@prisma/client';

type DecimalValue = Prisma.Decimal.Value | number | string;

// Round a money value to 2 decimal places using Exact Decimal arithmetic.
export function round2(value: DecimalValue): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(2);
}

export function mul(a: DecimalValue, b: DecimalValue): Prisma.Decimal {
  return round2(new Prisma.Decimal(a).mul(new Prisma.Decimal(b)));
}

export function add(...values: DecimalValue[]): Prisma.Decimal {
  let acc: Prisma.Decimal = new Prisma.Decimal(0);
  for (const v of values) acc = acc.add(new Prisma.Decimal(v));
  return acc.toDecimalPlaces(2);
}

export function sub(a: DecimalValue, b: DecimalValue): Prisma.Decimal {
  return new Prisma.Decimal(a).sub(new Prisma.Decimal(b)).toDecimalPlaces(2);
}
