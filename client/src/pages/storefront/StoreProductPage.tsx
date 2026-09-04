import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { storeService } from '@/services/store';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { kes } from '@/lib/format';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { ProductGrid, Section } from './components';

export function StoreProductPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const { config, primary, buttonRadius, shopName, href } = useStorefront();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);

  const detail = useQuery({
    queryKey: ['store', 'product', { shop: shopName, slug }] as const,
    queryFn: () => storeService.getProduct(slug!, shopName),
    enabled: Boolean(slug),
  });

  const related = useQuery({
    queryKey: ['store', 'related', { shop: shopName, category: detail.data?.product.category?.name, slug }] as const,
    queryFn: () => storeService.listProducts({ shop: shopName, category: detail.data?.product.category?.name, limit: 5 }),
    enabled: Boolean(detail.data?.product.category),
  });

  if (detail.isLoading) {
    return (
      <Card className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </Card>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Card className="p-6">
        <ErrorState onRetry={() => detail.refetch()} />
      </Card>
    );
  }

  const { product: p, shop } = detail.data;

  const onAdd = () => {
    add(p, qty);
    toast(`${qty} × ${p.name} added to cart`);
  };

  const waNumber = config?.contact?.whatsappNumber?.replace(/\D/g, '') || (config?.contact?.phone && config.contact.phone.replace(/\D/g, '')) || shop.phone?.replace(/\D/g, '');
  const status = !p.inStock
    ? { label: 'Out of stock', pill: 'bg-danger' }
    : p.stockStatus === 'low'
      ? { label: 'Low stock — order soon', pill: 'bg-amber-500' }
      : { label: 'In stock', pill: 'bg-emerald-500' };

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="aspect-square w-full bg-line/40">
            {p.imageUrl && !imageError ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl font-bold text-line">
                {p.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Link to={href('/shop')} className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
            <Link to={href('/')} className="hover:underline">Home</Link>
            <span>/</span>
            <Link to={href('/shop')} className="hover:underline">Shop</Link>
            {p.category && (
              <>
                <span>/</span>
                <Link to={href(`/categories/${encodeURIComponent(p.category.name)}`)} className="hover:underline">
                  {p.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-medium text-ink">{p.name}</span>
          </nav>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{p.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${status.pill}`}>
                {status.label}
              </span>
            </div>
            {p.category && (
              <Link to={href(`/categories/${encodeURIComponent(p.category.name)}`)} className="mt-0.5 inline-block text-sm text-brand hover:underline">
                {p.category.name}
              </Link>
            )}
          </div>

          <p className="text-3xl font-bold text-brand">
            {kes(p.price, shop.currency)}
          </p>

          {p.description && <p className="text-sm leading-relaxed text-muted">{p.description}</p>}

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
            <span className="text-sm font-medium text-ink">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink hover:bg-line/40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-base font-semibold text-ink">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(p.quantity, q + 1))}
                disabled={qty >= p.quantity}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink hover:bg-line/40 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="ml-auto text-xs text-muted">
              {p.inStock ? `${p.quantity} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="w-full text-white sm:flex-1" style={{ backgroundColor: primary, borderRadius: buttonRadius }} disabled={!p.inStock} onClick={onAdd}>
              <ShoppingBag className="h-4 w-4" /> {p.inStock ? 'Add to cart' : 'Out of stock'}
            </Button>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Hello ${shop.name}! I would like to order:\n• ${qty} × ${p.name} @ ${kes(p.price, shop.currency)}\nCould you confirm availability and delivery?\n${shop.location ? `Location: ${shop.location}` : ''}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: '#25D366', borderRadius: buttonRadius }}
              >
                <MessageCircle className="h-4 w-4" /> Order via WhatsApp
              </a>
            )}
          </div>

          <div className="grid gap-2 rounded-lg border border-line bg-white/50 p-3 text-xs text-muted sm:grid-cols-2">
            <span>Held at: {shop.name}</span>
            {shop.location && <span>Location: {shop.location}</span>}
            {shop.phone && <span>Phone: {shop.phone}</span>}
            <span>Payment: M-Pesa or pay on delivery</span>
          </div>
        </div>
      </div>

      {related.data && related.data.filter((r) => r.slug !== p.slug).length > 0 && (
        <Section title="You may also like" action={{ label: 'View all', to: '/shop' }}>
          <ProductGrid products={related.data.filter((r) => r.slug !== p.slug).slice(0, 4)} currency={shop.currency} />
        </Section>
      )}
    </div>
  );
}