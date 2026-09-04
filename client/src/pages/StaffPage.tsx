import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Power, RotateCcw, Phone, Mail, Users } from 'lucide-react';
import { staffService, type CreateStaffInput, type UpdateStaffInput } from '@/services/staff';
import { registerService } from '@/services/registers';
import type { Register, User, UserRole } from '@/types';
import { extractError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY: 'Inventory',
  ATTENDANT: 'Cashier',
};

const STATUS_TONES = { ACTIVE: 'green', INACTIVE: 'gray', SUSPENDED: 'amber' } as const;

export function StaffPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [confirming, setConfirming] = useState<{ user: User; action: 'deactivate' | 'reactivate' } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['staff', search, roleFilter, statusFilter],
    queryFn: () =>
      staffService.list({
        search: search || undefined,
        role: (roleFilter || undefined) as UserRole | undefined,
        status: (statusFilter || undefined) as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined,
        limit: 100,
      }),
  });

  const registers = useQuery({ queryKey: ['registers'], queryFn: registerService.list });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['registers'] });
  };

  const staff = data?.staff ?? [];

  const onSaved = (msg: string) => {
    toast(msg);
    invalidate();
    setEditing(null);
  };

  const performToggle = async () => {
    if (!confirming) return;
    try {
      const updated =
        confirming.action === 'deactivate'
          ? await staffService.deactivate(confirming.user.id)
          : await staffService.reactivate(confirming.user.id);
      toast(confirming.action === 'deactivate' ? 'Staff deactivated' : 'Staff reactivated');
      queryClient.setQueryData<User[]>(['staff'], (old) =>
        old ? old.map((s) => (s.id === updated.id ? updated : s)) : old,
      );
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff & Team"
        subtitle="Manage who can access your POS and what they can do"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            className="w-40"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'CASHIER', label: 'Cashier' },
              { value: 'INVENTORY', label: 'Inventory' },
            ]}
          />
          <Select
            className="w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'SUSPENDED', label: 'Suspended' },
            ]}
          />
        </div>
      </div>

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      )}
      {isError && (
        <Card className="p-6 text-center text-sm text-danger">
          Couldn't load staff.{' '}
          <button onClick={() => refetch()} className="font-medium text-brand hover:underline">
            Try again
          </button>
        </Card>
      )}
      {!isLoading && !isError && staff.length === 0 && (
        <Card>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            iconTone="purple"
            title="No staff yet"
            description="Add your team members so they can log in, operate registers, and track their sales."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" /> Add staff
              </Button>
            }
          />
        </Card>
      )}

      {!isLoading && !isError && staff.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-4 py-3">
                <Link to={`/dashboard/staff/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
                    {s.fullName?.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {s.fullName}
                      {s.id === me?.id && <span className="ml-1.5 text-xs font-medium text-brand">(you)</span>}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted">
                      {s.email && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" /> {s.email}
                        </span>
                      )}
                      {s.phone && (
                        <span className="hidden items-center gap-1 sm:inline-flex">
                          <Phone className="h-3 w-3" /> {s.phone}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
                <span className="hidden sm:block">
                  <Badge tone="blue">{ROLE_LABELS[s.role]}</Badge>
                </span>
                <span className="hidden text-xs text-muted md:block">
                  {s.register?.name ?? '—'} · {(s._count?.salesMade ?? 0)} sales
                </span>
                <Badge tone={STATUS_TONES[s.status]}>{s.status.toLowerCase()}</Badge>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${s.fullName}`}>
                      <span className="text-lg leading-none">•••</span>
                    </Button>
                  }
                >
                  {(close) => (
                    <>
                      <MenuItem
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => { close(); setEditing(s); }}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<Power className="h-4 w-4" />}
                        onClick={() => { close(); setConfirming({ user: s, action: 'deactivate' }); }}
                      >
                        Deactivate
                      </MenuItem>
                      <MenuItem
                        icon={<RotateCcw className="h-4 w-4" />}
                        onClick={() => { close(); setConfirming({ user: s, action: 'reactivate' }); }}
                      >
                        Reactivate
                      </MenuItem>
                      <MenuItem
                        icon={<Users className="h-4 w-4" />}
                        onClick={() => { close(); navigate(`/dashboard/staff/${s.id}`); }}
                      >
                        View profile
                      </MenuItem>
                    </>
                  )}
                </Dropdown>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editing && (
        <StaffForm
          member={editing === 'new' ? null : editing}
          registers={registers.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={performToggle}
        title={confirming?.action === 'deactivate' ? 'Deactivate staff?' : 'Reactivate staff?'}
        message={
          confirming?.action === 'deactivate'
            ? `"${confirming?.user.fullName}" won't be able to log in or use the POS until reactivated.`
            : `"${confirming?.user.fullName}" will regain access to the POS.`
        }
        confirmLabel={confirming?.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
      />
    </div>
  );
}

function StaffForm({
  member,
  registers,
  onClose,
  onSaved,
}: {
  member: User | null;
  registers: Register[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = Boolean(member);
  const [form, setForm] = useState<CreateStaffInput & UpdateStaffInput>({
    fullName: member?.fullName ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    userName: member?.userName ?? '',
    password: '',
    confirmPassword: '',
    role: member?.role && member.role !== 'OWNER' ? member.role : 'CASHIER',
    registerId: member?.registerId ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (!isEdit && (!form.password || form.password !== form.confirmPassword)) {
      setError('Password and confirmation are required and must match.');
      return;
    }
    setBusy(true);
    try {
      const base = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        userName: form.userName?.trim() || undefined,
        role: form.role,
        registerId: form.registerId || null,
      };
      if (isEdit && member) {
        await staffService.update(member.id, base);
        onSaved('Staff updated');
      } else {
        await staffService.create({ ...base, password: form.password, confirmPassword: form.confirmPassword });
        onSaved('Staff added');
      }
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit staff member' : 'Add staff member'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>{isEdit ? 'Save changes' : 'Add staff'}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Full name *" placeholder="e.g. Mary Wanjiku" value={form.fullName} onChange={set('fullName')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email *" type="email" placeholder="mary@shop.com" value={form.email} onChange={set('email')} />
          <Input label="Phone" type="tel" placeholder="+2547..." value={form.phone ?? ''} onChange={set('phone')} />
        </div>
        <Input
          label="Username (optional)"
          placeholder="Used for quick login"
          value={form.userName ?? ''}
          onChange={set('userName')}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Role *"
            value={form.role}
            onChange={set('role')}
            options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'CASHIER', label: 'Cashier' },
              { value: 'INVENTORY', label: 'Inventory' },
            ]}
          />
          <Select
            label="Register"
            value={form.registerId ?? ''}
            onChange={set('registerId')}
            placeholder="No register"
            options={registers.map((r) => ({ value: r.id, label: r.name }))}
          />
        </div>
        {!isEdit && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Password *" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
            <Input label="Confirm password *" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
          </div>
        )}
      </div>
    </Modal>
  );
}
