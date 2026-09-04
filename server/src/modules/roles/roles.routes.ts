import { Router } from 'express';
import { created, ok } from '../../lib/responses';
import { requireAuth, requireShop } from '../../middleware/auth';
import { requirePermission, PERMISSIONS, ALL_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_META } from '../../lib/permissions';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../utils/audit';
import { createRoleSchema, updateRoleSchema } from './roles.schema';
import {
  createRole,
  deleteRole,
  getRole,
  getStaffPermissionSummary,
  listRoles,
  setOverrides,
  updateRole,
} from './roles.service';

const router = Router();
router.use(requireAuth, requireShop);

// Permission catalog (for building roles in the UI). Readable by anyone who can
// view roles.
router.get('/catalog', requirePermission(PERMISSIONS.MANAGER_ROLES), (req, res) => {
  return ok(res, {
    permissions: ALL_PERMISSIONS,
    groups: PERMISSION_GROUPS,
    meta: PERMISSION_META,
  });
});

// List roles.
router.get('/', requirePermission(PERMISSIONS.MANAGER_ROLES), async (req, res, next) => {
  try {
    const roles = await listRoles(req.user!.shop!.id);
    return ok(res, { roles });
  } catch (error) {
    next(error);
  }
});

// Get the permission summary + overrides for a specific staff member. Used by
// the staff permissions view. Only users who can view staff or roles.
router.get(
  '/staff/:userId/permissions',
  requirePermission(PERMISSIONS.MANAGER_ROLES, PERMISSIONS.STAFF_VIEW),
  async (req, res, next) => {
    try {
      const summary = await getStaffPermissionSummary(req.user!.shop!.id, req.params.userId);
      return ok(res, { summary });
    } catch (error) {
      next(error);
    }
  },
);

// Replace a staff member's permission overrides (granted/denied).
router.put('/staff/:userId/overrides', requirePermission(PERMISSIONS.ROLES_EDIT), async (req, res, next) => {
  try {
    const body = req.body as { granted?: string[]; denied?: string[] };
    const summary = await setOverrides(req.user!.shop!.id, req.params.userId, {
      granted: body.granted,
      denied: body.denied,
    });
    await auditLog({ action: 'STAFF_PERMISSIONS_UPDATED', entityType: 'User', entityId: req.params.userId, metadata: { granted: body.granted ?? [], denied: body.denied ?? [] }, req });
    return ok(res, { summary });
  } catch (error) {
    next(error);
  }
});

// Create a custom role.
router.post('/', requirePermission(PERMISSIONS.ROLES_CREATE), validate(createRoleSchema), async (req, res, next) => {
  try {
    const role = await createRole(req.user!.shop!.id, req.body as any);
    await auditLog({ action: 'ROLE_CREATED', entityType: 'Role', entityId: role.id, metadata: { name: role.name }, req });
    return created(res, { role });
  } catch (error) {
    next(error);
  }
});

// Get one role.
router.get('/:id', requirePermission(PERMISSIONS.MANAGER_ROLES), async (req, res, next) => {
  try {
    const role = await getRole(req.user!.shop!.id, req.params.id);
    return ok(res, { role });
  } catch (error) {
    next(error);
  }
});

// Update a role (name, description, permissions, limits).
router.patch('/:id', requirePermission(PERMISSIONS.ROLES_EDIT), validate(updateRoleSchema), async (req, res, next) => {
  try {
    const role = await updateRole(req.user!.shop!.id, req.params.id, req.body as any);
    await auditLog({ action: 'ROLE_UPDATED', entityType: 'Role', entityId: role.id, metadata: { name: role.name }, req });
    return ok(res, { role });
  } catch (error) {
    next(error);
  }
});

// Delete a custom role (protected system roles cannot be deleted).
router.delete('/:id', requirePermission(PERMISSIONS.ROLES_DELETE), async (req, res, next) => {
  try {
    const result = await deleteRole(req.user!.shop!.id, req.params.id, req.user!.id);
    await auditLog({ action: 'ROLE_DELETED', entityType: 'Role', entityId: result.id, req });
    return ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
