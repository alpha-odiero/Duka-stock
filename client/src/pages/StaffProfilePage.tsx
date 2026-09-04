import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, Check, X } from 'lucide-react';
import { staffService } from '@/services/staff';
import type { User, UserRole } from '@/types';
import { kes, formatDateTime } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from '@/lib/permissions';

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY: 'Inventory',
  ATTENDANT: 'Cashier',
};

const STATUS_TONES = { ACTIVE: 'green', INACTIVE: 'gray', SUSPENDED: 'amber' } as const;

const PERMISSION_GROUPS: { label: string; perms: Permission[] }[] = [
  { label: 'POS & Sales', perms: [PERMISSIONS.POS_ACCESS, PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_REFUND, PERMISSIONS.SALES_VOID] },
  { label: 'Products', perms: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT, PERMISSIONS.PRODUCTS_DELETE] },
  { label: 'Inventory', perms: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.INVENTORY_TRANSFER] },
  { label: 'Customers', perms: [PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_EDIT] },
  { label: 'Purchases', perms: [PERMISSIONS.PURCHASES_VIEW, PERMISSIONS.PURCHASES_CREATE, PERMISSIONS.PURCHASES_EDIT] },
  { label: 'Reports', perms: [PERMISSIONS.REPORTS_VIEW] },
  { label: 'Team & Registers', perms: [PERMISSIONS.STAFF_VIEW, PERMISSIONS.STAFF_CREATE, PERMISSIONS.STAFF_EDIT, PERMISSIONS.STAFF_DEACTIVATE, PERMISSIONS.REGISTERS_VIEW, PERMISSIONS.REGISTERS_MANAGE] },
  { label: 'Returns & Refunds', perms: [PERMISSIONS.RETURNS_VIEW, PERMISSIONS.RETURNS_CREATE, PERMISSIONS.RETURNS_APPROVE] },
  { label: 'Offers & Promotions', perms: [PERMISSIONS.OFFERS_VIEW, PERMISSIONS.OFFERS_MANAGE] },
  { label: 'API & Integrations', perms: [PERMISSIONS.INTEGRATIONS_VIEW, PERMISSIONS.INTEGRATIONS_MANAGE] },
  { label: 'Settings', perms: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT] },
];

const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.POS_ACCESS]: 'Access POS',
  [PERMISSIONS.SALES_VIEW]: 'View sales',
  [PERMISSIONS.SALES_CREATE]: 'Create sales',
  [PERMISSIONS.SALES_REFUND]: 'Refund sales',
  [PERMISSIONS.SALES_VOID]: 'Void sales',
  [PERMISSIONS.PRODUCTS_VIEW]: 'View products',
  [PERMISSIONS.PRODUCTS_CREATE]: 'Create products',
  [PERMISSIONS.PRODUCTS_EDIT]: 'Edit products',
  [PERMISSIONS.PRODUCTS_DELETE]: 'Delete products',
  [PERMISSIONS.INVENTORY_VIEW]: 'View inventory',
  [PERMISSIONS.INVENTORY_ADJUST]: 'Adjust stock',
  [PERMISSIONS.INVENTORY_TRANSFER]: 'Transfer stock',
  [PERMISSIONS.CUSTOMERS_VIEW]: 'View customers',
  [PERMISSIONS.CUSTOMERS_CREATE]: 'Create customers',
  [PERMISSIONS.CUSTOMERS_EDIT]: 'Edit customers',
  [PERMISSIONS.PURCHASES_VIEW]: 'View purchases',
  [PERMISSIONS.PURCHASES_CREATE]: 'Create purchases',
  [PERMISSIONS.PURCHASES_EDIT]: 'Edit purchases',
  [PERMISSIONS.REPORTS_VIEW]: 'View reports',
  [PERMISSIONS.STAFF_VIEW]: 'View staff',
  [PERMISSIONS.STAFF_CREATE]: 'Create staff',
  [PERMISSIONS.STAFF_EDIT]: 'Edit staff',
  [PERMISSIONS.STAFF_DEACTIVATE]: 'Deactivate staff',
  [PERMISSIONS.REGISTERS_VIEW]: 'View registers',
  [PERMISSIONS.REGISTERS_MANAGE]: 'Manage registers',
  [PERMISSIONS.RETURNS_VIEW]: 'View returns',
  [PERMISSIONS.RETURNS_CREATE]: 'Process returns',
  [PERMISSIONS.RETURNS_APPROVE]: 'Approve returns & refunds',
  [PERMISSIONS.SETTINGS_VIEW]: 'View settings',
  [PERMISSIONS.SETTINGS_EDIT]: 'Edit settings',
  [PERMISSIONS.OFFERS_VIEW]: 'View offers & promotions',
  [PERMISSIONS.OFFERS_MANAGE]: 'Manage offers & promotions',
  [PERMISSIONS.INTEGRATIONS_VIEW]: 'View API & integrations',
  [PERMISSIONS.INTEGRATIONS_MANAGE]: 'Manage API & integrations',
};

