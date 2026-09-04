import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { PERMISSIONS, respondIfHasAnyPermission } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { approveReturnSchema, createReturnSchema, returnQuerySchema } from './returns.schema';
import { approveReturn, createReturn, getReturn, listRefunds, listReturns } from './returns.service';
import type { ResolvedPermissions } from '../../lib/permissions';

const router = Router();
router.use(requireAuth, requireShop);

// Derive approval rules from the actor's resolved role limits + permissions.
function approvalRules(req: { permissionInfo?: ResolvedPermissions }) {
  const limits = req.permissionInfo?.limits ?? null;
  return {
    required: limits?.refundApprovalRequired ?? false,
    canApprove: limits?.canApproveRefund ?? (req.permissionInfo?.permissions?.has(PERMISSIONS.RETURNS_APPROVE) ?? false),
  };
}

router.get('/', validate(returnQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listReturns(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

// Refund ledger (must be able to view returns OR process refunds).
router.get('/refunds', respondIfHasAnyPermission(PERMISSIONS.RETURNS_VIEW, PERMISSIONS.PAYMENTS_REFUNDS), validate(returnQuerySchema, 'query'), async (req, res, next) => {
  try {
    const data = await listRefunds(req.user!.shop!.id, req.query as never);
    return ok(res, data);
  } catch (error) {
    next(error);
  }
});

router.post('/', respondIfHasAnyPermission(PERMISSIONS.RETURNS_CREATE, PERMISSIONS.SALES_REFUND), validate(createReturnSchema), async (req, res, next) => {
  try {
    const body = req.body as {
      saleId: string;
      items: { saleItemId: string; quantity: number; condition?: 'MINT' | 'GOOD' | 'FAIR' | 'DAMAGED' }[];
      refundMethod?: 'ORIGINAL' | 'CASH' | 'MPESA' | 'CARD' | 'BANK' | 'STORE_CREDIT';
      registerId?: string | null;
      notes?: string | null;
    };
    const result = await createReturn(
      req.user!.shop!.id,
      req.user!.id,
      {
        saleId: body.saleId,
        items: body.items,
        refundMethod: body.refundMethod ?? 'ORIGINAL',
        registerId: body.registerId ?? req.user!.register?.id ?? null,
        notes: body.notes ?? undefined,
      },
      approvalRules(req),
    );
    await auditLog({
      action: 'RETURN_CREATED',
      entityType: 'Return',
      entityId: result.return.id,
      metadata: { returnNumber: result.return.returnNumber, sale: body.saleId, requiresApproval: result.requiresApproval, refundAmount: String(result.return.refunds[0]?.amount ?? 0) },
      req,
    });
    return created(res, result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/approve', respondIfHasAnyPermission(PERMISSIONS.RETURNS_APPROVE, PERMISSIONS.SALES_APPROVE_REFUND), validate(approveReturnSchema), async (req, res, next) => {
  try {
    const body = req.body as { approved: boolean; notes?: string | null };
    const result = await approveReturn(req.user!.shop!.id, req.user!.id, req.params.id, {
      approved: body.approved,
      notes: body.notes ?? undefined,
    });
    await auditLog({
      action: body.approved ? 'RETURN_APPROVED' : 'RETURN_REJECTED',
      entityType: 'Return',
      entityId: req.params.id,
      metadata: { approved: body.approved },
      req,
    });
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ret = await getReturn(req.user!.shop!.id, req.params.id);
    return ok(res, { return: ret });
  } catch (error) {
    next(error);
  }
});

export default router;