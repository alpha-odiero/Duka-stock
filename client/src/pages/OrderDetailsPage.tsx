import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Truck } from 'lucide-react';
import { orderService } from '@/services/orders';
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/lib/constants';
import { kes } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import type { OrderStatus } from '@/types';

const STATUS_TONE: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PROCESSING: 'blue',
  READY: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export function OrderDetailsPage() {
  const { id } = useParams();
  const { shop } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const order = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.get(id!),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateStatus(id!, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['order', id], updated);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast(`Order marked ${updated.status.toLowerCase()}`);
    },
    onError: () => toast('Could not update order status', { type: 'error' }),
  });

  if (order.isLoading || (!order.data && !order.isError)) {
    return (
      <Card className="space-y-4 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  if (order.isError || !order.data) {
    return (
      <Card className="p-6">
        <ErrorState onRetry={() => order.refetch()} />
      </Card>
    );
  }

  const o = order.data;
  const rows = o.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title={o.orderNumber}
        subtitle={`Placed ${new Date(o.createdAt).toLocaleString()}`}
        actions={
          <>
            <Badge tone={STATUS_TONE[o.status] ?? 'gray'}>{o.status.toLowerCase()}</Badge>
            {o.source === 'ONLINE' && <Badge tone="blue">Online</Badge>}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Items</h2>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name ?? ''}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-sm font-semibold text-blue-700">
                    {(item.product?.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.product?.name ?? 'Product'}</p>
                  <p className="text-xs text-muted">
                    {item.quantity} × {kes(item.unitPrice, shop?.currency)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {kes(item.subtotal, shop?.currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-line px-4 py-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{kes(o.subtotal, shop?.currency)}</span>
            </div>
            {Number(o.discount) > 0 && (
              <div className="flex justify-between text-muted">
                <span>Discount</span>
                <span className="text-duka-600">-{kes(o.discount, shop?.currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold text-ink">
              <span>Total</span>
              <span>{kes(o.totalAmount, shop?.currency)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Update status</h2>
            <Select
              aria-label="Order status"
              value={o.status}
              onChange={(e) => statusMutation.mutate(e.target.value as OrderStatus)}
              options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              disabled={statusMutation.isPending}
            />
            <p className="mt-2 text-xs text-muted">
              Paid via {PAYMENT_METHODS.find((p) => p.value === o.paymentMethod)?.label ?? o.paymentMethod}
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Customer</h2>
            <p className="text-sm font-medium text-ink">{o.customerName ?? 'Walk-in customer'}</p>
            {o.customerPhone && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <Phone className="h-3.5 w-3.5" /> {o.customerPhone}
              </p>
            )}
            {o.customerEmail && <p className="mt-1 text-xs text-muted">{o.customerEmail}</p>}
            {o.deliveryAddress && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" /> {o.deliveryAddress}
              </p>
            )}
            {o.notes && <p className="mt-2 text-xs text-muted italic">{o.notes}</p>}
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Truck className="h-4 w-4 text-blue-600" /> Fulfilment
            </h2>
            <p className="text-sm text-ink">Current status: {o.status.toLowerCase()}</p>
            <p className="mt-1 text-xs text-muted">
              Move the order through the pipeline (pending → confirmed → processing → ready →
              completed) as it is fulfilled.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              onClick={() => {
                const next: Record<string, OrderStatus> = {
                  PENDING: 'CONFIRMED',
                  CONFIRMED: 'PROCESSING',
                  PROCESSING: 'READY',
                  READY: 'COMPLETED',
                };
                const target = next[o.status];
                if (target) statusMutation.mutate(target);
                else toast('This order is already completed or cancelled.', { type: 'error' });
              }}
            >
              Advance status
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