export function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shop } = useAuth();
  const [tab, setTab] = useState('overview');
  const [salesPage, setSalesPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  const staff = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.get(id as string),
    enabled: Boolean(id),
  });

  const performance = useQuery({
    queryKey: ['staff', id, 'performance'],
    queryFn: () => staffService.performance(id as string),
    enabled: Boolean(id),
  });

  const sales = useQuery({
    queryKey: ['staff', id, 'sales', salesPage],
    queryFn: () => staffService.sales(id as string, { page: salesPage, limit: 10 }),
    enabled: Boolean(id) && tab === 'sales',
  });

  const activity = useQuery({
    queryKey: ['staff', id, 'activity', activityPage],
    queryFn: () => staffService.activity(id as string, { page: activityPage, limit: 10 }),
    enabled: Boolean(id) && tab === 'activity',
  });

  const person: User | undefined = staff.data;
  const perf = performance.data;
  const allowedPerms: Permission[] = person ? ROLE_PERMISSIONS[person.role] ?? [] : [];

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={() => navigate('/dashboard/staff')}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Back to staff
        </button>
        {staff.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          person && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-semibold text-white">
                {person.fullName?.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-ink">{person.fullName}</h1>
                  <Badge tone="blue">{ROLE_LABELS[person.role]}</Badge>
                  <Badge tone={STATUS_TONES[person.status]}>{person.status.toLowerCase()}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  {person.email && (
                    <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {person.email}</span>
                  )}
                  {person.phone && (
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {person.phone}</span>
                  )}
                  {person.register?.name && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Register: {person.register.name}</span>
                  )}
                  <span className="text-xs text-muted">
                    Joined {formatDateTime(person.createdAt)}
                    {person.lastLoginAt ? ` · Last login ${formatDateTime(person.lastLoginAt)}` : ''}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <Tabs
        items={[
          { key: 'overview', label: 'Overview' },
          { key: 'sales', label: 'Sales' },
          { key: 'activity', label: 'Activity' },
          { key: 'permissions', label: 'Permissions' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <OverviewTab person={person} perf={perf} currency={shop?.currency ?? 'KES'} isLoading={staff.isLoading} />
      )}

      {tab === 'sales' && (
        <Card>
          {sales.isLoading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : sales.data && sales.data.sales.length === 0 ? (
            <EmptyState title="No sales yet" description="This staff member hasn't processed any sales." />
          ) : (
            <>
              <ul className="divide-y divide-line">
                {(sales.data?.sales ?? []).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                    <Link to={`/dashboard/history/${s.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink hover:text-brand">{s.receiptNumber}</p>
                      <p className="truncate text-xs text-muted">
                        {formatDateTime(s.createdAt)} · {s.source} · {s.paymentMethod}
                      </p>
                    </Link>
                    <span className="text-sm font-bold text-ink">{kes(s.totalAmount, shop?.currency)}</span>
                  </li>
                ))}
              </ul>
              <Pagination
                page={salesPage}
                totalPages={Math.ceil((sales.data?.pagination?.total ?? 0) / 10)}
                total={sales.data?.pagination?.total ?? 0}
                onPageChange={setSalesPage}
              />
            </>
          )}
        </Card>
      )}

      {tab === 'activity' && (
        <Card>
          {activity.isLoading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : activity.data && activity.data.activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Audit log events will appear here." />
          ) : (
            <>
              <ul className="divide-y divide-line">
                {(activity.data?.activity ?? []).map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-ink">{a.action}</p>
                    <p className="text-xs text-muted">
                      {formatDateTime(a.createdAt)}
                      {a.entityType ? ` · ${a.entityType}${a.entityId ? ` · ${a.entityId}` : ''}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
              <Pagination
                page={activityPage}
                totalPages={Math.ceil((activity.data?.pagination?.total ?? 0) / 10)}
                total={activity.data?.pagination?.total ?? 0}
                onPageChange={setActivityPage}
              />
            </>
          )}
        </Card>
      )}

      {tab === 'permissions' && (
        <Card>
          <div className="border-b border-line px-4 py-3">
            <p className="font-semibold text-ink">{ROLE_LABELS[person?.role ?? 'CASHIER']} role permissions</p>
            <p className="text-xs text-muted">Determined by role. The backend enforces these on every request.</p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{group.label}</p>
                <ul className="space-y-1">
                  {group.perms.map((p) => {
                    const granted = allowedPerms.includes(p);
                    return (
                      <li key={p} className="flex items-center gap-2 text-sm">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full ${granted ? 'bg-primary-light text-brand-600' : 'bg-line text-muted'}`}>
                          {granted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        <span className={granted ? 'text-ink' : 'text-muted line-through'}>{PERMISSION_LABELS[p]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function OverviewTab({
  person,
  perf,
  currency,
  isLoading,
}: {
  person: User | undefined;
  perf: { todaySales: number; transactions: number; todayTransactions: number; averageTransaction: number; totalSales: number; refunds: number; voided: number } | undefined;
  currency: string;
  isLoading: boolean;
}) {
  if (isLoading || !person) {
    return <Card className="space-y-4 p-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</Card>;
  }
  const stats = [
    { label: 'Today\'s sales', value: kes(perf?.todaySales, currency) },
    { label: 'Today\'s transactions', value: String(perf?.todayTransactions ?? 0) },
    { label: 'Total sales', value: kes(perf?.totalSales, currency) },
    { label: 'Avg transaction', value: kes(perf?.averageTransaction, currency) },
    { label: 'Refunds', value: String(perf?.refunds ?? 0) },
    { label: 'Voided', value: String(perf?.voided ?? 0) },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.label}</p>
          <p className="mt-1 text-xl font-bold text-ink">{s.value}</p>
        </Card>
      ))}
    </div>
  );
}

