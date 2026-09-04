import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Star,
  Store as StoreIcon,
  Truck,
} from 'lucide-react';
import type { PublicCategory, PublicOffer, PublicProduct, PublicStorefrontConfig } from '@/types';
import { kes } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

// ===========================================================================
// Design tokens
// Colour strings arrive as CSS variables (set by the storefront context) with
// hard-coded fallbacks so sections never fail outside the provider.
// ===========================================================================

const v = {
  primary: 'var(--sf-primary,#0f172a)',
  primaryLight: 'var(--sf-primary-light,#1e293b)',
  secondary: 'var(--sf-secondary,#1e293b)',
  accent: 'var(--sf-accent,#f97316)',
  accentHover: 'var(--sf-accent-hover,#d95f0b)',
  accentSoft: 'var(--sf-accent-soft,rgba(249,115,22,0.14))',
  bg: 'var(--sf-bg,#f8fafc)',
  surface: 'var(--sf-surface,#ffffff)',
  warm: 'var(--sf-warm,#fff7ed)',
  muted: 'var(--sf-muted,#94a3b8)',
  line: 'var(--sf-line,#e2e8f0)',
  lineSubtle: 'var(--sf-line-subtle,#f1f5f9)',
  text: 'var(--sf-text,#111827)',
  textSecondary: 'var(--sf-text-secondary,#64748b)',
  success: 'var(--sf-success,#16a34a)',
  warning: 'var(--sf-warning,#f59e0b)',
  error: 'var(--sf-error,#dc2626)',
  info: 'var(--sf-info,#2563eb)',
};


// ---- Shared section header -----------------------------------------------

function SectionHeading({
  eyebrow,
  title,
  accent,
  center,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-1', center && 'items-center text-center')}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: accent ?? v.accent }}>
          {eyebrow}
        </span>
      )}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight text-[var(--sf-text,#111827)] sm:text-2xl">{title}</h2>
        {accent && <span className="h-1 w-8 rounded-full" style={{ backgroundColor: accent }} />}
      </div>
    </div>
  );
}

