import type { User, Shop, Register } from '@prisma/client';
import type { ResolvedPermissions } from '../lib/permissions';

// Augment Express Request with authenticated user/shop context and the user's
// resolved permission set (computed once by requireAuth from role + overrides).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'shopId' | 'status'> & {
        roleId?: string | null;
        shop?: Shop | null;
        register?: Register | null;
      };
      // Effective permission keys (Set) + limits resolved from the user's role
      // and any per-user overrides. Attached by requireAuth.
      permissions?: Set<string>;
      permissionInfo?: ResolvedPermissions;
    }
  }
}

export {};
