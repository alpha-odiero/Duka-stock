import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../lib/errors';

// Ensures the authenticated user belongs to a shop. Most business routes need
// a shop context to scope every query.
export function requireShop(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new UnauthorizedError());
  if (!req.user.shop) return next(new ForbiddenError('No shop associated with this account'));
  next();
}

// Role-based authorization. Pass one or more allowed roles; the current user's
// role must be among them.
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
