import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLine, ArrowUpFromLine, Pencil, Receipt } from 'lucide-react';
import { productService } from '@/services/products';
import { kes, formatDate, formatDateTime } from '@/lib/format';
import { MOVEMENT_LABELS, STOCK_OUT_TYPES } from '@/lib/constants';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StockBadge } from '@/components/products/stock-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { extractError } from '@/lib/api';

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shop } = useAuth();
  const queryClient = useQueryClient();
  const [adjust, setAdjust] = useState<'in' | 'out' | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.get(id!),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['product', id] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} message="We couldn't load this product." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={data.name}
        subtitle={`${data.category?.name ?? 'Uncategorised'}${data.sku ? ` · SKU ${data.sku}` : ''}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/dashboard/products/${id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button onClick={() => navigate('/dashboard/sales')}>Sell</Button>
          </>
        }
      />

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Selling price" value={kes(data.sellingPrice, shop?.currency)} />
        <Stat label="Buying price" value={kes(data.buyingPrice, shop?.currency)} />
        <div className="card flex flex-col justify-center gap-1 px-4 py-3">
          <span className="text-xs text-muted">Stock level</span>
          <StockBadge product={data} />
          <span className="text-sm font-medium text-ink">{data.quantity} {data.unit}</span>
        </div>
        <Stat label="Low stock at" value={String(data.lowStockThreshold)} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setAdjust('in')}>
          <ArrowDownToLine className="h-4 w-4" /> Stock in
        </Button>
        <Button
          variant="outline"
          onClick={() => setAdjust('out')}
          disabled={data.quantity === 0}
        >
          <ArrowUpFromLine className="h-4 w-4" /> Stock out
        </Button>
      </div>

      {data.description && (
        <Card className="px-4 py-3 text-sm text-ink">
          <span className="font-medium text-muted">Notes: </span>
          {data.description}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Movement history */}
        <Card>
          <CardHeader title="Stock movements" icon={ArrowDownToLine} iconTone="amber" />
          {data.stockMovements.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No movements yet. Use "Stock in" to add stock.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.stockMovements.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <Badge
                      tone={
                        m.type === 'STOCK_IN'
                          ? 'green'
                          : m.type === 'POS_SALE' || m.type === 'ONLINE_ORDER'
                            ? 'blue'
                            : 'amber'
                      }
                    >
                      {MOVEMENT_LABELS[m.type]}
                    </Badge>
                    {m.reason && <span className="ml-2 text-xs text-muted">{m.reason}</span>}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        m.type === 'STOCK_IN'
                          ? 'text-duka-600'
                          : m.type === 'POS_SALE' || m.type === 'ONLINE_ORDER'
                            ? 'text-brand'
                            : 'text-danger'
                      }`}
                    >
                      {m.type === 'STOCK_IN' ? '+' : '-'}
                      {m.quantity}
                    </span>
                    <span className="block text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Sale history */}
        <Card>
          <CardHeader title="Sale history" subtitle="How this product has sold" icon={Receipt} iconTone="green" />
          {data.saleItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No sales recorded yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.saleItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-4 py-3">
                  <Link
                    to={`/dashboard/history/${item.saleId}`}
                    className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand"
                  >
                    <Receipt className="h-4 w-4 text-muted" />
                    {item.sale?.receiptNumber ?? 'Receipt'}
                  </Link>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-ink">
                      {item.quantity} × {kes(item.unitPrice)}
                    </span>
                    <span className="block text-xs text-muted">{formatDate(item.sale?.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {adjust && (
        <AdjustmentModal
          mode={adjust}
          product={data}
          onClose={() => setAdjust(null)}
          onDone={invalidate}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex flex-col justify-center gap-1 px-4 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-lg font-bold text-ink">{value}</span>
    </div>
  );
}

function AdjustmentModal({
  mode,
  product,
  onClose,
  onDone,
}: {
  mode: 'in' | 'out';
  product: Product;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<string>('DAMAGE');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const isIn = mode === 'in';

  const submit = async () => {
    setError(undefined);
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than zero.');
      return;
    }
    if (!isIn && qty > product.quantity) {
      setError(`Only ${product.quantity} in stock.`);
      return;
    }
    setBusy(true);
    try {
      if (isIn) {
        await productService.stockIn(product.id, qty, reason.trim() || undefined);
        toast(`${qty} added to ${product.name}`);
      } else {
        await productService.stockOut(
          product.id,
          qty,
          type as 'DAMAGE' | 'EXPIRED' | 'LOST' | 'ADJUSTMENT',
          reason.trim() || undefined,
        );
        toast(`Removed ${qty} from ${product.name}`);
      }
      onDone();
      onClose();
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isIn ? 'Stock in' : 'Stock out'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={isIn ? 'primary' : 'danger'}
            onClick={submit}
            loading={busy}
          >
            {isIn ? 'Add stock' : 'Remove stock'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          <strong className="text-ink">{product.name}</strong> — current stock:{' '}
          <strong className="text-ink">{product.quantity} {product.unit}</strong>
        </p>
        <Input
          label={`Quantity to ${isIn ? 'add' : 'remove'}`}
          type="number"
          min={1}
          max={isIn ? undefined : product.quantity}
          inputMode="numeric"
          placeholder="e.g. 10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error}
        />
        {!isIn && (
          <Select
            label="Reason"
            name="stockOutType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={STOCK_OUT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
        )}
        <Input
          label="Note (optional)"
          placeholder="e.g. New delivery from supplier"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
