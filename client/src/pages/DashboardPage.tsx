import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  ChartPie,
  Clock,
  Globe,
  Package,
  Plus,
  PlusCircle,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard';
import { orderService } from '@/services/orders';
import { kes, timeAgo } from '@/lib/format';
import { StatCard } from '@/components/dashboard/stat-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { ChannelChart } from '@/components/dashboard/channel-chart';
import { TopProducts } from '@/components/dashboard/top-products';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { InstallPwaButton } from '@/components/app/install-pwa-button';
import { ProductImage } from '@/components/ui/product-image';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/types';
import { ColoredIcon } from '@/components/ui/colored-icon';

type Range = '7' | '30' | '90' | 'custom';

const QUICK_ACTIONS = [
  { to: '/dashboard/sales', label: 'New sale', icon: PlusCircle, tone: 'orange' as const },
  { to: '/dashboard/products/new', label: 'Add product', icon: Plus, tone: 'blue' as const },
  { to: '/dashboard/stock', label: 'Add stock', icon: Boxes, tone: 'teal' as const },
  { to: '/dashboard/purchases', label: 'Create purchase', icon: Receipt, tone: 'purple' as const },
  { to: '/dashboard/orders', label: 'View orders', icon: ShoppingBag, tone: 'amber' as const },
  { to: '/dashboard/storefront', label: 'Manage storefront', icon: Store, tone: 'orange' as const },
];

const ORDER_TONE: Record<string, 'green' | 'amber' | 'red' | 'gray' | 'blue'> = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PROCESSING: 'blue',
  READY: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

function orderTone(status: string) {
  return ORDER_TONE[status] ?? 'gray';
}

