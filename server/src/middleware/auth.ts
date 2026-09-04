import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { SESSION_COOKIE_NAME, verifyToken } from '../lib/session';
import { UnauthorizedError } from '../lib/errors';
import { resolveUserPermissions } from '../services/permission.service';
import { logger } from '../lib/logger';

// Authenticates the user from the HTTP-only session cookie and attaches the
// user (and their shop) to req.user. Every route beyond /auth relies on this.
// It also resolves the user's effective permission set (role + overrides) and
// attaches it to req.permissions so permission guards can check it cheaply.
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) throw new UnauthorizedError('Not authenticated');

    const payload = verifyToken(token);
    if (!payload) throw new UnauthorizedError('Session expired or invalid');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { shop: true, register: true },
    });

    if (!user) throw new UnauthorizedError('Account no longer exists');

    // A staff member whose account was deactivated or suspended cannot use the
    // API even with a valid session — this enforces status at every request.
    if (user.status === 'INACTIVE') throw new UnauthorizedError('This account has been deactivated');
    if (user.status === 'SUSPENDED') throw new UnauthorizedError('This account has been suspended');

    // Resolve effective permissions (DB role + per-user overrides).
    let permissions = new Set<string>();
    let permissionInfo = null;
    try {
      const resolved = await resolveUserPermissions(user.id);
      permissions = resolved.permissions;
      permissionInfo = resolved.info;
    } catch (error) {
      // Fall back to an empty permission set; guards will reject unauthorized
      // access rather than allowing it. Log the underlying cause so permission
      // resolution failures are not silently swallowed as generic 403s.
      logger.error('Failed to resolve user permissions', {
        userId: user.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      status: user.status,
      shopId: user.shopId,
      shop: user.shop,
      register: user.register,
    };
    req.permissions = permissions;
    req.permissionInfo = permissionInfo as never;

    next();
  } catch (error) {
    next(error);
  }
}

// Re-export authorization helpers from here so consumers can import everything
// auth-related (requireAuth + requireShop + authorize) from a single module.
export { requireShop, authorize } from './authorize';
