import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, ShoppingBag } from 'lucide-react';
import { orderService } from '@/services/orders';
import { ORDER_STATUSES } from '@/lib/constants';
import { kes, timeAgo } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { ProductImage } from '@/components/ui/product-image';
import type { Order, OrderStatus } from '@/types';

const STATUS_TONE: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PROCESSING: 'blue',
  READY: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

function statusTone(status: string) {
  return STATUS_TONE[status] ?? 'gray';
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { shop } = useAuth();
  const [tab, setTab] = useState<'all' | 'recent'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const orders = useQuery({
    queryKey: ['orders', { tab, page, limit, search, status }],
    queryFn: () => orderService.list({ page, limit, search: search || undefined, status: status || undefined }),
  });

  const recent = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderService.list({ limit: 8 }),
    staleTime: 30_000,
  });

  const data = orders.data;
  const list = useMemo(() => data?.orders ?? [], [data]);

  const switchTab = (key: string) => {
    setTab(key as 'all' | 'recent');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        subtitle="Track and manage orders from your storefront and POS"
        actions={
          <Tabs
            items={[
              { key: 'all', label: 'All orders' },
              { key: 'recent', label: 'Recent orders' },
            ]}
            active={tab}
            onChange={switchTab}
          />
        }
      />

      {tab === 'all' ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <SearchInput
                placeholder="Search by order number or customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                aria-label="Search orders"
              />
            </div>
            <div className="sm:w-56">
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as OrderStatus | '');
                  setPage(1);
                }}
                placeholder="All statuses"
                options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
          </div>

          {orders.isLoading && (
            <Card className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8" />
            </Card>
          )}
          {orders.isError && <ErrorState onRetry={() => orders.refetch()} />}
          {orders.data && list.length === 0 && (
            <Card>
              <EmptyState
                icon={<ShoppingBag className="h-6 w-6" />}
                iconTone="blue"
                title="No orders yet"
                description="Orders placed on your online storefront will appear here."
              />
            </Card>
          )}

          {list.length > 0 && (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {list.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => navigate(`/dashboard/orders/${o.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-line/30"
                    >
                      {o.items?.[0]?.product?.imageUrl ? (
                        <ProductImage
                          src={o.items[0].product.imageUrl}
                          alt={o.items[0].product.name ?? ''}
                          size={80}
                          wrapperClassName="h-10 w-10 shrink-0 rounded-lg"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.12)] text-[#3B82F6]">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{o.orderNumber}</span>
                          {o.source === 'ONLINE' && <Badge tone="blue">Online</Badge>}
                        </div>
                        <p className="truncate text-xs text-muted">
                          {o.customerName ?? 'Walk-in customer'}
                          {o.customerPhone ? ` · ${o.customerPhone}` : ''}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-bold text-ink">{kes(o.totalAmount, shop?.currency)}</p>
                        <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex w-28 justify-end">
                        <Badge tone={statusTone(o.status)}>{o.status.toLowerCase()}</Badge>
                      </div>
                    </button>
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
        </>
      ) : (
        <RecentOrders
          data={recent.data}
          isLoading={recent.isLoading}
          isError={recent.isError}
          onRetry={() => recent.refetch()}
        />
      )}
    </div>
  );
}

function RecentOrders({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: { orders: Order[] } | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const navigate = useNavigate();
  const { shop } = useAuth();

  if (isLoading) {
    return (
      <Card className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-line/40" />
        ))}
      </Card>
    );
  }
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (!data || data.orders.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          iconTone="blue"
          title="No recent orders"
          description="Your latest orders and sales will appear here as a quick overview."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-line">
        {data.orders.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => navigate(`/dashboard/orders/${o.id}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-line/30"
            >
              {o.items?.[0]?.product?.imageUrl ? (
                <ProductImage
                  src={o.items[0].product.imageUrl}
                  alt={o.items[0].product.name ?? ''}
                  size={80}
                  wrapperClassName="h-10 w-10 shrink-0 rounded-lg"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.12)] text-[#3B82F6]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{o.orderNumber}</span>
                  {o.source === 'ONLINE' && <Badge tone="blue">Online</Badge>}
                </div>
                <p className="truncate text-xs text-muted">
                  {o.customerName ?? 'Walk-in customer'} · {timeAgo(o.createdAt)}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-ink">{kes(o.totalAmount, shop?.currency)}</p>
              </div>
              <div className="flex w-28 justify-end">
                <Badge tone={statusTone(o.status)}>{o.status.toLowerCase()}</Badge>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

