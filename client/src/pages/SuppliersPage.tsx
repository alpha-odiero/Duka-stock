import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Truck, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { supplierService } from '@/services/suppliers';
import type { SupplierInput } from '@/services/suppliers';
import type { Supplier } from '@/types';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';

export function SuppliersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['suppliers'] });

  const onSaved = (msg: string) => {
    toast(msg);
    invalidate();
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suppliers"
        subtitle="Who you buy from"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> New supplier
          </Button>
        }
      />

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      )}
      {isError && (
        <Card className="p-6 text-center text-sm text-danger">
          Couldn't load suppliers.{' '}
          <button onClick={() => refetch()} className="font-medium text-brand hover:underline">
            Try again
          </button>
        </Card>
      )}
      {data && data.length === 0 && (
        <Card>
          <EmptyState
            icon={<Truck className="h-6 w-6" />}
            iconTone="slate"
            title="No suppliers yet"
            description="Add the people and businesses you buy stock from to record purchases against them."
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" /> Add a supplier
              </Button>
            }
          />
        </Card>
      )}

      {data && data.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-4 py-3">
                <ColoredIcon icon={Truck} color="slate" size="md" iconSizeClass="h-5 w-5" />
                <Link to={`/dashboard/suppliers/${s.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink hover:text-brand">
                    {s.name}
                  </p>
                  <p className="flex items-center gap-3 text-xs text-muted">
                    {s.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {s.phone}
                      </span>
                    )}
                    {s.email && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3" /> {s.email}
                      </span>
                    )}
                  </p>
                </Link>
                <span className="hidden text-xs text-muted sm:block">
                  {(s._count?.products ?? 0)} products
                </span>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${s.name}`}>
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
                        icon={<Trash2 className="h-4 w-4" />}
                        danger
                        onClick={() => { close(); setDeleting(s); }}
                      >
                        Delete
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
        <SupplierForm
          supplier={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await supplierService.remove(deleting.id);
            toast('Supplier deleted');
            invalidate();
          } catch (err) {
            toast(extractError(err).message, { type: 'error' });
          } finally {
            setDeleting(null);
          }
        }}
        title="Delete supplier?"
        message={`"${deleting?.name}" will be removed. Suppliers with existing purchases can't be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function SupplierForm({
  supplier,
  onClose,
  onSaved,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = Boolean(supplier);
  const [form, setForm] = useState<SupplierInput>({
    name: supplier?.name ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    notes: supplier?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof SupplierInput) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError('Supplier name is required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };
      if (isEdit && supplier) {
        await supplierService.update(supplier.id, payload);
        onSaved('Supplier updated');
      } else {
        await supplierService.create(payload);
        onSaved('Supplier added');
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
      title={isEdit ? 'Edit supplier' : 'New supplier'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>Save</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Name *" placeholder="e.g. Nakuru Wholesalers" value={form.name} onChange={set('name')} />
        <Input label="Phone" type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set('phone')} />
        <Input label="Email" type="email" placeholder="sales@example.com" value={form.email} onChange={set('email')} />
        <Input label="Address" placeholder="Town / street" value={form.address} onChange={set('address')} />
        <Textarea label="Notes (optional)" placeholder="Any notes about this supplier" value={form.notes} onChange={set('notes')} />
      </div>
    </Modal>
  );
}
