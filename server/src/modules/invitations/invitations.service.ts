import { randomBytes } from 'crypto';
import { prisma } from '../../lib/prisma';
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors';
import { hashPassword } from '../auth/auth.service';

const INVITE_TTL_DAYS = 7;

export async function createInvitation(
  shopId: string,
  actorId: string,
  input: { fullName: string; email: string; roleId: string },
) {
  const role = await prisma.role.findFirst({ where: { id: input.roleId, shopId } });
  if (!role) throw new ValidationError('Role does not belong to this shop');

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new ConflictError('A user with this email already exists');

  const token = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      shopId,
      roleId: input.roleId,
      fullName: input.fullName,
      email: input.email,
      token,
      expiresAt,
      createdById: actorId,
    },
  });

  return { ...invitation, acceptUrl: `/accept-invitation?token=${token}` };
}

export async function listInvitations(shopId: string) {
  const invitations = await prisma.invitation.findMany({
    where: { shopId },
    orderBy: { createdAt: 'desc' },
    include: { role: { select: { id: true, name: true } } },
  });
  return invitations;
}

export async function revokeInvitation(shopId: string, id: string) {
  const inv = await prisma.invitation.findFirst({ where: { id, shopId } });
  if (!inv) throw new NotFoundError('Invitation not found');
  if (inv.status !== 'PENDING') throw new ValidationError('Only pending invitations can be revoked');
  return prisma.invitation.update({ where: { id }, data: { status: 'REVOKED' } });
}

// Validates an invitation token and provisions a staff account + default
// register/licence then returns the created user so they can be signed in.
export async function acceptInvitation(token: string, input: { password: string; fullName?: string }) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { shop: true, role: { select: { id: true, name: true } } },
  });
  if (!invitation) throw new NotFoundError('Invitation not found or already used');
  if (invitation.status === 'ACCEPTED') throw new ValidationError('This invitation has already been used');
  if (invitation.status === 'REVOKED') throw new ValidationError('This invitation has been revoked');
  if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    throw new ValidationError('This invitation has expired');
  }

  const email = invitation.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('A user with this email already exists');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        fullName: input.fullName?.trim() || invitation.fullName,
        email,
        passwordHash,
        roleId: invitation.roleId,
        shopId: invitation.shopId,
        status: 'ACTIVE',
      },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
    return created;
  });

  return user;
}
