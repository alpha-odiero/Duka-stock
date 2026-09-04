import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Minus, Plus, Search, ShoppingCart, User, X } from 'lucide-react';
import { productService } from '@/services/products';
import { saleService } from '@/services/sales';
import { customerService } from '@/services/customers';
import { categoryService } from '@/services/categories';
import { PAYMENT_METHODS } from '@/lib/constants';
import { kes } from '@/lib/format';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { StockBadge } from '@/components/products/stock-badge';
import { ProductImage } from '@/components/ui/product-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { extractError } from '@/lib/api';
import type { Customer, PaymentMethod, Product } from '@/types';

interface CartLine {
  product: Product;
  quantity: number;
}

export default function SalesPage() {
  const navigate = useNavigate();
  const { shop, register } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>('CASH');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [discount, setDiscount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const products = useQuery({
    queryKey: ['products', 'pos'],
    queryFn: () => productService.list({ limit: 100 }),
  });

  const customers = useQuery({
    queryKey: ['customers', 'search', customerQuery],
    queryFn: () => customerService.list({ search: customerQuery || undefined, limit: 8 }),
  });

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const all = products.data?.products ?? [];
    let list = all;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase() ?? '').includes(q) ||
        (p.barcode?.toLowerCase() ?? '').includes(q),
    );
  }, [products.data, search, activeCategory]);

  const addToCart = (product: Product) => {
    setError(null);
    if (product.quantity <= 0) {
      toast(`${product.name} is out of stock`, { type: 'error' });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast(`Only ${product.quantity} of ${product.name} in stock`, { type: 'error' });
          return prev;
        }
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const setQty = (id: string, qty: number) => {
    setError(null);
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.product.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((l) => {
        if (l.product.id !== id) return l;
        const max = l.product.quantity;
        return { ...l, quantity: Math.min(qty, max) };
      }),
    );
  };

  const removeLine = (id: string) => {
    setError(null);
    setCart((prev) => prev.filter((l) => l.product.id !== id));
  };

  const totals = cart.reduce(
    (acc, l) => {
      const subtotal = Number(l.product.sellingPrice) * l.quantity;
      const cost = Number(l.product.buyingPrice) * l.quantity;
      return { total: acc.total + subtotal, cost: acc.cost + cost };
    },
    { total: 0, cost: 0 },
  );

  const discountAmount = Math.min(Number(discount) || 0, totals.total);
  const payable = totals.total - discountAmount;

  const paidAmount = amountPaid ? Number(amountPaid) : 0;
  const changeDue = payment === 'CASH' && paidAmount > 0 ? Math.max(0, paidAmount - payable) : 0;

  const checkout = async () => {
    if (cart.length === 0) return;
    setError(null);
    setPlacing(true);
    try {
      const sale = await saleService.create({
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        paymentMethod: payment,
        source: 'POS',
        customerId: customer?.id ?? null,
        discount: discountAmount > 0 ? discountAmount : undefined,
        registerId: register?.id,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        paymentReference: paymentReference.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast(`Sale ${sale.receiptNumber} recorded`);
      navigate(`/dashboard/history/${sale.id}`);
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setPlacing(false);
    }
  };

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const cats = categories.data ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      {/* Product picker */}
      <section className="min-w-0 space-y-4">
        {/* Search */}
        <SearchInput
          placeholder="Search products or scan barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products for sale"
        />

        {/* Category filter — wraps so every category stays visible */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
            All
          </FilterPill>
          {cats.map((c) => (
            <FilterPill key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)}>
              {c.name}
            </FilterPill>
          ))}
          <button
            onClick={() => navigate('/dashboard/categories')}
            title="Manage categories"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand/50 hover:text-brand"
          >
            <Plus className="h-3.5 w-3.5" /> Categories
          </button>
        </div>

        {products.isLoading && (
          <Card className="flex items-center justify-center py-16">
            <Spinner className="h-8 w-8" />
          </Card>
        )}
        {products.isError && <ErrorState onRetry={() => products.refetch()} />}
        {products.data && filtered.length === 0 && (
          <Card>
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No products found"
              description="Try a different search or category."
            />
          </Card>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.quantity <= 0}
              title={p.name}
              className={cn(
                'group flex flex-col overflow-hidden rounded-xl border bg-surface text-left shadow-card transition',
                p.quantity <= 0
                  ? 'cursor-not-allowed opacity-55'
                  : 'hover:border-brand/40 hover:shadow-md',
              )}
              style={{ borderColor: 'var(--line, #E5E7EB)' }}
            >
              <div className="relative aspect-square w-full overflow-hidden border-b border-line/60">
                <ProductImage src={p.imageUrl} alt={p.name} size={240} className="transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute right-1.5 top-1.5">
                  <StockBadge product={p} />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="truncate text-xs text-muted">{(p.category?.name ?? p.unit) || 'Product'}</p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <span className="text-sm font-bold text-brand">{kes(p.sellingPrice, shop?.currency)}</span>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white opacity-0 transition group-hover:opacity-100 disabled:bg-brand/40">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Cart / checkout */}
      <section className="xl:sticky xl:top-20">
        <Card className="flex max-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-brand-50/50 to-transparent px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
                <ShoppingCart className="h-4 w-4" />
              </span>
              Current sale
              {cartCount > 0 && <Badge tone="blue">{cartCount}</Badge>}
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Line items */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-line/50">
                <ShoppingCart className="h-6 w-6 text-muted" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Your sale is empty</p>
              <p className="mt-1 text-xs text-muted">Tap a product on the left to add it.</p>
            </div>
          ) : (
            <>
              {/* Column header */}
              <div className="flex items-center gap-3 border-b border-line bg-line/30 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <span className="flex-1">Item</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-20 text-right">Amount</span>
              </div>
              <ul className="nice-scroll min-h-0 flex-1 divide-y divide-line overflow-y-auto">
                {cart.map((l) => (
                  <li key={l.product.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-line/20">
                    <div className="relative shrink-0">
                      <ProductImage
                        src={l.product.imageUrl}
                        alt={l.product.name}
                        size={80}
                        wrapperClassName="h-11 w-11 rounded-lg"
                      />
                      <button
                        onClick={() => removeLine(l.product.id)}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white shadow-sm hover:bg-red-700"
                        aria-label={`Remove ${l.product.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{l.product.name}</p>
                      <p className="text-xs text-muted">
                        {kes(l.product.sellingPrice, shop?.currency)} each
                      </p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <button
                          onClick={() => setQty(l.product.id, l.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink transition hover:bg-line/40"
                          aria-label={`Decrease ${l.product.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-ink">{l.quantity}</span>
                        <button
                          onClick={() => setQty(l.product.id, l.quantity + 1)}
                          disabled={l.quantity >= l.product.quantity}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink transition hover:bg-line/40 disabled:opacity-40"
                          aria-label={`Increase ${l.product.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-20 shrink-0 text-right">
                      <span className="text-sm font-semibold text-ink">
                        {kes(Number(l.product.sellingPrice) * l.quantity, shop?.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Checkout footer */}
          <div className="nice-scroll min-h-0 space-y-3 overflow-y-auto border-t border-line p-4 shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.18)]">
            {error && (
              <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <div>
              <span className="label">Customer</span>
              <div className="relative">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-brand">
                  <User className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    value={customer ? customer.name : customerQuery}
                    onChange={(e) => {
                      setCustomer(null);
                      setCustomerQuery(e.target.value);
                    }}
                    placeholder={customer ? '' : 'Walk-in / search customer...'}
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                    aria-label="Search customer"
                  />
                  {customer && (
                    <button
                      onClick={() => {
                        setCustomer(null);
                        setCustomerQuery('');
                      }}
                      className="text-muted hover:text-danger"
                      aria-label="Clear customer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!customer && customers.data && customers.data.customers.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-pop">
                    {customers.data.customers.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            setCustomer({ id: c.id, name: c.name, phone: c.phone, email: c.email, shopId: c.shopId, createdAt: c.createdAt, updatedAt: c.updatedAt });
                            setCustomerQuery('');
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-line/30"
                        >
                          <span className="truncate text-ink">{c.name}</span>
                          {c.phone && <span className="ml-auto shrink-0 text-xs text-muted">{c.phone}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {customer && <p className="mt-1 text-xs text-muted">Selling to {customer.name}</p>}
            </div>

            <div>
              <span className="label">Payment method</span>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPayment(m.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition',
                      payment === m.value
                        ? 'border-brand bg-brand text-white shadow-sm'
                        : 'border-line bg-surface text-ink hover:bg-line/30',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {payment === 'MPESA' && (
              <div>
                <label className="label" htmlFor="pos-mpesa-ref">
                  M-Pesa transaction code
                </label>
                <Input
                  id="pos-mpesa-ref"
                  placeholder="e.g. SJK8H7X2"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            )}

            {payment === 'CASH' && (
              <div>
                <label className="label" htmlFor="pos-paid">
                  Amount received ({shop?.currency ?? 'KES'})
                </label>
                <Input
                  id="pos-paid"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                {paidAmount > 0 && payable > 0 && (
                  <p className="mt-1 text-xs text-muted">
                    {paidAmount >= payable
                      ? `Change due ${kes(changeDue, shop?.currency)}`
                      : `Short by ${kes(payable - paidAmount, shop?.currency)}`}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="label" htmlFor="pos-discount">
                Discount ({shop?.currency ?? 'KES'})
              </label>
              <Input
                id="pos-discount"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              {discountAmount > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Discount capped at subtotal {kes(totals.total, shop?.currency)}
                </p>
              )}
            </div>

            <div className="space-y-1 border-t border-line pt-3">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>{kes(totals.total, shop?.currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>Discount</span>
                  <span className="text-duka-600">-{kes(discountAmount, shop?.currency)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-2">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="text-xl font-bold text-brand">{kes(payable, shop?.currency)}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={cart.length === 0}
              loading={placing}
              onClick={checkout}
            >
              <LayoutGrid className="h-4 w-4" />
              {placing ? 'Processing...' : `Complete sale · ${kes(payable, shop?.currency)}`}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-brand bg-brand text-white shadow-sm'
          : 'border-line bg-surface text-muted hover:border-brand/40 hover:text-brand',
      )}
    >
      {children}
    </button>
  );
}

