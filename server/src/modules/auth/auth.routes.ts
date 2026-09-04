import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { created, ok } from '../../lib/responses';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { env } from '../../config/env';
import {
  loginSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  registerSchema,
} from './auth.schema';
import {
  changePassword,
  deleteAccount,
  login,
  register,
} from './auth.service';
import { SESSION_COOKIE_NAME } from '../../lib/session';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { user, token } = await register(req.body);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    await auditLog({ action: 'USER_REGISTERED', entityType: 'User', entityId: user.id, req });
    const { passwordHash: _ph, ...safe } = user;
    return created(res, { user: safe });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { user, token } = await login(req.body.email, req.body.password);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    await auditLog({ action: 'LOGIN_SUCCESS', entityType: 'User', entityId: user.id, req });
    const { passwordHash: _ph, ...safe } = user;
    return ok(res, { user: safe });
  } catch (error) {
    if (error instanceof Error && error.message === 'Incorrect email or password') {
      await auditLog({ action: 'LOGIN_FAILED', metadata: { email: req.body.email }, req });
    }
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  return ok(res, { message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { register: true },
  });
  const { passwordHash: _ph, ...safe } = user!;
  return ok(res, {
    user: safe,
    shop: req.user!.shop,
    register: user!.register ?? null,
    permissions: req.permissions ? Array.from(req.permissions) : [],
    permissionInfo: req.permissionInfo ?? null,
  });
});

router.patch('/profile', requireAuth, validate(profileUpdateSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { fullName: req.body.fullName, phone: req.body.phone || null },
    });
    await auditLog({ action: 'PROFILE_UPDATED', entityType: 'User', entityId: user.id, req });
    const { passwordHash: _ph, ...safe } = user;
    return ok(res, { user: safe });
  } catch (error) {
    next(error);
  }
});

router.patch('/password', requireAuth, validate(passwordChangeSchema), async (req, res, next) => {
  try {
    await changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    await auditLog({ action: 'PASSWORD_CHANGED', entityType: 'User', entityId: req.user!.id, req });
    return ok(res, { message: 'Password updated' });
  } catch (error) {
    next(error);
  }
});

router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    await deleteAccount(req.user!.id);
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    await auditLog({ action: 'ACCOUNT_DELETED', entityType: 'User', entityId: req.user!.id, req });
    return ok(res, { message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
