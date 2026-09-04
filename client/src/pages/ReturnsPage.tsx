import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, Check, Plus, RotateCcw, X } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { returnsService } from '@/services/returns';
import { saleService } from '@/services/sales';
import { kes, formatDate, formatDateTime } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PERMISSIONS } from '@/lib/permissions';
import type { RefundMethod, ReturnCondition, SalesReturn, Sale } from '@/types';

const REFUND_METHODS: { value: RefundMethod; label: string }[] = [
  { value: 'ORIGINAL', label: 'Original payment method' },
  { value: 'CASH', label: 'Cash' },
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK', label: 'Bank transfer' },
  { value: 'STORE_CREDIT', label: 'Store credit' },
];

const CONDITIONS: { value: ReturnCondition; label: string }[] = [
  { value: 'MINT', label: 'Mint' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
];

function returnTone(status: SalesReturn['status']) {
  switch (status) {
    case 'PENDING':
      return 'amber' as const;
    case 'APPROVED':
    case 'PROCESSING':
      return 'blue' as const;
    case 'COMPLETED':
      return 'green' as const;
    case 'REJECTED':
      return 'red' as const;
  }
}

function refundTone(status: string) {
  switch (status) {
    case 'PENDING':
      return 'amber' as const;
    case 'APPROVED':
    case 'PROCESSING':
      return 'blue' as const;
    case 'COMPLETED':
      return 'green' as const;
    case 'FAILED':
      return 'red' as const;
    default:
      return 'gray' as const;
  }
}

export function ReturnsPage() {
  const { can } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('returns');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refundPage, setRefundPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const canCreate = can(PERMISSIONS.RETURNS_CREATE);
  const canApprove = can(PERMISSIONS.RETURNS_APPROVE);

  const returns = useQuery({
    queryKey: ['returns', { page, status }],
    queryFn: () =>
      returnsService.list({ page, limit: 20, status: (status || undefined) as SalesReturn['status'] | undefined }),
    enabled: tab === 'returns',
  });

  const refunds = useQuery({
    queryKey: ['refunds', { page: refundPage }],
    queryFn: () => returnsService.refunds({ page: refundPage, limit: 20 }),
    enabled: tab === 'refunds',
  });

  const detail = useQuery({
    queryKey: ['return', detailId],
    queryFn: () => returnsService.get(detailId as string),
    enabled: Boolean(detailId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['returns'] });
    queryClient.invalidateQueries({ queryKey: ['refunds'] });
    queryClient.invalidateQueries({ queryKey: ['sale'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Returns & Refunds"
        subtitle="Process product returns and track refunds"
        actions={
          canCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> New return
            </Button>
          ) : undefined
        }
      />

      <Tabs
        items={[
          { key: 'returns', label: 'Returns' },
          { key: 'refunds', label: 'Refunds' },
        ]}
        active={tab}
        onChange={(key) => setTab(key)}
      />

      {tab === 'returns' && (
        <div className="space-y-4">
          <Select
            name="returnStatus"
            aria-label="Filter by status"
            placeholder="All statuses"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={[
              { value: 'PENDING', label: 'Pending approval' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />

          {returns.isLoading && (
            <Card className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </Card>
          )}
          {returns.isError && <ErrorState onRetry={() => returns.refetch()} message="We couldn't load your returns." />}
          {returns.data && returns.data.returns.length === 0 && (
            <Card>
              <EmptyState
                icon={<RotateCcw className="h-6 w-6" />}
                iconTone="red"
                title="No returns yet"
                description="Process a return to restock items and refund the customer."
                action={canCreate ? <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New return</Button> : undefined}
              />
            </Card>
          )}

          {returns.data && returns.data.returns.length > 0 && (
            <Card>
              <ul className="divide-y divide-line">
                {returns.data.returns.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <button onClick={() => setDetailId(r.id)} className="flex w-full items-center justify-between gap-3 text-left">
                      <div className="flex min-w-0 items-center gap-3">
                        <ColoredIcon icon={RotateCcw} color="red" size="md" iconSizeClass="h-5 w-5" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {r.returnNumber}
                            {r.sale?.receiptNumber ? (
                              <span className="font-normal text-muted"> · {r.sale.receiptNumber}</span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {formatDateTime(r.createdAt)} ·{' '}
                            {r.items.reduce((n, i) => n + i.quantity, 0)} item
                            {r.items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-ink">{kes(r.refunds[0]?.amount ?? 0)}</p>
                          <p className="text-xs text-muted">{r.refunds[0]?.refundMethod ?? '—'}</p>
                        </div>
                        <Badge tone={returnTone(r.status)}>{r.status}</Badge>
                      </div>
                    </button>
                    {r.status === 'PENDING' && canApprove && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await returnsService.approve(r.id, true);
                            toast('Return approved, stock restored');
                            invalidate();
                          }}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await returnsService.approve(r.id, false);
                            toast('Return rejected', { type: 'info' });
                            invalidate();
                          }}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <Pagination
                page={page}
                totalPages={returns.data.pagination.totalPages}
                total={returns.data.pagination.total}
                onPageChange={setPage}
              />
            </Card>
          )}
        </div>
      )}

      {tab === 'refunds' && (
        <Card>
          {refunds.isLoading && (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}
          {refunds.isError && <ErrorState onRetry={() => refunds.refetch()} message="We couldn't load your refunds." />}
          {refunds.data && refunds.data.refunds.length === 0 && (
            <EmptyState
              icon={<Banknote className="h-6 w-6" />}
              iconTone="slate"
              title="No refunds yet"
              description="Money returned to customers will appear here."
            />
          )}
          {refunds.data && refunds.data.refunds.length > 0 && (
            <>
              <ul className="divide-y divide-line">
                {refunds.data.refunds.map((f) => (
                  <li key={f.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ColoredIcon icon={Banknote} color="green" size="md" iconSizeClass="h-5 w-5" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{f.refundNumber}</p>
                          <p className="truncate text-xs text-muted">
                            {f.return?.returnNumber ?? '—'} · {f.sale?.receiptNumber ?? '—'} ·{' '}
                            {formatDate(f.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-ink">{kes(f.amount)}</p>
                          <p className="text-xs text-muted">{f.refundMethod}</p>
                        </div>
                        <Badge tone={refundTone(f.status)}>{f.status}</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination
                page={refundPage}
                totalPages={refunds.data.pagination.totalPages}
                total={refunds.data.pagination.total}
                onPageChange={setRefundPage}
              />
            </>
          )}
        </Card>
      )}

      {showCreate && (
        <CreateReturnModal
          onClose={() => setShowCreate(false)}
          onDone={(msg) => {
            toast(msg);
            invalidate();
            setShowCreate(false);
          }}
        />
      )}

      {detailId && detail.data && (
        <ReturnDetailModal
          ret={detail.data}
          canApprove={canApprove}
          onClose={() => setDetailId(null)}
          onAction={(msg) => {
            toast(msg);
            queryClient.removeQueries({ queryKey: ['return', detailId] });
            invalidate();
            setDetailId(null);
          }}
        />
      )}
    </div>
  );
}

function ReturnDetailModal({
  ret,
  canApprove,
  onClose,
  onAction,
}: {
  ret: SalesReturn;
  canApprove: boolean;
  onClose: () => void;
  onAction: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const status = ret.status;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`${ret.returnNumber} — ${ret.status}`}
      footer={
        status === 'PENDING' && canApprove ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await returnsService.approve(ret.id, false);
                  onAction('Return rejected');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await returnsService.approve(ret.id, true);
                  onAction('Return approved, stock restored');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Check className="h-4 w-4" /> Approve & refund
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="text-muted">
            Sale: <span className="font-medium text-ink">{ret.sale?.receiptNumber ?? '—'}</span>
          </p>
          <p className="text-muted">
            Created: <span className="font-medium text-ink">{formatDateTime(ret.createdAt)}</span>
          </p>
          <p className="text-muted">
            Condition: <span className="font-medium text-ink">{ret.condition}</span>
          </p>
          <p className="text-muted">
            Refund: <span className="font-medium text-ink">{kes(ret.refunds[0]?.amount ?? 0)}</span>
          </p>
        </div>
        {ret.notes && (
          <p className="rounded-lg bg-line/40 px-3 py-2 text-sm text-muted">{ret.notes}</p>
        )}

        <div>
          <span className="label">Items returned</span>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {ret.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium text-ink">
                  {i.quantity}× {i.product?.name ?? 'Product'}
                </span>
                <span className="text-muted">{kes(i.subtotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="label">Refunds</span>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {ret.refunds.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-ink">{f.refundNumber}</p>
                  <p className="text-xs text-muted">{f.refundMethod} · {formatDateTime(f.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{kes(f.amount)}</span>
                  <Badge tone={refundTone(f.status)}>{f.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function CreateReturnModal({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const { shop } = useAuth();
  const [saleId, setSaleId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('ORIGINAL');
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState<Record<string, ReturnCondition>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sales = useQuery({
    queryKey: ['sales', 'return-picker'],
    queryFn: () => saleService.list({ page: 1, limit: 50 }),
  });

  const sale: Sale | undefined = useMemo(
    () => sales.data?.sales.find((s) => s.id === saleId),
    [sales.data, saleId],
  );

  const results = useMemo(() => {
    const all = (sales.data?.sales ?? []).filter((s) => s.paymentStatus !== 'REFUNDED');
    if (!search.trim()) return all.slice(0, 30);
    const q = search.toLowerCase();
    return all
      .filter((s) => s.receiptNumber.toLowerCase().includes(q))
      .slice(0, 30);
  }, [sales.data, search]);

  const items = useMemo(
    () => (sale ? sale.items.filter((i) => Number(i.subtotal) > 0) : []),
    [sale],
  );

  const total = items.reduce((sum, i) => sum + Number(qty[i.id] || 0) * Number(i.unitPrice || 0), 0);

  const submit = async () => {
    setError(null);
    if (!saleId) {
      setError('Pick a sale to process the return against.');
      return;
    }
    const payload = items
      .filter((i) => Number(qty[i.id] || 0) > 0)
      .map((i) => ({
        saleItemId: i.id,
        quantity: Number(qty[i.id]),
        condition: condition[i.id] ?? ('GOOD' as const),
      }));
    if (payload.length === 0) {
      setError('Enter a quantity for at least one item.');
      return;
    }
    setBusy(true);
    try {
      const res = await returnsService.create({
        saleId,
        items: payload,
        refundMethod,
        notes: notes.trim() || undefined,
      });
      onDone(
        res.requiresApproval
          ? 'Return submitted — pending approval'
          : `Return processed · ${kes(res.return.refunds[0]?.amount ?? 0)} refunded`,
      );
    } catch (err) {
      setError(extractError(err).message);
      setBusy(false);
    }
  };

  if (!saleId && !items.length) {
    // Pick-a-sale step
    return (
      <Modal
        open
        onClose={onClose}
        size="lg"
        title="New return"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
          <Input
            label="Search sale"
            placeholder="Search by receipt number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
            {results.length === 0 && <p className="px-3 py-2 text-sm text-muted">No sales found.</p>}
            {results.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSaleId(s.id); setSearch(''); }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-line/30"
              >
                <span className="font-medium text-ink">{s.receiptNumber}</span>
                <span className="text-muted">
                  {formatDate(s.createdAt)} · {kes(s.totalAmount, shop?.currency)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title="New return"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted">
            Refund total: <strong className="text-ink">{kes(total, shop?.currency)}</strong>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={submit} loading={busy}>Submit return</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-line/40 px-3 py-2 text-sm">
          <span className="font-semibold text-ink">{sale?.receiptNumber ?? '—'}</span>
          <button
            onClick={() => { setSaleId(null); setQty({}); setCondition({}); }}
            className="text-muted underline hover:text-ink"
          >
            Change sale
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Refund method"
            name="refundMethod"
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value as RefundMethod)}
            options={REFUND_METHODS}
          />
          <div className="flex items-end pb-0.5 text-xs text-muted">
            Stock is restored when the return is approved.
          </div>
        </div>

        <div>
          <span className="label">Items to return</span>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {i.product?.name ?? 'Product'} · {kes(i.unitPrice)}
                  </p>
                  <p className="text-xs text-muted">Sold: {i.quantity}</p>
                </div>
                <Input
                  aria-label={`Quantity to return of ${i.product?.name ?? 'item'}`}
                  type="number"
                  min={0}
                  max={i.quantity}
                  className="w-20"
                  placeholder="0"
                  value={qty[i.id] ?? ''}
                  onChange={(e) => setQty((prev) => ({ ...prev, [i.id]: e.target.value }))}
                />
                <Select
                  aria-label={`Condition of ${i.product?.name ?? 'item'}`}
                  name={`condition-${i.id}`}
                  className="w-32"
                  value={condition[i.id] ?? 'GOOD'}
                  onChange={(e) => setCondition((prev) => ({ ...prev, [i.id]: e.target.value as ReturnCondition }))}
                  options={CONDITIONS}
                />
              </li>
            ))}
          </ul>
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Customer changed mind, box unopened"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}