import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { saleService } from '@/services/sales';
import { SALE_FILTER_PERIODS } from '@/lib/constants';
import { kes, formatDateTime } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentMethod } from '@/types';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'CARD', label: 'Card' },
  { value: 'OTHER', label: 'Other' },
];

export function SalesHistoryPage() {
  const navigate = useNavigate();
  const { shop } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [period, setPeriod] = useState('');
  const [payment, setPayment] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sales', { page, limit, period, payment }],
    queryFn: () =>
      saleService.list({
        page,
        limit,
        period: period || undefined,
        paymentMethod: (payment || undefined) as PaymentMethod | undefined,
      }),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales history"
        subtitle="Transaction log for your shop"
        actions={
          <Button onClick={() => navigate('/dashboard/sales')}>New sale</Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="periodFilter"
          aria-label="Filter by period"
          placeholder="All time"
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
          options={SALE_FILTER_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
        />
        <Select
          name="paymentFilter"
          aria-label="Filter by payment method"
          placeholder="All payment methods"
          value={payment}
          onChange={(e) => { setPayment(e.target.value); setPage(1); }}
          options={METHODS}
        />
      </div>

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      )}
      {isError && <ErrorState onRetry={() => refetch()} message="We couldn't load your sales." />}
      {data && data.sales.length === 0 && (
        <Card>
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            iconTone="green"
            title="No sales found"
            description={
              period || payment
                ? 'Try adjusting your filters.'
                : 'Complete a sale to see it here.'
            }
            action={
              !(period || payment) && <Button onClick={() => navigate('/dashboard/sales')}>New sale</Button>
            }
          />
        </Card>
      )}

      {data && data.sales.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.sales.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/dashboard/history/${s.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-line/20"
                >
                  <ColoredIcon icon={Receipt} color="green" size="md" iconSizeClass="h-5 w-5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{s.receiptNumber}</p>
                    <p className="text-xs text-muted">
                      {s.items.reduce((n, i) => n + i.quantity, 0)} item
                      {s.items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'} · {formatDateTime(s.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ink">{kes(s.totalAmount, shop?.currency)}</p>
                    <MethodBadge method={s.paymentMethod} />
                  </div>
                </Link>
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
    </div>
  );
}

const METHOD_TONES: Record<PaymentMethod, 'green' | 'amber' | 'red' | 'blue'> = {
  CASH: 'green',
  MPESA: 'amber',
  CARD: 'blue',
  OTHER: 'red',
};

function MethodBadge({ method }: { method: PaymentMethod }) {
  return <Badge tone={METHOD_TONES[method]}>{METHODS.find((m) => m.value === method)?.label ?? method}</Badge>;
}
