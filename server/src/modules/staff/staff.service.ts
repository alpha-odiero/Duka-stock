import { Prisma } from '@prisma/client';
import type { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import { hashPassword } from '../auth/auth.service';

// Map a DB role name to the legacy UserRole enum for backwards compatibility.
// Custom roles map to MANAGER so they retain broad operational access on legacy
// enum-guarded routes until those are migrated to permission checks.
const LEGACY_ROLE_BY_NAME: Record<string, UserRole> = {
  'Owner/Admin': 'OWNER',
  'Admin': 'ADMIN',
  'Manager': 'MANAGER',
  'Cashier': 'CASHIER',
  'Accountant': 'CASHIER',
  'Sales Staff': 'CASHIER',
  'Storekeeper': 'INVENTORY',
  'Inventory Manager': 'INVENTORY',
  'Supervisor': 'MANAGER',
  'Procurement Officer': 'INVENTORY',
};

export function legacyRoleForName(name: string | null | undefined, fallback: UserRole = 'MANAGER'): UserRole {
  if (!name) return fallback;
  return LEGACY_ROLE_BY_NAME[name] ?? fallback;
}

// A staff member alongside their live sales counts. Sales are counted directly
// from the Sale table (cashier = this user), so deactivated staff still show
// their full history. Everything is scoped to the requesting shop (tenant).
export async function listStaff(
  shopId: string,
  opts: { search?: string; role?: UserRole; status?: UserStatus; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 50;

  const where: Prisma.UserWhereInput = { shopId };
  if (opts.role) where.role = opts.role;
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where.OR = [
      { fullName: { contains: opts.search, mode: 'insensitive' } },
      { email: { contains: opts.search, mode: 'insensitive' } },
      { userName: { contains: opts.search, mode: 'insensitive' } },
    ];
  }

  const [total, staff] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        register: { select: { id: true, name: true } },
        _count: { select: { salesMade: true } },
      },
    }),
  ]);

  // Last-active = most recent timestamp among the staff's last login and latest
  // sale, so an always-on-the-mobile cashier reads as "active".
  const rows = await Promise.all(
    staff.map(async (u) => {
      const lastSale = await prisma.sale.findFirst({
        where: { shopId, cashierId: u.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      const lastActive = lastSale && (!u.lastLoginAt || lastSale.createdAt > u.lastLoginAt) ? lastSale.createdAt : u.lastLoginAt;
      return { ...u, lastActive };
    }),
  );

  return { staff: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getStaff(shopId: string, id: string) {
  const staff = await prisma.user.findFirst({
    where: { id, shopId },
    include: { register: { select: { id: true, name: true } } },
  });
  if (!staff) throw new NotFoundError('Staff member not found');
  return staff;
}

// Owner/Admin can create staff accounts (enum-mediated by the route guard).
export async function createStaff(
  shopId: string,
  actorId: string,
  input: {
    fullName: string;
    email: string;
    phone?: string;
    userName?: string;
    password?: string;
    role?: UserRole;
    roleId?: string | null;
    status?: UserStatus;
    registerId?: string | null;
    avatar?: string | null;
  },
) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('A user with this email already exists');

  if (input.registerId) {
    const register = await prisma.register.findFirst({ where: { id: input.registerId, shopId } });
    if (!register) throw new ValidationError('Register does not belong to this shop');
  }

  // Resolve the DB role (source of truth for permissions) and sync the legacy
  // enum role for backwards-compatible routes.
  const roleId: string | null = input.roleId ?? null;
  let legacyRole: UserRole = input.role ?? 'MANAGER';
  if (roleId) {
    const dbRole = await prisma.role.findFirst({ where: { id: roleId, shopId } });
    if (!dbRole) throw new ValidationError('Role does not belong to this shop');
    legacyRole = legacyRoleForName(dbRole.name, legacyRole);
    if (!input.role) {
      // ensure the enum matches the DB role for the primary default roles
      if (dbRole.name === 'Owner/Admin') legacyRole = 'OWNER';
    }
  }

  const passwordHash = input.password ? await hashPassword(input.password) : await hashPassword('Duka@12345');

  const staff = await prisma.user.create({
    data: {
      fullName: input.fullName,
      userName: input.userName?.trim() || null,
      email: input.email,
      phone: input.phone || null,
      avatar: input.avatar || null,
      passwordHash,
      role: legacyRole,
      roleId,
      status: input.status ?? 'ACTIVE',
      shopId,
      registerId: input.registerId ?? null,
    },
    include: {
      register: { select: { id: true, name: true } },
      roleRef: { select: { id: true, name: true } },
    },
  });

  return staff;
}

export async function updateStaff(
  shopId: string,
  id: string,
  actorId: string,
  input: {
    fullName?: string;
    phone?: string;
    userName?: string;
    role?: UserRole;
    roleId?: string | null;
    status?: UserStatus;
    registerId?: string | null;
    avatar?: string | null;
  },
) {
  const target = await prisma.user.findFirst({ where: { id, shopId } });
  if (!target) throw new NotFoundError('Staff member not found');

  // Prevent an OWNER from accidentally locking themselves out or demoting
  // themselves in a way that breaks the business.
  if (target.id === actorId) {
    if (input.status && input.status !== 'ACTIVE') {
      throw new ValidationError('You cannot deactivate or suspend your own account');
    }
    // Prevent owner from removing their own owner role.
    if (target.role === 'OWNER' && input.role && input.role !== 'OWNER') {
      throw new ValidationError('You cannot change your own Owner role');
    }
  }

  if (input.registerId !== undefined && input.registerId !== null) {
    const register = await prisma.register.findFirst({ where: { id: input.registerId, shopId } });
    if (!register) throw new ValidationError('Register does not belong to this shop');
  } else if (input.registerId === null) {
    // allow unassign
  }

  // Resolve role + legacy enum when a DB role is provided.
  let roleToSet: UserRole | undefined = input.role;
  let roleIdToSet: string | null | undefined = input.roleId;
  if (input.roleId) {
    const dbRole = await prisma.role.findFirst({ where: { id: input.roleId, shopId } });
    if (!dbRole) throw new ValidationError('Role does not belong to this shop');
    roleIdToSet = input.roleId;
    roleToSet = roleToSet ?? legacyRoleForName(dbRole.name, target.role);
  }

  const staff = await prisma.user.update({
    where: { id },
    data: {
      fullName: input.fullName,
      phone: input.phone,
      userName: input.userName?.trim() || null,
      role: roleToSet,
      roleId: roleIdToSet === undefined ? undefined : roleIdToSet,
      status: input.status,
      avatar: input.avatar,
      registerId: input.registerId === undefined ? undefined : input.registerId,
    },
    include: {
      register: { select: { id: true, name: true } },
      roleRef: { select: { id: true, name: true } },
    },
  });

  return staff;
}

// Admin resets a staff member's password (staff never needs to know it).
export async function resetStaffPassword(shopId: string, id: string, newPassword: string) {
  const target = await prisma.user.findFirst({ where: { id, shopId } });
  if (!target) throw new NotFoundError('Staff member not found');
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  return target;
}

// Staff performance summary: today's sales, transaction count, average
// transaction, refunded and voided sales. All counts derived from the sale
// table and scoped to the shop.
export async function getStaffPerformance(shopId: string, id: string) {
  const staff = await prisma.user.findFirst({ where: { id, shopId }, include: { register: { select: { name: true } } } });
  if (!staff) throw new NotFoundError('Staff member not found');

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todaySalesAgg, totalTransactions, allSalesAgg, refunded, voided] = await Promise.all([
    prisma.sale.aggregate({
      where: { shopId, cashierId: id, createdAt: { gte: startOfToday }, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.sale.count({ where: { shopId, cashierId: id } }),
    prisma.sale.aggregate({
      where: { shopId, cashierId: id },
      _sum: { totalAmount: true },
    }),
    prisma.sale.count({ where: { shopId, cashierId: id, paymentStatus: 'REFUNDED' } }),
    prisma.sale.count({ where: { shopId, cashierId: id, paymentStatus: 'VOID' } }),
  ]);

  const todayTotal = Number(todaySalesAgg._sum.totalAmount ?? 0);
  const todayCount = todaySalesAgg._count;
  const avgTransaction = todayCount > 0 ? todayTotal / todayCount : 0;

  return {
    staff: { id: staff.id, fullName: staff.fullName, role: staff.role, status: staff.status, register: staff.register },
    todaySales: todayTotal,
    transactions: totalTransactions,
    todayTransactions: todayCount,
    averageTransaction: avgTransaction,
    totalSales: Number(allSalesAgg._sum.totalAmount ?? 0),
    refunds: refunded,
    voided: voided,
  };
}

// Staff's own sales, paginated and tenant-scoped.
export async function getStaffSales(
  shopId: string,
  id: string,
  opts: { status?: string; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const where: Prisma.SaleWhereInput = { shopId, cashierId: id };
  if (opts.status) where.paymentStatus = opts.status as never;

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true, unit: true } } } },
        register: { select: { name: true } },
      },
    }),
  ]);

  return { sales, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// Staff activity / audit trail (non-deletable by staff). Actions performed by
// this user across the business.
export async function getStaffActivity(shopId: string, id: string, opts: { page?: number; limit?: number } = {}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 30;
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: { shopId, userId: id } }),
    prisma.auditLog.findMany({
      where: { shopId, userId: id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { activity: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
