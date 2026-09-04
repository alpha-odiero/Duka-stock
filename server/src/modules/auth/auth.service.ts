import argon2 from 'argon2';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { signToken } from '../../lib/session';
import { bootstrapRolesForShop, ensurePermissionCatalog } from '../../services/bootstrap.service';
import type { RegisterInput } from './auth.schema';

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

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// Full registration: create user -> create shop -> associate -> default
// categories. Wrapped in a single transaction so a partial setup never persists.
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);
  await ensurePermissionCatalog();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
      },
    });

    const shop = await tx.shop.create({
      data: {
        ownerId: user.id,
        name: input.shopName,
        location: input.shopLocation || null,
      },
    });

    // Associate the owner with the shop
    await tx.user.update({ where: { id: user.id }, data: { shopId: shop.id } });

    // Default categories for the new shop
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((name) => ({ shopId: shop.id, name })),
    });

    // Default (zero-rated) tax rate for the new shop
    await tx.taxRate.create({
      data: {
        shopId: shop.id,
        name: 'VAT (Zero-rated)',
        rate: 0,
        type: 'INCLUSIVE',
        category: 'ZERO_RATED',
        isActive: true,
        isDefault: true,
      },
    });

    return { user, shop };
  });

  // Create default roles for the new business and link the owner role.
  try {
    const roles = await bootstrapRolesForShop(result.shop.id);
    const ownerRoleId = roles['Owner/Admin'];
    if (ownerRoleId) {
      await prisma.user.update({ where: { id: result.user.id }, data: { roleId: ownerRoleId } });
    }
  } catch (error) {
    // Role bootstrap should not fail registration. If it fails, the owner still
    // has the legacy DB role and will be granted access via the role map.
    // eslint-disable-next-line no-console
    console.error('Failed to bootstrap roles', error);
  }

  return { user: result.user, shop: result.shop, token: signToken(result.user.id) };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Incorrect email or password');

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) throw new UnauthorizedError('Incorrect email or password');

  // Deactivated / suspended staff cannot sign in, but their historical sales
  // remain intact (they are only soft-deactivated, never deleted).
  if (user.status === 'INACTIVE') {
    throw new UnauthorizedError('This account has been deactivated. Contact your manager.');
  }
  if (user.status === 'SUSPENDED') {
    throw new UnauthorizedError('This account has been suspended. Contact your manager.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user, token: signToken(user.id) };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Account not found');

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) throw new UnauthorizedError('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deleteAccount(userId: string) {
  // Deleting the owner cascades to the shop (Shop.owner onDelete: Cascade).
  const user = await prisma.user.delete({ where: { id: userId } });
  return user;
}
