import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ClipboardList, Truck, Package } from 'lucide-react';
import { reportService } from '@/services/reports';
import { REPORT_PERIODS } from '@/lib/constants';
import { kes } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentMethod } from '@/types';

type Section = 'sales' | 'inventory' | 'profit' | 'purchases';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'profit', label: 'Profit' },
  { key: 'purchases', label: 'Purchases' },
];

export function ReportsPage() {
  const { shop } = useAuth();
  const [section, setSection] = useState<Section>('sales');
  const [period, setPeriod] = useState('month');

  const sales = useQuery({
    queryKey: ['report-sales', period],
    queryFn: () => reportService.sales({ period }),
    enabled: section === 'sales',
  });
  const inventory = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => reportService.inventory(),
    enabled: section === 'inventory',
  });
  const profit = useQuery({
    queryKey: ['report-profit', period],
    queryFn: () => reportService.profit({ period }),
    enabled: section === 'profit',
  });
  const purchases = useQuery({
    queryKey: ['report-purchases', period],
    queryFn: () => reportService.purchases({ period }),
    enabled: section === 'purchases',
  });

  const showPeriod = section !== 'inventory';

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Understand how your shop is doing" />

      <div className="relative z-10 flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={SECTIONS} active={section} onChange={(k) => setSection(k as Section)} />
        {showPeriod && (
          <Select
            name="reportPeriod"
            aria-label="Report period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={REPORT_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
            className="w-full sm:w-44"
          />
        )}
      </div>

      <div className="relative">{section === 'sales' &&
        (sales.isLoading ? <ReportSkeleton /> : sales.isError || !sales.data ? (
          <ErrorState onRetry={() => sales.refetch()} />
        ) : (
          <SalesReportView data={sales.data} currency={shop?.currency} />
        ))}

      {section === 'inventory' &&
        (inventory.isLoading ? <ReportSkeleton /> : inventory.isError || !inventory.data ? (
          <ErrorState onRetry={() => inventory.refetch()} />
        ) : (
          <InventoryReportView data={inventory.data} currency={shop?.currency} />
        ))}

      {section === 'profit' &&
        (profit.isLoading ? <ReportSkeleton /> : profit.isError || !profit.data ? (
          <ErrorState onRetry={() => profit.refetch()} />
        ) : (
          <ProfitReportView data={profit.data} currency={shop?.currency} />
        ))}

      {section === 'purchases' &&
        (purchases.isLoading ? <ReportSkeleton /> : purchases.isError || !purchases.data ? (
          <ErrorState onRetry={() => purchases.refetch()} />
        ) : (
          <PurchasesReportView data={purchases.data} currency={shop?.currency} />
        ))}
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/* ---------- Sales report ---------- */

