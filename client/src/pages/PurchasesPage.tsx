import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingBag, Truck, X } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { purchaseService } from '@/services/purchases';
import { productService } from '@/services/products';
import { supplierService } from '@/services/suppliers';
import { kes, formatDate } from '@/lib/format';
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
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';

interface Line {
  product: Product;
  quantity: string;
  unitCost: string;
}

export function PurchasesPage() {
  const { shop } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [supplierId, setSupplierId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: supplierService.list });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['purchases', { page, supplierId }],
    queryFn: () =>
      purchaseService.list({ page, limit: 20, supplierId: supplierId || undefined }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['purchases'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['supplier'] });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchases"
        subtitle="Stock you've bought from suppliers"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> New purchase
          </Button>
        }
      />

      <Select
        name="supplierFilter"
        aria-label="Filter by supplier"
        placeholder="All suppliers"
        value={supplierId}
        onChange={(e) => { setSupplierId(e.target.value); setPage(1); }}
        options={suppliers.data?.map((s) => ({ value: s.id, label: s.name })) ?? []}
      />

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      )}
      {isError && <ErrorState onRetry={() => refetch()} message="We couldn't load your purchases." />}
      {data && data.purchases.length === 0 && (
        <Card>
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            iconTone="blue"
            title="No purchases yet"
            description="Record stock you've bought to track costs and quantities."
            action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New purchase</Button>}
          />
        </Card>
      )}

      {data && data.purchases.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.purchases.map((p) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ColoredIcon icon={Truck} color="blue" size="md" iconSizeClass="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {p.supplier?.name ?? 'No supplier'}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(p.purchaseDate)} · {p.items.reduce((n, i) => n + i.quantity, 0)} item
                        {p.items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ink">{kes(p.totalAmount, shop?.currency)}</p>
                    <p className="text-xs text-muted">{p.items.length} line{p.items.length === 1 ? '' : 's'}</p>
                  </div>
                </div>
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

      {showForm && (
        <PurchaseForm
          onClose={() => setShowForm(false)}
          onDone={() => {
            toast('Purchase recorded, stock updated');
            invalidate();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function PurchaseForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { shop } = useAuth();
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const products = useQuery({ queryKey: ['products', 'purchase-form'], queryFn: () => productService.list({ limit: 100 }) });
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: supplierService.list });

  const results = useMemo(() => {
    const all = products.data?.products ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase() ?? '').includes(q));
  }, [products.data, search]);

  const addLine = (p: Product) => {
    setLines((prev) => {
      if (prev.some((l) => l.product.id === p.id)) return prev;
      return [...prev, { product: p, quantity: '1', unitCost: p.buyingPrice }];
    });
    setSearch('');
  };

  const updateLine = (id: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.product.id === id ? { ...l, ...patch } : l)));

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.product.id !== id));

  const total = lines.reduce((sum, l) => sum + Number(l.unitCost || 0) * Number(l.quantity || 0), 0);

  const submit = async () => {
    setError(null);
    const payload = lines
      .map((l) => ({ productId: l.product.id, quantity: Number(l.quantity), unitCost: l.unitCost }))
      .filter((l) => l.quantity > 0);
    if (payload.length === 0) {
      setError('Add at least one item to the purchase.');
      return;
    }
    setBusy(true);
    try {
      await purchaseService.create({
        supplierId: supplier || null,
        purchaseDate: purchaseDate || undefined,
        notes: notes.trim() || undefined,
        items: payload,
      });
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
      size="xl"
      title="New purchase"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted">
            Total: <strong className="text-ink">{kes(total, shop?.currency)}</strong>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={submit} loading={busy}>Save purchase</Button>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Supplier (optional)"
            name="purchaseSupplier"
            placeholder="No supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={suppliers.data?.map((s) => ({ value: s.id, label: s.name })) ?? []}
          />
          <Input
            label="Purchase date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        {/* Line items */}
        <div>
          <span className="label">Add items</span>
          <SearchInput
            placeholder="Search a product to add..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-line">
              {results.length === 0 && <p className="px-3 py-2 text-sm text-muted">No products found.</p>}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addLine(p)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-line/30"
                >
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="text-muted">{kes(p.buyingPrice)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {lines.map((l) => {
              const subtotal = Number(l.unitCost || 0) * Number(l.quantity || 0);
              return (
                <li key={l.product.id} className="flex items-center gap-2 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{l.product.name}</p>
                    <p className="text-xs text-muted">{kes(subtotal)}</p>
                  </div>
                  <Input
                    aria-label={`Quantity of ${l.product.name}`}
                    type="number"
                    min={1}
                    className="w-20"
                    value={l.quantity}
                    onChange={(e) => updateLine(l.product.id, { quantity: e.target.value })}
                  />
                  <Input
                    aria-label={`Unit cost of ${l.product.name}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-24"
                    value={l.unitCost}
                    onChange={(e) => updateLine(l.product.id, { unitCost: e.target.value })}
                  />
                  <button onClick={() => removeLine(l.product.id)} className="text-muted hover:text-danger" aria-label={`Remove ${l.product.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <Textarea
          label="Notes (optional)"
          placeholder="e.g. Delivery in 2 days"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}