export function Section({ title, eyebrow, accent, center, action, children }: {
  title: string;
  eyebrow?: string;
  accent?: string;
  center?: boolean;
  action?: { label: string; to: string };
  children: React.ReactNode;
}) {
  const { href } = useStorefront();
  return (
    <section className="mx-auto w-full px-[clamp(16px,5vw,80px)]">
      <div className={cn('flex flex-wrap items-end justify-between gap-3', center && 'justify-center')}>
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} center={center} />
        {action && (
          <Link
            to={href(action.to)}
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-black/5"
            style={{ borderColor: v.line, color: v.accent }}
          >
            {action.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

// ===========================================================================
// Hero
// Supports split-screen (image side), centred, and full-bleed background modes
// using merchant-provided hero data. Falls back gracefully when unconfigured.
// ===========================================================================

export function HeroSection({ config }: { config: PublicStorefrontConfig }) {
  const { buttonRadius, href } = useStorefront();
  const hero = config.hero;
  const imageUrl = hero.imageUrl ?? config.logo ?? null;
  const hasContent = Boolean(hero.title || hero.subtitle || hero.description || hero.primaryText || hero.secondaryText);

  const isCenter = hero.alignment === 'center';
  const bgEnabled = hero.backgroundEnabled;

  const heading = hero.title || config.tagline || (config.storeName ? `Welcome to ${config.storeName}` : '');

  // -------------------------------------------------------------------
  // Full-bleed background image hero (MERCHANT image is the backdrop).
  // The promo image is stretched behind the whole section with a dark
  // overlay so the text stays legible. This is the classic "big
  // background image" hero.
  // -------------------------------------------------------------------
  if (imageUrl) {
    return (
      <section className="w-full">
        <div className="relative flex min-h-[68vh] w-full items-center overflow-hidden md:min-h-[80vh]">
          {/* Background layer */}
          <img
            src={imageUrl}
            alt={config.storeName ?? 'storefront'}
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden="true"
            loading="eager"
          />
          {/* Legibility overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${v.secondary}E6 0%, ${v.secondary}99 45%, ${v.secondary}33 100%)`,
            }}
          />
          {/* Foreground content */}
          <div
            className={cn(
              'relative z-10 mx-auto w-full max-w-[1600px] px-[clamp(16px,5vw,80px)] py-20 md:py-28',
              isCenter ? 'text-center' : 'text-left',
            )}
          >
            <div className={cn('flex flex-col gap-5', isCenter ? 'mx-auto max-w-3xl items-center' : 'max-w-2xl items-start')}>
              {hero.subtitle && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {hero.subtitle}
                </span>
              )}
              {heading && (
                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {heading}
                </h1>
              )}
              {hero.description && (
                <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                  {hero.description}
                </p>
              )}
              {(hero.primaryText || hero.secondaryText) && (
                <div className={cn('mt-2 flex flex-wrap gap-3', isCenter && 'justify-center')}>
                  {hero.primaryText && (
                    <Link
                      to={href(hero.primaryLink || '/shop')}
                      className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                      style={{ backgroundColor: v.accent, borderRadius: buttonRadius }}
                    >
                      {hero.primaryText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                  {hero.secondaryText && (
                    <Link
                      to={href(hero.secondaryLink || '/shop')}
                      className="inline-flex items-center justify-center border border-white/50 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      style={{ borderRadius: buttonRadius }}
                    >
                      {hero.secondaryText}
                    </Link>
                  )}
                </div>
              )}
              {hasContent === false && (
                <p className="text-sm text-white/80">{config.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------
  // No background image: centred or split layout on a theme gradient
  // (or a soft card when backgroundEnabled is off).
  // -------------------------------------------------------------------
  return (
    <section className="w-full">
      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCenter ? 'py-20 text-center sm:py-24' : 'py-16 sm:py-20',
          bgEnabled ? 'text-white' : '',
        )}
        style={
          bgEnabled
            ? { background: v.primary }
            : { background: 'linear-gradient(180deg, var(--sf-warm,#fff7ed) 0%, var(--sf-bg,#f8fafc) 100%)' }
        }
      >
        <div
          className={cn(
            'relative z-10 mx-auto w-full max-w-[1600px] px-[clamp(16px,5vw,80px)]',
            isCenter ? 'flex flex-col items-center text-center' : 'grid items-center gap-10 lg:grid-cols-2',
          )}
        >
          {isCenter ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
              {hero.subtitle && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold',
                    bgEnabled ? 'bg-white/15 text-white' : 'text-[var(--sf-accent,#f97316)]',
                  )}
                  style={!bgEnabled ? { backgroundColor: v.accentSoft } : undefined}
                >
                  {hero.subtitle}
                </span>
              )}
              {heading && <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{heading}</h1>}
              {hero.description && (
                <p className={cn('max-w-xl text-base leading-relaxed sm:text-lg', bgEnabled ? 'text-white/85' : 'text-[var(--sf-muted,#6B7280)]')}>
                  {hero.description}
                </p>
              )}
              {(hero.primaryText || hero.secondaryText) && (
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {hero.primaryText && (
                    <Link
                      to={href(hero.primaryLink || '/shop')}
                      className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                      style={{ backgroundColor: bgEnabled ? '#ffffff' : v.accent, borderRadius: buttonRadius, color: bgEnabled ? v.secondary : '#fff' }}
                    >
                      {hero.primaryText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                  {hero.secondaryText && (
                    <Link
                      to={href(hero.secondaryLink || '/shop')}
                      className="inline-flex items-center justify-center border px-8 py-3.5 text-sm font-semibold transition hover:bg-black/5"
                      style={{
                        borderColor: bgEnabled ? 'rgba(255,255,255,0.5)' : v.primary,
                        color: bgEnabled ? '#fff' : v.primary,
                        borderRadius: buttonRadius,
                      }}
                    >
                      {hero.secondaryText}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                {hero.subtitle && (
                  <span
                    className={cn(
                      'inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold',
                      bgEnabled ? 'bg-white/15 text-white' : 'text-[var(--sf-accent,#f97316)]',
                    )}
                    style={!bgEnabled ? { backgroundColor: v.accentSoft } : undefined}
                  >
                    {hero.subtitle}
                  </span>
                )}
                {heading && <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{heading}</h1>}
                {hero.description && (
                  <p className={cn('max-w-lg text-base leading-relaxed sm:text-lg', bgEnabled ? 'text-white/85' : 'text-[var(--sf-muted,#6B7280)]')}>
                    {hero.description}
                  </p>
                )}
                {(hero.primaryText || hero.secondaryText) && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {hero.primaryText && (
                      <Link
                        to={href(hero.primaryLink || '/shop')}
                        className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                        style={{ backgroundColor: bgEnabled ? '#ffffff' : v.accent, borderRadius: buttonRadius, color: bgEnabled ? v.secondary : '#fff' }}
                      >
                        {hero.primaryText} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    )}
                    {hero.secondaryText && (
                      <Link
                        to={href(hero.secondaryLink || '/shop')}
                        className="inline-flex items-center justify-center border px-8 py-3.5 text-sm font-semibold transition hover:bg-black/5"
                        style={{
                          borderColor: bgEnabled ? 'rgba(255,255,255,0.5)' : v.primary,
                          color: bgEnabled ? '#fff' : v.primary,
                          borderRadius: buttonRadius,
                        }}
                      >
                        {hero.secondaryText}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div
                className={cn('hidden items-center justify-center lg:flex', bgEnabled ? '' : 'rounded-2xl border border-dashed')}
                style={!bgEnabled ? { borderColor: v.line } : undefined}
              >
                <div
                  className={cn('flex h-64 w-full max-w-md items-center justify-center rounded-2xl', bgEnabled ? 'bg-white/10' : '')}
                >
                  <p className="text-3xl font-black" style={{ color: bgEnabled ? '#fff' : v.primary }}>
                    {(config.storeName ?? 'S').charAt(0).toUpperCase()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Benefits / trust bar
// Built only from REAL shop data (delivery channel, support channel, location,
// payments). Every tile is omitted when its backing data is absent, so there is
// never fabricated marketing copy.
// ===========================================================================

export function BenefitsSection({ config }: { config: PublicStorefrontConfig }) {
  const { href } = useStorefront();
  const contact = config.contact;
  const wa = contact?.whatsappNumber ? `https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}` : null;
  const phoneHref = contact?.phone ? `tel:${contact.phone}` : null;

  const items: { key: string; icon: typeof Truck; title: string; sub: string; href?: string }[] = [];

  if (config.shopName || config.storeName) {
    items.push({
      key: 'store',
      icon: StoreIcon,
      title: config.storeName ?? config.shopName ?? 'Our store',
      sub: 'Shop online or visit us in person.',
      href: href('/') || undefined,
    });
  }
  if (contact?.location || contact?.address) {
    items.push({
      key: 'visit',
      icon: MapPin,
      title: 'Find us',
      sub: contact.address || contact.location || '',
      href: contact.mapsUrl || undefined,
    });
  }
  if (contact?.phone) {
    items.push({ key: 'call', icon: Phone, title: 'Call us', sub: contact.phone, href: phoneHref || undefined });
  }
  if (wa) {
    items.push({ key: 'chat', icon: MessageCircle, title: 'WhatsApp', sub: 'Chat with support instantly', href: wa });
  }
  if (contact?.email) {
    items.push({ key: 'email', icon: Mail, title: 'Email', sub: contact.email, href: `mailto:${contact.email}` });
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => {
          const body = (
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: v.primary }}>
                <c.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[var(--sf-secondary,#17252D)]">{c.title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-[var(--sf-muted,#6B7280)]">{c.sub}</span>
              </span>
            </div>
          );
          const inner = c.href ? (
            <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group flex flex-1 gap-3">
              {body}
            </a>
          ) : (
            body
          );
          return (
            <div key={c.key} className="flex rounded-xl border bg-white p-4 transition-shadow hover:shadow-md" style={{ borderColor: v.line }}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ===========================================================================
// Category collection
// Renders the merchant's real categories with live product counts. When a
// category has no image we show a clean branded monogram tile (no broken UI).
// ===========================================================================

export function CategorySection({ categories }: { categories: PublicCategory[] }) {
  const { href, primary, secondary, accent, buttonRadius } = useStorefront();
  const visible = categories
    .filter((c) => (c._count?.products ?? 0) > 0)
    .slice(0, 8);
  if (visible.length === 0) return null;

  const tones = [primary, secondary, accent, primary];

  return (
    <Section title="Shop by category" eyebrow="Browse" accent={accent} action={{ label: 'View all', to: '/shop' }}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {visible.map((c, i) => (
          <Link
            key={c.id}
            to={href(`/categories/${encodeURIComponent(c.name)}`)}
            className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
            style={{ borderRadius: buttonRadius === '9999px' ? '1rem' : undefined }}
          >
            {/* Category image as the visual backdrop when provided; otherwise a clean branded tone */}
            {c.imageUrl ? (
              <>
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
              </>
            ) : (
              <>
                <span
                  className="absolute inset-0 transition-colors"
                  style={{ backgroundColor: tones[i % tones.length] }}
                />
                <span className="pointer-events-none absolute -right-2 -top-6 select-none text-8xl font-black leading-none opacity-10">
                  {c.name.charAt(0).toUpperCase()}
                </span>
              </>
            )}
            <div className="relative z-10">
              <p className="text-base font-bold drop-shadow-sm">{c.name}</p>
              {c.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{c.description}</p>
              )}
              <span className="mt-2 inline-flex translate-y-1 items-center gap-1 text-xs font-semibold opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                Shop now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ===========================================================================
// Product card
// Uses real product data only. Badges derive from live stock status. Image
// falls back to a branded initial tile. Add-to-cart disabled when out of stock.
// ===========================================================================

export function ProductCard({ product, currency }: { product: PublicProduct; currency: string }) {
  const { add } = useCart();
  const { toast } = useToast();
  const { href, primary, buttonRadius } = useStorefront();

  const addToCart = () => {
    if (!product.inStock) return;
    add(product);
    toast(`${product.name} added to cart`);
  };

  const badge =
    product.stockStatus === 'out' ? { label: 'Out of stock', cls: 'bg-danger text-white' } : product.stockStatus === 'low' ? { label: 'Low stock', cls: 'bg-amber-500 text-white' } : null;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderColor: v.line }}
    >
      <Link to={href(`/shop/products/${product.slug}`)} className="relative block aspect-square overflow-hidden bg-[var(--sf-line,#eef)]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-black text-[var(--sf-secondary,#17252D)]/15">{product.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {badge && (
          <span className={cn('absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm', badge.cls)}>
            {badge.label}
          </span>
        )}
        <span
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="truncate text-[13px] font-medium leading-snug text-[var(--sf-secondary,#17252D)]">{product.name}</p>
        {product.category?.name && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--sf-muted,#6B7280)]">{product.category.name}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[15px] font-bold" style={{ color: primary }}>
              {kes(product.price, currency)}
            </p>
            
          </div>
          <button
            onClick={addToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40',
              product.inStock && 'hover:brightness-110',
            )}
            style={{ backgroundColor: product.inStock ? primary : v.line, borderRadius: buttonRadius }}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, currency }: { products: PublicProduct[]; currency: string }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--sf-muted,#6B7280)]">No products to show yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} currency={currency} />
      ))}
    </div>
  );
}

// ===========================================================================
// Product collections
// Featured products come straight from CMS config. Popular / New arrivals are
// derived deterministically from the real catalog (no fabricated content).
// ===========================================================================

export function FeaturedCollection({ config }: { config: PublicStorefrontConfig }) {
  const { accent } = useStorefront();
  if (config.featured.length === 0) return null;
  return (
    <Section title="Featured products" eyebrow="Top picks" accent={accent} action={{ label: 'View all', to: '/shop' }}>
      <ProductGrid products={config.featured} currency={config.currency} />
    </Section>
  );
}

export function PopularCollection({ products, config }: { products: PublicProduct[]; config: PublicStorefrontConfig }) {
  const { accent } = useStorefront();
  const popular = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  if (popular.length === 0) return null;
  return (
    <Section title="Popular products" eyebrow="Customer favourites" accent={accent} action={{ label: 'View all', to: '/shop' }}>
      <ProductGrid products={popular} currency={config.currency} />
    </Section>
  );
}

export function NewArrivalsCollection({ products, config }: { products: PublicProduct[]; config: PublicStorefrontConfig }) {
  const { accent } = useStorefront();
  const newest = products.slice(0, 8);
  if (newest.length === 0) return null;
  return (
    <Section title="New arrivals" eyebrow="Just added" accent={accent} action={{ label: 'View all', to: '/shop' }}>
      <ProductGrid products={newest} currency={config.currency} />
    </Section>
  );
}

// ===========================================================================
// Promotional banner (split, image + text) — driven by real contact/hero data.
// ===========================================================================

export function PromoBanner({ config }: { config: PublicStorefrontConfig }) {
  const { buttonRadius, href, accent } = useStorefront();
  const contact = config.contact;
  const title = contact?.title || (config.storeName ? `Shop ${config.storeName}` : 'Shop our store');
  const desc = contact?.description || config.tagline || 'Browse the catalogue and order online or in store.';
  const img = config.hero.imageUrl || config.logo || null;
  const hasCta = Boolean(contact?.phone || contact?.whatsappNumber || config.featured.length > 0);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14"
        style={{ backgroundColor: v.primary, color: '#fff' }}
      >
        <div className="relative z-10 grid items-center gap-6 sm:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}33`, color: '#fff' }}>
              {config.tagline || 'Welcome'}
            </span>
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/80">{desc}</p>
            {hasCta && (
              <div className="mt-1 flex flex-wrap gap-3">
                {contact?.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: accent, borderRadius: buttonRadius }}
                  >
                    <Phone className="mr-2 h-4 w-4" /> {contact.phone}
                  </a>
                )}
                <Link
                  to={href('/shop')}
                  className="inline-flex items-center justify-center border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  style={{ borderRadius: buttonRadius }}
                >
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          {img && (
            <div className="relative hidden overflow-hidden rounded-2xl shadow-2xl sm:block">
              <img src={img} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Promotional card grid — a 2-up layout driven from real data: primary card from
// the store's info, secondary card from contact/delivery. Cards hide when empty.
// ===========================================================================

export function PromoCardGrid({ config }: { config: PublicStorefrontConfig }) {
  const { href, primary, accent } = useStorefront();
  const cards: { key: string; title: string; desc: string; icon: typeof Truck; cta: string; to: string; tone: string }[] = [];

  if (config.featured.length > 0) {
    cards.push({
      key: 'featured',
      title: 'Recommended for you',
      desc: 'A hand-picked selection from our catalogue — view the full collection.',
      icon: Star,
      cta: 'Shop featured',
      to: '/shop',
      tone: primary,
    });
  }
  if (config.categories.length > 0) {
    cards.push({
      key: 'categories',
      title: 'Browse by category',
      desc: `${config.categories.length} categories to explore — find exactly what you need.`,
      icon: StoreIcon,
      cta: 'Explore',
      to: '/shop',
      tone: accent,
    });
  }

  if (cards.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.key}
            to={href(c.to)}
            className="group flex items-center justify-between gap-4 rounded-2xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderColor: v.line }}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: c.tone }}>
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-bold text-[var(--sf-secondary,#17252D)]">{c.title}</p>
                <p className="mt-0.5 text-sm text-[var(--sf-muted,#6B7280)]">{c.desc}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: c.tone }}>
              {c.cta} <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===========================================================================
// Newsletter / contact strip — real, honest CTA (no fake subscribe until the
// backend supports subscriptions). Disabled entirely when nothing is usable.
// ===========================================================================

export function NewsletterSection({ config }: { config: PublicStorefrontConfig }) {
  const { buttonRadius, href, primary, accent } = useStorefront();
  const contact = config.contact;
  const hasChannel = Boolean(contact?.phone || contact?.whatsappNumber || contact?.email);
  if (!hasChannel) return null;

  const title = `Stay in touch with ${config.storeName ?? 'our store'}`;
  const desc = contact?.description || 'Hear about new arrivals and special offers.';

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12"
        style={{ backgroundColor: `${primary}0d`, border: '1px solid', borderColor: v.line }}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ backgroundColor: primary }}>
          <Mail className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-[var(--sf-secondary,#17252D)]">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--sf-muted,#6B7280)]">{desc}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {contact?.whatsappNumber && (
            <a
              href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}${contact.whatsappMessage ? `?text=${encodeURIComponent(contact.whatsappMessage)}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#25D366', borderRadius: buttonRadius }}
            >
              <MessageCircle className="h-4 w-4" /> Message us
            </a>
          )}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: v.primary, color: primary, borderRadius: buttonRadius }}
            >
              <Mail className="h-4 w-4" /> Email us
            </a>
          )}
          <Link
            to={href('/shop')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: accent, color: '#fff', borderRadius: buttonRadius }}
          >
            <ShoppingBag className="h-4 w-4" /> Start shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Offers & promotions
// Renders the merchant's live offers (ACTIVE/SCHEDULED) that are visible on the
// storefront. Each card shows the discount and validity window. Self-hides when
// there are no live offers.
// ===========================================================================

function formatOfferValue(offer: PublicOffer, currency: string): string {
  if (offer.discountType === 'PERCENTAGE') return `Save ${offer.discountValue}%`;
  return `Save ${kes(Number(offer.discountValue), currency)}`;
}

export function OffersSection({ offers, currency }: { offers: PublicOffer[]; currency: string }) {
  const { href, primary, accent, buttonRadius } = useStorefront();
  const live = offers.filter((o) => o.status === 'ACTIVE' || o.status === 'SCHEDULED').slice(0, 4);
  if (live.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading eyebrow="Limited time" title="Deals & offers" accent={accent} />
        <Link
          to={href('/shop')}
          className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-black/5"
          style={{ borderColor: v.line, color: v.accent }}
        >
          View deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {live.map((o) => (
          <div
            key={o.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderColor: v.line, borderRadius: buttonRadius === '9999px' ? '1rem' : undefined }}
          >
            {o.imageUrl ? (
              <>
                <img src={o.imageUrl} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {o.status === 'SCHEDULED' ? 'Coming soon' : formatOfferValue(o, currency)}
                </span>
              </>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center" style={{ backgroundColor: `${primary}12` }}>
                <span className="text-2xl font-black" style={{ color: primary }}>
                  {o.status === 'SCHEDULED' ? 'Soon' : formatOfferValue(o, currency)}
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <p className="text-sm font-bold text-[var(--sf-secondary,#17252D)]">{o.name}</p>
              {o.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--sf-muted,#6B7280)]">{o.description}</p>}
              {o.promoCode && (
                <p className="mt-2 inline-flex w-fit rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ borderColor: `${accent}55`, color: accent }}>
                  {o.promoCode}
                </p>
              )}
              {o.endDate && (
                <p className="mt-auto pt-3 text-[11px] text-[var(--sf-muted,#6B7280)]">
                  Ends {new Date(o.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===========================================================================
// Section renderer
// Maps a CMS section key to the matching component. Sections with no backing
// data return null (empty-state safe). Everything reads real config/catalog.
// ===========================================================================

export function SectionRenderer({
  type,
  config,
  products,
  categories,
}: {
  type: string;
  config: PublicStorefrontConfig;
  products: PublicProduct[];
  categories: PublicCategory[];
}) {
  switch (type) {
    case 'hero':
      return <HeroSection config={config} />;
    case 'benefits':
      return <BenefitsSection config={config} />;
    case 'categories':
      return <CategorySection categories={categories} />;
    case 'featured':
      return <FeaturedCollection config={config} />;
    case 'popular':
      return <PopularCollection products={products} config={config} />;
    case 'new':
      return <NewArrivalsCollection products={products} config={config} />;
    case 'promo':
      return <PromoBanner config={config} />;
    case 'promo_cards':
      return <PromoCardGrid config={config} />;
    case 'newsletter':
      return <NewsletterSection config={config} />;
    default:
      return null;
  }
}
