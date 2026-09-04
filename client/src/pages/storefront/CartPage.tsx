import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { kes } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export function CartPage() {
  const navigate = useNavigate();
  const { lines, subtotal, setQuantity, remove, clear } = useCart();
  const { currency, primary, buttonRadius, href } = useStorefront();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Your cart"
        subtitle={`${lines.reduce((n, l) => n + l.quantity, 0)} item(s)`}
        actions={
          lines.length > 0 ? (
            <Button variant="outline" onClick={clear}>
              <Trash2 className="h-4 w-4" /> Clear cart
            </Button>
          ) : undefined
        }
      />

      {lines.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Browse the shop and add products to start an order."
            action={
              <Button className="mt-3" onClick={() => navigate(href('/shop'))}>
                Browse shop
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden p-0">
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <li key={l.product.id} className="flex items-center gap-4 px-4 py-3">
                  {l.product.imageUrl ? (
                    <img src={l.product.imageUrl} alt={l.product.name} className="h-14 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary-light text-lg font-bold text-brand">
                      {l.product.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to={href(`/shop/products/${l.product.slug}`)} className="block truncate text-sm font-medium text-ink hover:text-brand">
                      {l.product.name}
                    </Link>
                    <p className="text-xs text-muted">{kes(l.product.price, currency)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantity(l.product.id, l.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-line/40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-ink">{l.quantity}</span>
                    <button
                      onClick={() => setQuantity(l.product.id, l.quantity + 1)}
                      disabled={l.quantity >= l.product.quantity}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-line/40 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="w-20 text-right text-sm font-semibold text-ink">
                    {kes(Number(l.product.price) * l.quantity, currency)}
                  </span>
                  <button
                    onClick={() => remove(l.product.id)}
                    className="text-muted hover:text-danger"
                    aria-label={`Remove ${l.product.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="h-fit p-4">
            <h2 className="text-sm font-semibold text-ink">Order summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{kes(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span>Pay at delivery</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                <span>Total</span>
                <span>{kes(subtotal, currency)}</span>
              </div>
            </div>
            <Button size="lg" className="mt-4 w-full text-white" style={{ backgroundColor: primary, borderRadius: buttonRadius }} onClick={() => navigate(href('/shop/checkout'))}>
              Proceed to checkout
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
