import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLine, Boxes } from 'lucide-react';
import { productService } from '@/services/products';
import { kes } from '@/lib/format';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StockBadge } from '@/components/products/stock-badge';
import { ProductImage } from '@/components/ui/product-image';
import { extractError } from '@/lib/api';
import type { Product } from '@/types';

type StockFilter = 'all' | 'low' | 'out';

export function StockPage() {
  const { shop } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StockFilter>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { page, limit, status: filter === 'all' ? undefined : filter }],
    queryFn: () =>
      productService.list({
        page,
        limit,
        status: (filter === 'all' ? undefined : filter) as 'low' | 'out' | undefined,
        sort: 'quantity_asc',
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'low', label: 'Low' },
    { key: 'out', label: 'Out' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock"
        subtitle="Manage your inventory levels"
        actions={<Tabs items={tabs} active={filter} onChange={(k) => { setFilter(k as StockFilter); setPage(1); }} />}
      />

      {isLoading &&
        [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}

      {isError && <ErrorState onRetry={() => refetch()} message="We couldn't load your stock." />}

      {data && data.products.length === 0 && (
        <Card>
          <EmptyState
            icon={<Boxes className="h-6 w-6" />}
            iconTone="amber"
            title={filter === 'all' ? 'No products yet' : 'Nothing to show'}
            description={
              filter === 'all'
                ? 'Add products to start tracking inventory.'
                : 'No products in this stock state right now.'
            }
          />
        </Card>
      )}

      {data && data.products.length > 0 && (
        <Card>
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Selling price</th>
                  <th className="px-4 py-3 font-medium">In stock</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.products.map((p) => (
                  <tr key={p.id} className="hover:bg-line/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={p.imageUrl}
                          alt={p.name}
                          size={80}
                          wrapperClassName="h-10 w-10 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                          <Link to={`/dashboard/products/${p.id}`} className="font-medium text-ink hover:text-brand">
                            {p.name}
                          </Link>
                          <span className="block text-xs text-muted">{p.category?.name ?? 'Uncategorised'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{kes(p.sellingPrice, shop?.currency)}</td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {p.quantity} <span className="font-normal text-muted">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3"><StockBadge product={p} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setRestockTarget(p)}>
                        <ArrowDownToLine className="h-4 w-4" /> Stock in
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="divide-y divide-line md:hidden">
            {data.products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <ProductImage
                  src={p.imageUrl}
                  alt={p.name}
                  size={80}
                  wrapperClassName="h-11 w-11 shrink-0 rounded-lg"
                />
                <Link to={`/dashboard/products/${p.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.quantity} {p.unit} · {kes(p.sellingPrice, shop?.currency)}
                  </p>
                </Link>
                <StockBadge product={p} />
                <Button variant="secondary" size="sm" onClick={() => setRestockTarget(p)} aria-label={`Restock ${p.name}`}>
                  <ArrowDownToLine className="h-4 w-4" />
                </Button>
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

      {restockTarget && (
        <RestockModal
          product={restockTarget}
          onClose={() => setRestockTarget(null)}
          onDone={() => {
            toast(`${restockTarget.name} restocked`);
            invalidate();
            setRestockTarget(null);
          }}
        />
      )}
    </div>
  );
}

function RestockModal({
  product,
  onClose,
  onDone,
}: {
  product: Product;
  onClose: () => void;
  onDone: () => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than zero.');
      return;
    }
    setBusy(true);
    try {
      await productService.stockIn(product.id, qty, reason.trim() || 'Restock');
      onDone();
    } catch (err) {
      setError(extractError(err).message);
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Stock in"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} loading={busy}>Add stock</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          <strong className="text-ink">{product.name}</strong> — currently{' '}
          <strong className="text-ink">{product.quantity} {product.unit}</strong>
        </p>
        <Input
          label="Quantity to add"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="e.g. 20"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error}
        />
        <Input
          label="Note (optional)"
          placeholder="e.g. New delivery"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
