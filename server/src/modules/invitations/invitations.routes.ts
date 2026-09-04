import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { acceptInvitationSchema, createInvitationSchema } from './invitations.schema';
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  revokeInvitation,
} from './invitations.service';
import { signToken } from '../../lib/session';
import { SESSION_COOKIE_NAME } from '../../lib/session';
import { env } from '../../config/env';

const router = Router();

// Public: accept an invitation (no auth — only the emailed token grants access).
router.post('/accept', validate(acceptInvitationSchema), async (req, res, next) => {
  try {
    const token = (req.body as { token?: string }).token;
    if (!token) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invitation token is required' } });
    }
    const user = await acceptInvitation(token, {
      password: (req.body as { password: string }).password,
      fullName: (req.body as { fullName?: string }).fullName,
    });
    const tokenJwt = signToken(user.id);
    res.cookie(SESSION_COOKIE_NAME, tokenJwt, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    await auditLog({ action: 'INVITATION_ACCEPTED', entityType: 'User', entityId: user.id, req });
    const { passwordHash: _ph, ...safe } = user;
    return created(res, { user: safe });
  } catch (error) {
    next(error);
  }
});

// Authenticated routes below.
router.use(requireAuth, requireShop);

router.get('/', requirePermission(PERMISSIONS.STAFF_INVITE), async (req, res, next) => {
  try {
    const invitations = await listInvitations(req.user!.shop!.id);
    return ok(res, { invitations });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.STAFF_INVITE), validate(createInvitationSchema), async (req, res, next) => {
  try {
    const body = req.body as { fullName: string; email: string; roleId: string };
    const invitation = await createInvitation(req.user!.shop!.id, req.user!.id, body);
    await auditLog({ action: 'INVITATION_CREATED', entityType: 'Invitation', entityId: invitation.id, metadata: { email: invitation.email }, req });
    return created(res, { invitation });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/revoke', requirePermission(PERMISSIONS.STAFF_INVITE), async (req, res, next) => {
  try {
    const inv = await revokeInvitation(req.user!.shop!.id, req.params.id);
    await auditLog({ action: 'INVITATION_REVOKED', entityType: 'Invitation', entityId: inv.id, req });
    return ok(res, { invitation: inv });
  } catch (error) {
    next(error);
  }
});

export default router;