function SalesReportView({ data, currency }: { data: Awaited<ReturnType<typeof reportService.sales>>; currency?: string }) {
  const methodNames: Record<PaymentMethod, string> = { CASH: 'Cash', MPESA: 'M-Pesa', CARD: 'Card', OTHER: 'Other' };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Revenue" value={kes(data.revenue, currency)} />
        <Stat label="Sales" value={String(data.numberOfSales)} />
        <Stat label="Items sold" value={String(data.totalItemsSold)} />
        <Stat label="Avg sale" value={kes(data.averageSale, currency)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Best sellers" icon={ShoppingCart} iconTone="orange" />
          {data.bestSelling.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">No sales in this period.</p> : (
            <RankedList
              rows={data.bestSelling.map((b) => ({ label: b.name, sub: `${b.qty} sold`, value: kes(b.revenue, currency) }))}
            />
          )}
        </Card>
        <Card>
          <CardHeader title="By payment method" icon={ClipboardList} iconTone="blue" />
          {data.byPaymentMethod.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">No data.</p> : (
            <ul className="divide-y divide-line">
              {data.byPaymentMethod.map((m) => (
                <li key={m.method} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="blue">{methodNames[m.method]}</Badge>
                    <span className="text-sm text-muted">{m.count} sale{m.count === 1 ? '' : 's'}</span>
                  </div>
                  <span className="font-semibold text-ink">{kes(m.total, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- Inventory report ---------- */

function InventoryReportView({ data, currency }: { data: Awaited<ReturnType<typeof reportService.inventory>>; currency?: string }) {
  const items = [
    { label: 'Inventory value', value: kes(data.inventoryValue, currency) },
    { label: 'Units in stock', value: String(data.totalUnits) },
    { label: 'Total products', value: String(data.totalProducts) },
    { label: 'Low stock', value: String(data.lowStock), tone: 'amber' as const },
    { label: 'Out of stock', value: String(data.outOfStock), tone: 'red' as const },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s) => (
        <div key={s.label} className="card flex flex-col gap-1 px-4 py-3">
          <span className="text-xs text-muted">{s.label}</span>
          <span className={`text-lg font-bold ${s.tone === 'red' ? 'text-danger' : s.tone === 'amber' ? 'text-accent-dark' : 'text-ink'}`}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Profit report ---------- */

function ProfitReportView({ data, currency }: { data: Awaited<ReturnType<typeof reportService.profit>>; currency?: string }) {
  const rows = [
    { label: 'Revenue', value: kes(data.revenue, currency) },
    { label: 'Cost of goods sold', value: `- ${kes(data.cogs, currency)}` },
    { label: 'Gross profit', value: kes(data.grossProfit, currency) },
    { label: 'Expenses', value: `- ${kes(data.expenses, currency)}` },
  ];
  const net = Number(data.netProfit);
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-line">
        {rows.map((r, i) => (
          <li key={r.label} className={`flex items-center justify-between px-4 py-3 ${i === 1 || i === 3 ? 'bg-canvas/60' : ''}`}>
            <span className="text-sm text-muted">{r.label}</span>
            <span className="font-semibold text-ink">{r.value}</span>
          </li>
        ))}
        <li className="flex items-center justify-between bg-brand px-4 py-4">
          <span className="text-sm font-medium text-white/90">Net profit</span>
          <span className="text-xl font-bold text-white">{kes(data.netProfit, currency)}</span>
        </li>
      </ul>
      <p className={`px-4 py-3 text-center text-sm font-medium ${net >= 0 ? 'text-duka-600' : 'text-danger'}`}>
        {net >= 0 ? "Healthy — you're making a profit." : "You're operating at a loss this period."}
      </p>
    </Card>
  );
}

/* ---------- Purchases report ---------- */

function PurchasesReportView({ data, currency }: { data: Awaited<ReturnType<typeof reportService.purchases>>; currency?: string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 lg:grid-cols-2">
        <Stat label="Purchases" value={String(data.totalPurchases)} />
        <Stat label="Total spend" value={kes(data.totalSpend, currency)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="By supplier" icon={Truck} iconTone="slate" />
          {data.bySupplier.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">No data.</p> : (
            <RankedList
              rows={data.bySupplier.map((s) => ({ label: s.name, sub: `${s.count} purchase${s.count === 1 ? '' : 's'}`, value: kes(s.total, currency) }))}
            />
          )}
        </Card>
        <Card>
          <CardHeader title="By product" icon={Package} iconTone="purple" />
          {data.byProduct.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">No data.</p> : (
            <RankedList
              rows={data.byProduct.map((b) => ({ label: b.name, sub: `${b.qty} units`, value: kes(b.cost, currency) }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- shared ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex flex-col justify-center gap-1 px-4 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg font-bold text-ink">{value}</span>
    </div>
  );
}

function RankedList({ rows }: { rows: { label: string; sub: string; value: string }[] }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((r, i) => (
        <li key={r.label} className="flex items-center gap-4 px-4 py-3">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-accent/20 text-accent-dark' : 'bg-line/60 text-muted'}`}>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{r.label}</p>
            <p className="text-xs text-muted">{r.sub}</p>
          </div>
          <span className="font-semibold text-ink">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
