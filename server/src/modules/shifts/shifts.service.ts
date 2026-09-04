import { prisma } from '../../lib/prisma';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { round2 } from '../../utils/money';

export async function listShifts(shopId: string, opts: { registerId?: string; cashierId?: string; status?: string; page?: number; limit?: number } = {}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const where: any = { shopId };
  if (opts.registerId) where.registerId = opts.registerId;
  if (opts.cashierId) where.cashierId = opts.cashierId;
  if (opts.status) where.status = opts.status;

  const [total, shifts] = await Promise.all([
    prisma.shift.count({ where }),
    prisma.shift.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        register: { select: { id: true, name: true } },
        cashier: { select: { id: true, fullName: true } },
      },
    }),
  ]);
  return { shifts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function openShift(
  shopId: string,
  userId: string,
  input: { registerId: string; openingCash: number; notes?: string },
) {
  // Only one open shift per register at a time.
  const open = await prisma.shift.findFirst({ where: { shopId, registerId: input.registerId, status: 'OPEN' } });
  if (open) throw new ValidationError('This register already has an open shift');

  const register = await prisma.register.findFirst({ where: { id: input.registerId, shopId } });
  if (!register) throw new NotFoundError('Register not found');

  return prisma.shift.create({
    data: {
      shopId,
      registerId: input.registerId,
      cashierId: userId,
      openedBy: userId,
      openingCash: round2(input.openingCash),
      status: 'OPEN',
      notes: input.notes || null,
    },
    include: { register: { select: { name: true } } },
  });
}

// Reconcile a shift: compute cash sales/refunds/withdrawals, expected cash and
// the difference against the actual cash counted.
export async function closeShift(
  shopId: string,
  userId: string,
  shiftId: string,
  input: { actualCash: number; cashWithdrawals?: number; notes?: string },
) {
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, shopId } });
  if (!shift) throw new NotFoundError('Shift not found');
  if (shift.status !== 'OPEN') throw new ValidationError('This shift is not open');
  if (shift.cashierId && shift.cashierId !== userId) {
    // The cashier who opened might close it; a manager may also close — allow.
  }

  const start = shift.openedAt;
  const end = new Date();

  const cashAgg = await prisma.sale.aggregate({
    where: {
      shopId,
      registerId: shift.registerId ?? undefined,
      cashierId: shift.cashierId ?? undefined,
      createdAt: { gte: start, lte: end },
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
    },
    _sum: { totalAmount: true },
  });

  const refundsAgg = await prisma.sale.aggregate({
    where: {
      shopId,
      registerId: shift.registerId ?? undefined,
      cashierId: shift.cashierId ?? undefined,
      createdAt: { gte: start, lte: end },
      paymentStatus: 'REFUNDED',
    },
    _sum: { totalAmount: true },
  });

  const cashSales = round2(cashAgg._sum.totalAmount ?? 0);
  const cashRefunds = round2(refundsAgg._sum.totalAmount ?? 0);
  const cashWithdrawals = round2(input.cashWithdrawals ?? 0);
  const openingCash = shift.openingCash;

  // expected = opening + cash sales - refunds - withdrawals
  const expectedCash = round2(openingCash.add(cashSales).sub(cashRefunds).sub(cashWithdrawals));
  const actualCash = round2(input.actualCash);
  const difference = round2(actualCash.sub(expectedCash));

  // Final state: closed with a computed difference. A zero difference is ideal;
  // a non-zero difference requires manager approval to finalize.
  const status = difference.isZero() ? 'CLOSED' : 'PENDING_APPROVAL';

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      status,
      closedAt: new Date(),
      closedBy: userId,
      actualCash,
      expectedCash,
      difference,
      cashSales,
      cashRefunds,
      cashWithdrawals,
      notes: input.notes || null,
    },
    include: { register: { select: { name: true } }, cashier: { select: { fullName: true } } },
  });
}

export async function approveShift(shopId: string, userId: string, shiftId: string, input: { approved: boolean; notes?: string }) {
  // Requires the shifts.approve permission — enforced at the route.
  const shift = await prisma.shift.findFirst({ where: { id: shiftId, shopId } });
  if (!shift) throw new NotFoundError('Shift not found');
  if (shift.status !== 'PENDING_APPROVAL') throw new ValidationError('Only pending-approval shifts can be approved or rejected');

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: input.approved ? 'APPROVED' : 'CLOSED',
      approvedBy: userId,
      approvedAt: new Date(),
      notes: input.notes ? `${shift.notes ?? ''}\nApproval note: ${input.notes}`.trim() : shift.notes,
    },
    include: { register: { select: { name: true } }, cashier: { select: { fullName: true } } },
  });
}
