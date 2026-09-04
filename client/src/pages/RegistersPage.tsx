import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Monitor, Pencil, DollarSign } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { registerService, type CreateRegisterInput } from '@/services/registers';
import { staffService } from '@/services/staff';
import type { Register, RegisterStatus, User } from '@/types';
import { extractError } from '@/lib/api';
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
import { Dropdown, MenuItem } from '@/components/ui/dropdown';

const STATUS_TONES = { ACTIVE: 'green', INACTIVE: 'gray', OFFLINE: 'amber' } as const;

export function RegistersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Register | 'new' | null>(null);

  const registers = useQuery({ queryKey: ['registers'], queryFn: registerService.list });
  const staff = useQuery({
    queryKey: ['staff', 'assignable'],
    queryFn: () => staffService.list({ status: 'ACTIVE', limit: 100 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['registers'] });
    queryClient.invalidateQueries({ queryKey: ['staff'] });
  };

  const registrations = registers.data ?? [];
  const assignableStaff: User[] = (staff.data?.staff ?? []).filter((s) => s.role === 'CASHIER' || s.role === 'MANAGER' || s.role === 'ADMIN');

  const onSaved = (msg: string) => {
    toast(msg);
    invalidate();
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Registers"
        subtitle="Point-of-sale terminals and their assigned cashiers"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> New register
          </Button>
        }
      />

      {registers.isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}
      {registers.isError && (
        <Card className="p-6 text-center text-sm text-danger">
          Couldn't load registers.{' '}
          <button onClick={() => registers.refetch()} className="font-medium text-brand hover:underline">Try again</button>
        </Card>
      )}
      {!registers.isLoading && !registers.isError && registrations.length === 0 && (
        <Card>
          <EmptyState
            icon={<Monitor className="h-6 w-6" />}
            iconTone="slate"
            title="No registers yet"
            description="Create registers for each physical POS terminal and assign a cashier."
            action={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New register</Button>}
          />
        </Card>
      )}

      {!registers.isLoading && !registers.isError && registrations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((r) => {
            const cashierCount = registerCashierCount(r);
            return (
              <Card key={r.id} className="flex flex-col p-4">
                <div className="mb-3 flex items-center justify-between">
                  <ColoredIcon icon={Monitor} color="slate" size="lg" iconSizeClass="h-5 w-5" />
                  <Badge tone={STATUS_TONES[r.status]}>{r.status.toLowerCase()}</Badge>
                </div>
                <h3 className="text-base font-bold text-ink">{r.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <DollarSign className="h-3.5 w-3.5" /> {(r._count?.sales ?? 0)} sales · {cashierCount} cashier{cashierCount === 1 ? '' : 's'}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-xs text-muted">{r.assignedUserId ? 'Assigned' : 'No assigned cashier'}</span>
                  <Dropdown
                    trigger={<Button variant="ghost" size="icon" aria-label={`Actions for ${r.name}`}><span className="text-lg leading-none">•••</span></Button>}
                  >
                    {(close) => (
                      <MenuItem icon={<Pencil className="h-4 w-4" />} onClick={() => { close(); setEditing(r); }}>
                        Edit / assign
                      </MenuItem>
                    )}
                  </Dropdown>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing && (
        <RegisterForm
          register={editing === 'new' ? null : editing}
          assignableStaff={assignableStaff}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function registerCashierCount(r: Register): number {
  if (r.staff && Array.isArray(r.staff)) return r.staff.length;
  if (r.assignedUserId) return 1;
  return 0;
}

function RegisterForm({
  register,
  assignableStaff,
  onClose,
  onSaved,
}: {
  register: Register | null;
  assignableStaff: User[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = Boolean(register);
  const [name, setName] = useState(register?.name ?? '');
  const [status, setStatus] = useState<RegisterStatus>(register?.status ?? 'ACTIVE');
  const [assignedUserId, setAssignedUserId] = useState(register?.assignedUserId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      setError('Register name is required.');
      return;
    }
    setBusy(true);
    try {
      const payload: CreateRegisterInput = {
        name: name.trim(),
        status,
        assignedUserId: assignedUserId || null,
      };
      if (isEdit && register) {
        await registerService.update(register.id, payload);
        onSaved('Register updated');
      } else {
        await registerService.create(payload);
        onSaved('Register created');
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
      title={isEdit ? 'Edit register' : 'New register'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>{isEdit ? 'Save changes' : 'Create register'}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <Input label="Register name *" placeholder="e.g. Front counter / Till 1" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as RegisterStatus)}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'OFFLINE', label: 'Offline' },
          ]}
        />
        <Select
          label="Assigned cashier"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          placeholder="None"
          options={assignableStaff.map((s) => ({ value: s.id, label: s.fullName }))}
        />
      </div>
    </Modal>
  );
}