export function DashboardPage() {
  const [range, setRange] = useState<Range>('7');
  const [from, setFrom] = useState<string>();
  const [to, setTo] = useState<string>();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard', range, from, to],
    queryFn: () => dashboardService.get(range === 'custom' ? 'custom' : range, range === 'custom' ? from : undefined, range === 'custom' ? to : undefined),
    enabled: range !== 'custom' || Boolean(from && to),
  });

  const recentOrders = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderService.list({ limit: 6 }),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Dashboard" subtitle="Your shop at a glance" />
        <div className="flex items-center gap-2">
          <InstallPwaButton />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="card card-hover group relative flex flex-col items-start gap-3 overflow-hidden p-3.5"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-7 -top-7 h-16 w-16 rounded-full blur-2xl bg-line/70"
            />
            <span className="flex w-full items-start justify-between">
              <ColoredIcon icon={a.icon} color={a.tone} size="md" className="transition-transform duration-200 group-hover:-translate-y-0.5" />
              <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="text-xs font-semibold text-ink">{a.label}</span>
          </Link>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {range === 'custom' && !(from && to) && (
        <Card className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">From</label>
            <input type="date" value={from ?? ''} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">To</label>
            <input type="date" value={to ?? ''} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
          </div>
        </Card>
      )}

      {data && (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard
              label="Today's sales"
              value={kes(data.stats.todayRevenue)}
              icon={ShoppingCart}
              hint={`${data.stats.todaySalesCount} sale${data.stats.todaySalesCount === 1 ? '' : 's'}`}
              tone="orange"
            />
            <StatCard
              label="Today's profit"
              value={kes(data.stats.todayProfit)}
              icon={TrendingUp}
              tone="green"
            />
            <StatCard
              label="Today's expenses"
              value={kes(data.stats.todayExpenses)}
              icon={Wallet}
              tone="red"
            />
            <StatCard
              label="Inventory value"
              value={kes(data.stats.inventoryValue)}
              icon={Wallet}
              tone="purple"
            />
            <StatCard
              label="Total products"
              value={String(data.stats.totalProducts)}
              icon={Package}
              tone="blue"
            />
            <StatCard
              label="Low stock"
              value={String(data.stats.lowStockCount)}
              icon={AlertTriangle}
              tone={data.stats.lowStockCount > 0 ? 'amber' : 'green'}
            />
            <StatCard
              label="Out of stock"
              value={String(data.outOfStock.length)}
              icon={Boxes}
              tone={data.outOfStock.length > 0 ? 'red' : 'green'}
              // Odd count (7) leaves an orphan in the 2-col mobile grid; span the
              // final card across both columns on phones so the row stays even.
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* Sales channels */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="POS revenue"
              value={kes(data.stats.todayPosRevenue)}
              icon={ShoppingCart}
              hint={`${data.stats.todayPosCount} in-store sale${data.stats.todayPosCount === 1 ? '' : 's'}`}
              tone="orange"
            />
            <StatCard
              label="Online revenue"
              value={kes(data.stats.todayOnlineRevenue)}
              icon={Globe}
              hint={`${data.stats.todayOnlineCount} order${data.stats.todayOnlineCount === 1 ? '' : 's'}`}
              tone="teal"
            />
            <Link
              to="/"
              className="card card-hover group relative flex items-center justify-between gap-3 overflow-hidden p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #F28C18 0%, #D96F00 60%, #B85900 100%)' }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-duka-300/20 blur-2xl"
              />
              <div className="relative min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-wide text-white/70">
                  Live storefront
                </p>
                <p className="mt-1.5 truncate text-lg font-bold">Open your shop</p>
                <p className="mt-0.5 truncate text-xs text-white/70">View your online storefront</p>
              </div>
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </Link>
          </div>

          {/* Sales chart */}
          <Card>
<CardHeader
            title="Sales"
            subtitle="Revenue over time"
            icon={BarChart3}
            iconTone="orange"
              action={
                <Tabs
                  items={[
                    { key: '7', label: '7 days' },
                    { key: '30', label: '30 days' },
                    { key: '90', label: '90 days' },
                    { key: 'custom', label: 'Custom' },
                  ]}
                  active={range}
                  onChange={(k) => setRange(k as Range)}
                />
              }
            />
            <div className="p-4">
              <SalesChart data={data.salesChart} />
            </div>
          </Card>

          {/* POS vs Online */}
          <Card>
<CardHeader
            title="POS vs Online"
            subtitle="Revenue by sales channel"
            icon={ChartPie}
            iconTone="blue"
              action={<Button variant="ghost" size="sm" onClick={() => refetch()}>Refresh</Button>}
            />
            <div className="p-4">
              <ChannelChart pos={data.posChart} online={data.onlineChart} />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Top products" subtitle="Best sellers by units sold" icon={Package} iconTone="purple" />
              <TopProducts items={data.topProducts} />
            </Card>

            <Card>
              <CardHeader title="Low stock alerts" subtitle="Reorder these soon" icon={AlertTriangle} iconTone="amber" />
              <LowStockAlert lowStock={data.lowStock} outOfStock={data.outOfStock} />
            </Card>
          </div>

          <Card>
            <CardHeader title="Recent activity" icon={Activity} iconTone="slate" />
            <RecentActivity items={data.activity} />
          </Card>

          {/* Recent orders */}
          <Card>
            <CardHeader
              title="Recent orders"
              subtitle="Your latest sales and orders"
              icon={ShoppingBag}
              iconTone="blue"
              action={
                <Link
                  to="/dashboard/orders"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <RecentOrdersCard
              orders={recentOrders.data?.orders}
              isLoading={recentOrders.isLoading}
            />
          </Card>
        </>
      )}
    </div>
  );
}

function RecentOrdersCard({ orders, isLoading }: { orders: Order[] | undefined; isLoading: boolean }) {
  const { shop } = useAuth();
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-line/50">
          <Clock className="h-5 w-5 text-muted" />
        </span>
        <p className="mt-2 text-sm font-medium text-ink">No recent orders</p>
        <p className="mt-0.5 text-xs text-muted">Your latest orders and sales will appear here.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line">
      {orders.map((o) => (
        <li key={o.id}>
          <Link
            to="/dashboard/orders"
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-line/30"
          >
            {o.items?.[0]?.product?.imageUrl ? (
              <ProductImage
                src={o.items[0].product.imageUrl}
                alt={o.items[0].product.name ?? ''}
                size={80}
                wrapperClassName="h-10 w-10 shrink-0 rounded-lg"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.12)] text-[#3B82F6]">
                <ShoppingBag className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-ink">{o.orderNumber}</span>
                {o.source === 'ONLINE' && <Badge tone="blue">Online</Badge>}
              </div>
              <p className="truncate text-xs text-muted">
                {o.customerName ?? 'Walk-in customer'} · {timeAgo(o.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-ink">{kes(o.totalAmount, shop?.currency)}</p>
              <Badge tone={orderTone(o.status)}>{o.status.toLowerCase()}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

