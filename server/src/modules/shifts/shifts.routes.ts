import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { approveShiftSchema, closeShiftSchema, openShiftSchema } from './shifts.schema';
import { approveShift, closeShift, listShifts, openShift } from './shifts.service';

const router = Router();
router.use(requireAuth, requireShop);

// List shifts (view shifts).
router.get('/', requirePermission(PERMISSIONS.SHIFTS_VIEW), async (req, res, next) => {
  try {
    const data = await listShifts(req.user!.shop!.id, req.query as any);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Open a register shift.
router.post('/open', requirePermission(PERMISSIONS.SHIFTS_MANAGE), validate(openShiftSchema), async (req, res, next) => {
  try {
    const body = req.body as { registerId: string; openingCash: number; notes?: string };
    const shift = await openShift(req.user!.shop!.id, req.user!.id, body);
    await auditLog({ action: 'SHIFT_OPENED', entityType: 'Shift', entityId: shift.id, req });
    return created(res, { shift });
  } catch (error) {
    next(error);
  }
});

// Close / reconcile a shift (requires shifts.manage).
router.post('/:id/close', requirePermission(PERMISSIONS.SHIFTS_MANAGE), validate(closeShiftSchema), async (req, res, next) => {
  try {
    const body = req.body as { actualCash: number; cashWithdrawals?: number; notes?: string };
    const shift = await closeShift(req.user!.shop!.id, req.user!.id, req.params.id, body);
    await auditLog({ action: 'SHIFT_CLOSED', entityType: 'Shift', entityId: shift.id, metadata: { difference: String(shift.difference) }, req });
    return ok(res, { shift });
  } catch (error) {
    next(error);
  }
});

// Approve / reject a shift with a cash difference (requires shifts.approve).
router.post('/:id/approve', requirePermission(PERMISSIONS.SHIFTS_APPROVE), validate(approveShiftSchema), async (req, res, next) => {
  try {
    const body = req.body as { approved: boolean; notes?: string };
    const shift = await approveShift(req.user!.shop!.id, req.user!.id, req.params.id, body);
    await auditLog({ action: body.approved ? 'SHIFT_APPROVED' : 'SHIFT_REJECTED', entityType: 'Shift', entityId: shift.id, req });
    return ok(res, { shift });
  } catch (error) {
    next(error);
  }
});

export default router;
