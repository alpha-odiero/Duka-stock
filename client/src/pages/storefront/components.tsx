import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Plus, ShieldCheck, ShoppingBag, Star, Store as StoreIcon } from 'lucide-react';
import type { PublicCategory, PublicProduct } from '@/types';
import { kes } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

// ---- WhatsApp ----

export function WhatsAppButton({
  number,
  message,
  primary,
  floating = false,
}: {
  number: string;
  message?: string | null;
  primary: string;
  floating?: boolean;
}) {
  const wa = number.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-30 flex h-13 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: primary }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" /> WhatsApp
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
      style={{ backgroundColor: '#25D366' }}
    >
      <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
    </a>
  );
}

// ---- Hero ----

// ---- Reusable section wrapper ----

export function Section({ title, accent, children, action }: { title: string; accent?: string; children: React.ReactNode; action?: { label: string; to: string } }) {
  const { href, primary } = useStorefront();
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <SectionHeading title={title} accent={accent} />
        {action && (
          <Link to={href(action.to)} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: primary }}>
            {action.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// ---- Trust / value strip ----

export function TrustStrip({ contact }: { contact: { phone?: string | null; whatsappNumber?: string | null; location?: string | null } | null }) {
  const wa = contact?.whatsappNumber ? `https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined;
  const items = [
    { key: 'online', icon: ShoppingBag, title: 'Order online', sub: 'Browse & check out in minutes' },
    { key: 'collect', icon: StoreIcon, title: 'Visit or collect', sub: contact?.location || 'In-store pickup · pay at delivery' },
    { key: 'chat', icon: MessageCircle, title: 'WhatsApp support', sub: contact?.whatsappNumber || 'We respond fast', href: wa || (contact?.phone ? `tel:${contact.phone}` : undefined) },
    { key: 'pay', icon: ShieldCheck, title: 'M-Pesa & COD', sub: 'Pay on delivery, cash or M-Pesa' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((c, i) => {
        const inner = (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: i % 2 === 0 ? 'var(--sf-primary,#176B5B)' : 'var(--sf-secondary,#17252D)' }}>
            <c.icon className="h-5 w-5" />
          </span>
        );
        return (
          <div key={c.key} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                {inner}
                <span>
                  <span className="block text-sm font-bold text-[var(--sf-secondary,#17252D)]">{c.title}</span>
                  <span className="block text-xs text-[var(--sf-muted,#6B7280)]">{c.sub}</span>
                </span>
              </a>
            ) : (
              <>
                {inner}
                <span>
                  <span className="block text-sm font-bold text-[var(--sf-secondary,#17252D)]">{c.title}</span>
                  <span className="block text-xs text-[var(--sf-muted,#6B7280)]">{c.sub}</span>
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Hero ----

export function StoreHero({
  title,
  subtitle,
  description,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
  imageUrl,
  backgroundEnabled,
  alignment,
  primary,
  accent,
  buttonRadius,
  stats,
}: {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  primaryText: string | null;
  primaryLink: string | null;
  secondaryText: string | null;
  secondaryLink: string | null;
  imageUrl: string | null;
  backgroundEnabled: boolean;
  alignment: 'left' | 'center';
  primary: string;
  accent: string;
  buttonRadius: string;
  stats?: { products: number; reviews: number; customers: number } | null;
}) {
  const align = alignment === 'center' ? 'items-center text-center' : 'items-start text-left';
  const { href } = useStorefront();
  const chips = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    if (stats?.products) list.push({ label: 'In catalogue', value: `${stats.products.toLocaleString()} products` });
    if (stats?.reviews) list.push({ label: 'Customer love', value: `★ ${stats.reviews} reviews` });
    if (stats?.customers) list.push({ label: 'Community', value: `${stats.customers.toLocaleString()} customers` });
    return list;
  }, [stats]);
  return (
    <section
      className={cn('relative overflow-hidden rounded-2xl px-6 py-12 sm:px-10 sm:py-16', align)}
      style={{
        background: backgroundEnabled
          ? primary
          : 'var(--sf-bg, #F7F5EF)',
        color: backgroundEnabled ? '#ffffff' : 'var(--sf-secondary, #17252D)',
      }}
    >
      <div className="relative z-10 flex max-w-2xl flex-col gap-3">
        {subtitle && (
          <span className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}22`, color: backgroundEnabled ? '#fff' : accent }}>
            {subtitle}
          </span>
        )}
        {title && <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>}
        {description && <p className={cn('max-w-lg text-sm sm:text-base', backgroundEnabled ? 'text-white/80' : 'opacity-80')}>{description}</p>}
        {(primaryText || secondaryText) && (
          <div className={cn('mt-2 flex flex-wrap gap-3', alignment === 'center' && 'justify-center')}>
            {primaryText && (
              <Link
                to={href(primaryLink || '/shop')}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: primary, borderRadius: buttonRadius, color: backgroundEnabled ? primaryTextColorOn(primary) : '#fff' }}
              >
                {primaryText}
              </Link>
            )}
            {secondaryText && (
              <Link
                to={href(secondaryLink || '/shop')}
                className="inline-flex items-center justify-center border px-5 py-2.5 text-sm font-semibold"
                style={{
                  borderColor: backgroundEnabled ? 'rgba(255,255,255,0.5)' : primary,
                  color: backgroundEnabled ? '#fff' : primary,
                  borderRadius: buttonRadius,
                }}
              >
                {secondaryText}
              </Link>
            )}
          </div>
        )}
        {chips.length > 0 && (
          <div className={cn('mt-4 flex flex-wrap gap-3', alignment === 'center' && 'justify-center')}>
            {chips.map((c) => (
              <span
                key={c.label}
                className={cn(
                  'flex flex-col rounded-xl border px-3.5 py-2 text-left backdrop-blur',
                  backgroundEnabled ? 'border-white/25 bg-white/10 text-white' : 'border-[var(--sf-line,#e5e7eb)] bg-white text-[var(--sf-secondary,#17252D)]',
                )}
              >
                <span className="text-[11px] font-medium opacity-75">{c.label}</span>
                <span className="text-sm font-bold">{c.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {imageUrl && (
        <>
          <div
            className={cn(
              'pointer-events-none absolute inset-0',
              backgroundEnabled && 'bg-gradient-to-r from-black/25 to-transparent',
            )}
          />
          <img
            src={imageUrl}
            alt=""
            className="pointer-events-none absolute right-0 top-1/2 hidden h-[85%] w-auto -translate-y-1/2 rounded-xl object-cover opacity-90 shadow-2xl sm:block"
          />
        </>
      )}
    </section>
  );
}

function primaryTextColorOn(bg: string) {
  // Simple contrast: light backgrounds get dark text.
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#17252D' : '#ffffff';
}

// ---- Section heading ----

export function SectionHeading({ title, accent }: { title: string; accent?: string }) {
  return (
    <h2 className="text-xl font-bold text-[var(--sf-secondary,#17252D)] sm:text-2xl">
      {title}
      {accent && <span className="ml-2 h-1.5 w-8 rounded-full align-middle" style={{ backgroundColor: accent }} />}
    </h2>
  );
}

// ---- Category showcase ----

export function CategoryShowcase({
  categories,
  primary,
  secondary,
  accent,
}: {
  categories: PublicCategory[];
  primary: string;
  secondary: string;
  accent: string;
}) {
  const { href } = useStorefront();
  const visible = categories.filter((c) => (c._count?.products ?? 0) > 0).slice(0, 8);
  if (visible.length === 0) return null;
  const tones = [primary, secondary, accent, primary];
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <SectionHeading title="Shop by category" accent={accent} />
        <Link to={href('/shop')} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: primary }}>
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((c, i) => (
          <Link
            key={c.id}
            to={href(`/categories/${encodeURIComponent(c.name)}`)}
            className="group relative overflow-hidden rounded-xl p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: tones[i % tones.length] }}
          >
            <span className="pointer-events-none absolute -right-3 -top-4 text-7xl font-black opacity-15">
              {c.name.charAt(0).toUpperCase()}
            </span>
            <p className="relative text-sm font-bold">{c.name}</p>
            <p className="relative mt-1 text-xs text-white/75">{c._count?.products ?? 0} product{c._count?.products === 1 ? '' : 's'}</p>
            <span
              className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: accent === tones[i % tones.length] ? '#fff' : accent }}
            >
              Browse <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---- Category pills ----

export function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: PublicCategory[];
  active?: string;
  onSelect: (name?: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          'rounded-full border px-3 py-1.5 text-xs font-medium transition',
          !active ? 'text-white' : 'border-[var(--sf-text,transparent)] text-[var(--sf-secondary,#17252D)] hover:bg-[var(--sf-line,#eee)]',
        )}
        style={!active ? { backgroundColor: 'var(--sf-primary,#176B5B)', borderColor: 'var(--sf-primary,#176B5B)' } : {}}
      >
        All
      </button>
      {categories.map((c) => {
        const isActive = active === c.name;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.name)}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
            style={
              isActive
                ? { backgroundColor: 'var(--sf-primary,#176B5B)', borderColor: 'var(--sf-primary,#176B5B)', color: '#fff' }
                : { borderColor: 'var(--sf-line,#e5e7eb)', color: 'var(--sf-secondary,#17252D)' }
            }
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

// ---- Product grid ----

export function ProductGrid({
  products,
  currency,
}: {
  products: PublicProduct[];
  currency: string;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const { href } = useStorefront();
  const onAdd = (p: PublicProduct) => {
    if (!p.inStock) return;
    add(p);
    toast(`${p.name} added to cart`);
  };
  if (products.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[var(--sf-muted,#6B7280)]">No products to show yet.</p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <div
          key={p.id}
          className="group flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg"
          style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}
        >
          <Link to={href(`/shop/products/${p.slug}`)} className="relative block overflow-hidden">
            <div className="aspect-square w-full bg-[var(--sf-line,#eef)]">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[var(--sf-line,#ccc)]">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {!p.inStock ? (
              <span className="absolute left-2 top-2 rounded-full bg-danger px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Out of stock
              </span>
            ) : p.stockStatus === 'low' ? (
              <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Low stock
              </span>
            ) : null}
          </Link>
          <div className="flex flex-1 flex-col p-3">
            <Link to={href(`/shop/products/${p.slug}`)}>
              <p className="truncate text-sm font-semibold text-[var(--sf-secondary,#17252D)]">{p.name}</p>
            </Link>
            {p.category && (
              <p className="mt-0.5 truncate text-[11px] text-[var(--sf-muted,#6B7280)]">{p.category.name}</p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--sf-primary,#176B5B)' }}>
                  {kes(p.price, currency)}
                </p>
                
              </div>
              <button
                onClick={() => onAdd(p)}
                disabled={!p.inStock}
                className="flex h-8 w-8 items-center justify-center rounded-md text-white transition disabled:opacity-40"
                style={{ backgroundColor: 'var(--sf-primary,#176B5B)' }}
                aria-label={`Add ${p.name} to cart`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Features (Why choose us) ----

export function FeaturesGrid({ features, primary }: { features: { icon: string | null; title: string; description: string }[]; primary: string }) {
  if (features.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="rounded-xl border bg-white p-5" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
            <Star className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[var(--sf-secondary,#17252D)]">{f.title}</p>
          <p className="mt-1 text-sm text-[var(--sf-muted,#6B7280)]">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Testimonials ----

export function TestimonialsGrid({ items, accent }: { items: { customerName: string; role: string | null; content: string; rating: number; imageUrl: string | null }[]; accent?: string }) {
  if (items.length === 0) return null;
  const color = accent ?? 'var(--sf-primary,#176B5B)';
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <div key={t.customerName + t.content.slice(0, 20)} className="relative overflow-hidden rounded-xl border bg-white p-5" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <span className="pointer-events-none absolute -top-3 right-2 text-6xl font-black" style={{ color: `${color}1f` }}>“</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, n) => (
              <Star key={n} className={cn('h-3.5 w-3.5', n < t.rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--sf-line,#ddd)]')} />
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--sf-secondary,#17252D)]">“{t.content}”</p>
          <div className="mt-4 flex items-center gap-3">
            {t.imageUrl ? (
              <img src={t.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
                {t.customerName.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--sf-secondary,#17252D)]">{t.customerName}</p>
              {t.role && <p className="text-xs text-[var(--sf-muted,#6B7280)]">{t.role}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- FAQ ----

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="space-y-2">
      {items.map((f) => (
        <details key={f.question} className="group rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--sf-secondary,#17252D)]">
            {f.question}
            <Plus className="ml-2 h-4 w-4 shrink-0 transition-transform group-open:rotate-45" style={{ color: 'var(--sf-primary,#176B5B)' }} />
          </summary>
          <p className="mt-2 text-sm text-[var(--sf-muted,#6B7280)]">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
