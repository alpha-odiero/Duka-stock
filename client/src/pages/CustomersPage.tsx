import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2, User } from 'lucide-react';
import { customerService } from '@/services/customers';
import type { CustomerListItem } from '@/services/customers';
import type { Customer } from '@/types';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Enter a valid email').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerListItem | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const customers = useQuery({
    queryKey: ['customers', { page, limit, search }],
    queryFn: () => customerService.list({ page, limit, search: search || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const openCreate = () => {
    setEditing(null);
    setServerError(null);
    reset({ name: '', phone: '', email: '', address: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (c: CustomerListItem) => {
    setEditing(c);
    setServerError(null);
    reset({
      name: c.name,
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      notes: c.notes ?? '',
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        address: values.address?.trim() || null,
        notes: values.notes?.trim() || null,
      };
      return editing ? customerService.update(editing.id, payload) : customerService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast(editing ? 'Customer updated' : 'Customer added');
      setModalOpen(false);
    },
    onError: (err) => setServerError(extractError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast('Customer deleted');
      setDeleting(null);
    },
    onError: (err) => {
      toast(extractError(err).message, { type: 'error' });
      setDeleting(null);
    },
  });

  const data = customers.data;
  const list = data?.customers ?? [];

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    saveMutation.mutate(values);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        subtitle="Manage your customers and their order history"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add customer
          </Button>
        }
      />

      <div className="max-w-sm">
        <SearchInput
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search customers"
        />
      </div>

      {customers.isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </Card>
      )}
      {customers.isError && <ErrorState onRetry={() => customers.refetch()} />}
      {customers.data && list.length === 0 && (
        <Card>
          <EmptyState
            icon={<User className="h-6 w-6" />}
            iconTone="teal"
            title="No customers yet"
            description="Add your first customer, or they'll be captured automatically when they place an online order."
          />
        </Card>
      )}

      {list.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {list.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                  <p className="truncate text-xs text-muted">
                    {[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact'}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted">{c._count?.sales ?? 0} sales</p>
                  <p className="text-xs text-muted">{c._count?.orders ?? 0} orders</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-md p-2 text-muted hover:bg-line/50 hover:text-ink"
                    aria-label={`Edit ${c.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    className="rounded-md p-2 text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {data && (
            <div className="border-t border-line p-4">
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit customer' : 'Add customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {serverError}
            </div>
          )}
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" placeholder="+2547..." error={errors.phone?.message} {...register('phone')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <Input
            label="Address"
            placeholder="Physical address or delivery area"
            error={errors.address?.message}
            {...register('address')}
          />
          <Textarea label="Notes (optional)" error={errors.notes?.message} {...register('notes')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting || saveMutation.isPending}>
              {editing ? 'Save changes' : 'Add customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete customer"
        message={`Are you sure you want to delete ${deleting?.name ?? 'this customer'}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
