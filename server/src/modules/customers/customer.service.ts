import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export interface CustomerQuery {
  page: number;
  limit: number;
  search?: string;
}

export async function listCustomers(shopId: string, q: CustomerQuery) {
  const { page, limit, search } = q;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = { shopId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { sales: true, orders: true } } },
    }),
  ]);

  return {
    customers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCustomer(shopId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, shopId },
    include: {
      _count: { select: { sales: true, orders: true } },
      sales: { orderBy: { createdAt: 'desc' }, take: 10 },
      orders: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!customer) throw new NotFoundError('Customer not found');
  return customer;
}

export async function createCustomer(shopId: string, input: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}) {
  return prisma.customer.create({
    data: {
      shopId,
      name: input.name,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function updateCustomer(shopId: string, id: string, input: Partial<{
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}>) {
  const existing = await prisma.customer.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Customer not found');

  const data: Prisma.CustomerUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = (input.phone as string)?.trim() || null;
  if (input.email !== undefined) data.email = (input.email as string)?.trim() || null;
  if (input.address !== undefined) data.address = (input.address as string)?.trim() || null;
  if (input.notes !== undefined) data.notes = (input.notes as string)?.trim() || null;

  return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(shopId: string, id: string) {
  const existing = await prisma.customer.findFirst({ where: { id, shopId } });
  if (!existing) throw new NotFoundError('Customer not found');
  await prisma.customer.delete({ where: { id } });
}
