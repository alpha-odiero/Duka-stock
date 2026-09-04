import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, MapPin, Package, Phone, Truck } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { supplierService } from '@/services/suppliers';
import { productService } from '@/services/products';
import { kes, formatDate } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { Purchase, Supplier } from '@/types';

type SupplierDetail = Supplier & {
  products?: {
    id: string;
    name: string;
    quantity: number;
    buyingPrice: string;
    lowStockThreshold: number;
  }[];
  purchases?: Purchase[];
};

export function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shop } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery<SupplierDetail>({
    queryKey: ['supplier', id],
    queryFn: () => supplierService.get(id!) as Promise<SupplierDetail>,
    enabled: Boolean(id),
  });

  const products = useQuery({
    queryKey: ['products', 'supplier', id],
    queryFn: () => productService.list({ supplierId: id, limit: 50 }),
    enabled: Boolean(id),
  });

  const supplierProducts = data?.products ?? products.data?.products ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} message="We couldn't load this supplier." />;
  }

  const totalSpend = (data.purchases ?? []).reduce((n, p) => n + Number(p.totalAmount), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/suppliers')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/purchases')}>
          Record purchase
        </Button>
      </div>

      {/* Supplier info */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <ColoredIcon icon={Truck} color="slate" size="lg" iconSizeClass="h-6 w-6" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-ink">{data.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {data.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {data.phone}
                </span>
              )}
              {data.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {data.email}
                </span>
              )}
              {data.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {data.address}
                </span>
              )}
            </div>
            {data.notes && <p className="mt-2 text-sm text-ink">{data.notes}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
          <div>
            <p className="text-lg font-bold text-ink">{supplierProducts.length}</p>
            <p className="text-xs text-muted">Products</p>
          </div>
          <div>
            <p className="text-lg font-bold text-ink">{data.purchases?.length ?? 0}</p>
            <p className="text-xs text-muted">Purchases</p>
          </div>
          <div>
            <p className="text-lg font-bold text-ink">{kes(totalSpend, shop?.currency)}</p>
            <p className="text-xs text-muted">Total spent</p>
          </div>
        </div>
      </Card>

      {/* Products supplied */}
      <Card>
        <CardHeader title="Products supplied" icon={Package} iconTone="purple" />
        {supplierProducts.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">No products linked to this supplier yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {supplierProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.quantity} in stock · {kes(p.buyingPrice)} cost
                  </p>
                </div>
                <span
                  className={
                    p.quantity === 0
                      ? 'text-xs font-medium text-danger'
                      : p.quantity <= p.lowStockThreshold
                        ? 'text-xs font-medium text-accent-dark'
                        : 'text-xs font-medium text-duka-600'
                  }
                >
                  {p.quantity === 0 ? 'Out of stock' : p.quantity <= p.lowStockThreshold ? 'Low' : 'In stock'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Purchases */}
      <Card>
        <CardHeader title="Recent purchases" icon={Truck} iconTone="blue" />
        {(data.purchases ?? []).length === 0 ? (
          <EmptyState icon={<Truck className="h-6 w-6" />} iconTone="slate" title="No purchases yet" description="Record a purchase to see it here." />
        ) : (
          <ul className="divide-y divide-line">
            {(data.purchases ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{formatDate(p.purchaseDate)}</p>
                  {p.notes && <p className="text-xs text-muted">{p.notes}</p>}
                </div>
                <span className="font-semibold text-ink">{kes(p.totalAmount, shop?.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
