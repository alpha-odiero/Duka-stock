import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Wallet, Pencil, Trash2 } from 'lucide-react';
import { expenseService } from '@/services/expenses';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { kes, formatDate } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown, MenuItem } from '@/components/ui/dropdown';
import type { Expense, ExpenseCategory } from '@/types';

const NUM_TO_LABEL = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.value.toLowerCase(), c.label]));

export function ExpensesPage() {
  const { shop } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses', { page, category }],
    queryFn: () =>
      expenseService.list({ page, limit: 20, category: (category || undefined) as ExpenseCategory | undefined }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const categoryLabel = (key: string) => NUM_TO_LABEL[key.toLowerCase()] ?? key;

  const total = (data?.expenses ?? []).reduce((n, e) => n + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Expenses"
        subtitle="Track your business costs"
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> New expense
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="expenseCategoryFilter"
          aria-label="Filter by category"
          placeholder="All categories"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        />
        {!!total && <div className="flex items-center justify-end pr-2 text-sm text-muted">Page total: <strong className="ml-1 text-ink">{kes(total, shop?.currency)}</strong></div>}
      </div>

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      )}
      {isError && <ErrorState onRetry={() => refetch()} message="We couldn't load your expenses." />}
      {data && data.expenses.length === 0 && (
        <Card>
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            iconTone="red"
            title="No expenses yet"
            description="Record rent, salaries, transport and other costs to see your real profit."
            action={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New expense</Button>}
          />
        </Card>
      )}

      {data && data.expenses.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{e.description || categoryLabel(e.category)}</p>
                  <p className="text-xs text-muted">
                    <span className="font-medium text-ink">{categoryLabel(e.category)}</span> · {formatDate(e.expenseDate)}
                  </p>
                </div>
                <span className="font-semibold text-ink">{kes(e.amount, shop?.currency)}</span>
                <Dropdown
                  trigger={<Button variant="ghost" size="icon" aria-label="Expense actions"><span className="text-lg leading-none">•••</span></Button>}
                >
                  {(close) => (
                    <>
                      <MenuItem icon={<Pencil className="h-4 w-4" />} onClick={() => { close(); setEditing(e); }}>Edit</MenuItem>
                      <MenuItem icon={<Trash2 className="h-4 w-4" />} danger onClick={() => { close(); setDeleting(e); }}>Delete</MenuItem>
                    </>
                  )}
                </Dropdown>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onPageChange={setPage}
          />
        </Card>
      )}

      {editing && (
        <ExpenseForm
          expense={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            toast(msg);
            invalidate();
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await expenseService.remove(deleting.id);
            toast('Expense deleted');
            invalidate();
          } catch (err) {
            toast(extractError(err).message, { type: 'error' });
          } finally {
            setDeleting(null);
          }
        }}
        title="Delete expense?"
        message="This expense will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

function ExpenseForm({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = Boolean(expense);
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'OTHER');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState(expense?.amount ?? '');
  const [date, setDate] = useState((expense?.expenseDate ?? new Date().toISOString()).slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setBusy(true);
    try {
      const payload = { category, description: description.trim(), amount: String(amt), expenseDate: date || undefined };
      if (isEdit && expense) {
        await expenseService.update(expense.id, payload);
        onSaved('Expense updated');
      } else {
        await expenseService.create(payload);
        onSaved('Expense added');
      }
    } catch (err) {
      setError(extractError(err).message);
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit expense' : 'New expense'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>Save</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <Select
          label="Category"
          name="expenseCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        />
        <Input label="Description *" placeholder="e.g. Monthly rent" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount *" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
