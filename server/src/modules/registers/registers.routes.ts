import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { NotFoundError, ValidationError } from '../../lib/errors';
import { createRegisterSchema, updateRegisterSchema } from './registers.schema';

const router = Router();
router.use(requireAuth, requireShop);

// List registers for the shop. Available to anyone with a shop (POS needs the
// active register list), but creating/managing registers needs registers.manage.
router.get('/', async (req, res, next) => {
  try {
    const registers = await prisma.register.findMany({
      where: { shopId: req.user!.shop!.id },
      orderBy: { name: 'asc' },
      include: {
        staff: { select: { id: true, fullName: true, role: true, status: true }, where: { shopId: req.user!.shop!.id } },
        _count: { select: { sales: true } },
      },
    });
    return ok(res, { registers });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.REGISTERS_CREATE), validate(createRegisterSchema), async (req, res, next) => {
  try {
    const body = req.body as { name: string; status?: never; assignedUserId?: string | null };
    const registers = await prisma.register.findMany({ where: { shopId: req.user!.shop!.id }, select: { name: true } });
    const name = body.name.trim();
    if (registers.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      throw new ValidationError('A register with this name already exists');
    }
    if (body.assignedUserId) {
      const user = await prisma.user.findFirst({ where: { id: body.assignedUserId, shopId: req.user!.shop!.id } });
      if (!user) throw new ValidationError('Assigned staff does not belong to this shop');
    }
    const register = await prisma.register.create({
      data: { shopId: req.user!.shop!.id, name, status: body.status ?? 'ACTIVE' },
    });
    if (body.assignedUserId) {
      await prisma.user.update({ where: { id: body.assignedUserId }, data: { registerId: register.id } });
    }
    await auditLog({ action: 'REGISTER_CREATED', entityType: 'Register', entityId: register.id, metadata: { name }, req });
    return created(res, { register });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermission(PERMISSIONS.REGISTERS_EDIT), validate(updateRegisterSchema), async (req, res, next) => {
  try {
    const register = await prisma.register.findFirst({ where: { id: req.params.id, shopId: req.user!.shop!.id } });
    if (!register) throw new NotFoundError('Register not found');

    const body = req.body as { name?: string; status?: never; assignedUserId?: string | null };

    // Clear any staff currently assigned to this register if reassigning.
    const current = await prisma.user.findFirst({ where: { registerId: register.id } });

    let assignedUserId: string | null | undefined = undefined;
    if (body.assignedUserId !== undefined) {
      if (body.assignedUserId) {
        const user = await prisma.user.findFirst({ where: { id: body.assignedUserId, shopId: req.user!.shop!.id } });
        if (!user) throw new ValidationError('Assigned staff does not belong to this shop');
        assignedUserId = body.assignedUserId;
      } else {
        assignedUserId = null;
      }
    }

    const updated = await prisma.register.update({
      where: { id: register.id },
      data: { name: body.name ? body.name.trim() : undefined, status: body.status },
    });

    // Manage staff assignment: unassign previous + assign new.
    if (assignedUserId !== undefined) {
      if (current && current.id !== assignedUserId) {
        await prisma.user.update({ where: { id: current.id }, data: { registerId: null } });
      }
      if (assignedUserId) {
        await prisma.user.update({ where: { id: assignedUserId }, data: { registerId: updated.id } });
      }
    }

    await auditLog({ action: 'REGISTER_UPDATED', entityType: 'Register', entityId: updated.id, req });
    return ok(res, { register: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
