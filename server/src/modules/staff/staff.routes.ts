import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import {
  createStaffSchema,
  paginationQuerySchema,
  resetPasswordSchema,
  staffSalesQuerySchema,
  staffQuerySchema,
  updateStaffSchema,
} from './staff.schema';
import {
  createStaff,
  getStaff,
  getStaffActivity,
  getStaffPerformance,
  getStaffSales,
  listStaff,
  resetStaffPassword,
  updateStaff,
} from './staff.service';
import { createInvitation } from '../invitations/invitations.service';

const router = Router();
router.use(requireAuth, requireShop);

// List staff — requires staff.view (owner/admin/manager).
router.get('/', requirePermission(PERMISSIONS.STAFF_VIEW), validate(staffQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listStaff(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Create a staff account — requires staff.create. Optionally creates an
// invitation (no password shared) instead of setting one directly.
router.post('/', requirePermission(PERMISSIONS.STAFF_CREATE), validate(createStaffSchema), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const shouldInvite = Boolean(body.invite);
    const roleId = (body.roleId as string) || null;

    if (shouldInvite) {
      // Invitation flow: no password needed, staff set their own on accept.
      if (!roleId) throw new Error('Role is required for an invitation');
      const invitation = await createInvitation(req.user!.shop!.id, req.user!.id, {
        fullName: String(body.fullName),
        email: String(body.email),
        roleId,
      });
      await auditLog({
        action: 'STAFF_INVITED',
        entityType: 'Invitation',
        entityId: invitation.id,
        metadata: { name: invitation.fullName, email: invitation.email },
        req,
      });
      return created(res, { invitation, acceptUrl: invitation.acceptUrl, invited: true });
    }

    const staff = await createStaff(req.user!.shop!.id, req.user!.id, {
      fullName: String(body.fullName),
      email: String(body.email),
      phone: (body.phone as string) || undefined,
      userName: (body.userName as string) || undefined,
      password: String(body.password),
      role: body.role as never,
      roleId,
      status: body.status as never,
      registerId: (body.registerId as string) || null,
      avatar: (body.avatar as string) || null,
    });
    await auditLog({
      action: 'STAFF_CREATED',
      entityType: 'User',
      entityId: staff.id,
      metadata: { name: staff.fullName, role: staff.role, roleId: staff.roleId, memberId: staff.id },
      req,
    });
    return created(res, { staff });
  } catch (error) {
    next(error);
  }
});

// Staff profile.
router.get('/:id', requirePermission(PERMISSIONS.STAFF_VIEW), async (req, res, next) => {
  try {
    const staff = await getStaff(req.user!.shop!.id, req.params.id);
    return ok(res, { staff });
  } catch (error) {
    next(error);
  }
});

// Staff performance summary.
router.get('/:id/performance', requirePermission(PERMISSIONS.STAFF_VIEW), async (req, res, next) => {
  try {
    const data = await getStaffPerformance(req.user!.shop!.id, req.params.id);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/sales', requirePermission(PERMISSIONS.STAFF_VIEW), validate(staffSalesQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await getStaffSales(req.user!.shop!.id, req.params.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Staff activity / audit trail.
router.get('/:id/activity', requirePermission(PERMISSIONS.STAFF_VIEW), validate(paginationQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await getStaffActivity(req.user!.shop!.id, req.params.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Update staff (name, role, status, register...) — requires staff.edit.
router.patch('/:id', requirePermission(PERMISSIONS.STAFF_EDIT), validate(updateStaffSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      fullName?: string;
      phone?: string;
      userName?: string;
      role?: string;
      roleId?: string | null;
      status?: string;
      registerId?: string | null;
      avatar?: string | null;
    };
    const staff = await updateStaff(req.user!.shop!.id, req.params.id, req.user!.id, {
      fullName: body.fullName,
      phone: body.phone,
      userName: body.userName,
      role: body.role as never,
      roleId: body.roleId ?? null,
      status: body.status as never,
      registerId: body.registerId,
      avatar: body.avatar,
    });
    await auditLog({
      action: 'STAFF_UPDATED',
      entityType: 'User',
      entityId: staff.id,
      metadata: { name: staff.fullName, role: staff.role, roleId: staff.roleId, status: staff.status },
      req,
    });
    return ok(res, { staff });
  } catch (error) {
    next(error);
  }
});

// Admin resets a staff member's password.
router.post('/:id/password', requirePermission(PERMISSIONS.STAFF_EDIT), validate(resetPasswordSchema), async (req, res, next) => {
  try {
    await resetStaffPassword(req.user!.shop!.id, req.params.id, req.body.newPassword);
    await auditLog({ action: 'STAFF_PASSWORD_RESET', entityType: 'User', entityId: req.params.id, req });
    return ok(res, { message: 'Password reset' });
  } catch (error) {
    next(error);
  }
});

// Deactivate / reactivate a staff member (soft delete — history is preserved).
router.post('/:id/:action', requirePermission(PERMISSIONS.STAFF_DEACTIVATE), async (req, res, next) => {
  try {
    const action = req.params.action;
    if (action !== 'deactivate' && action !== 'reactivate') {
      return next(new Error('Unknown action'));
    }
    const status = action === 'deactivate' ? 'INACTIVE' : 'ACTIVE';
    const staff = await updateStaff(req.user!.shop!.id, req.params.id, req.user!.id, { status: status as never });
    await auditLog({
      action: action === 'deactivate' ? 'STAFF_DEACTIVATED' : 'STAFF_REACTIVATED',
      entityType: 'User',
      entityId: staff.id,
      metadata: { name: staff.fullName },
      req,
    });
    return ok(res, { staff });
  } catch (error) {
    next(error);
  }
});

export default router;
