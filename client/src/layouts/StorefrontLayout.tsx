import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, Truck, Twitter, X, Youtube } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { WhatsAppButton } from '@/pages/storefront/components';
import { useCart } from '@/context/CartContext';

const SOCIAL_ICONS: { key: string; icon: typeof Facebook }[] = [
  { key: 'facebook', icon: Facebook },
  { key: 'instagram', icon: Instagram },
  { key: 'tiktok', icon: Facebook },
  { key: 'twitter', icon: Twitter },
  { key: 'youtube', icon: Youtube },
  { key: 'linkedin', icon: Linkedin },
];

function BrandLink({ storeName, logo, primary }: { storeName: string | null; logo: string | null; primary: string }) {
  const { href } = useStorefront();
  return (
    <Link to={href('/')} className="flex items-center gap-2.5">
      {logo ? (
        <img src={logo} alt={storeName ?? 'logo'} className="h-10 w-10 rounded-lg object-cover" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
          {(storeName ?? 'S').charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden text-lg font-bold text-[var(--sf-secondary,#17252D)] sm:block">
        {storeName ?? 'Shop'}
      </span>
    </Link>
  );
}

export function StorefrontLayout() {
  const navigate = useNavigate();
  const { count } = useCart();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { config, isLoading, primary, accent, buttonRadius, href } = useStorefront();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(href(query.trim() ? `/shop?search=${encodeURIComponent(query.trim())}` : '/shop'));
  };

  const contact = config?.contact;
  const social = config?.social;
  const waNumber = contact?.whatsappNumber ? contact.whatsappNumber.replace(/[^0-9]/g, '') : null;
  const showAnnouncement = Boolean(config?.tagline || contact?.phone || contact?.whatsappNumber || contact?.email || contact?.location);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--sf-bg,#F7F5EF)]" style={{ fontFamily: config?.branding.font === 'poppins' ? '"Poppins", sans-serif' : undefined }}>
      {showAnnouncement && (
        <div className="bg-[var(--sf-secondary,#17252D)] text-white">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-[clamp(16px,5vw,80px)] py-1.5">
            <p className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
              <span className="truncate">{config?.tagline || `Welcome to ${config?.storeName ?? 'our store'}`}</span>
            </p>
            <div className="hidden items-center gap-4 text-xs text-white/80 md:flex">
              {contact?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {contact.location}
                </span>
              )}
              {contact?.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-white">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              )}
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}${contact?.whatsappMessage ? `?text=${encodeURIComponent(contact.whatsappMessage)}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold hover:text-white"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b" style={{ borderColor: 'var(--sf-line,#e5e7eb)', backgroundColor: '#ffffff' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <BrandLink storeName={config?.storeName ?? null} logo={config?.logo ?? null} primary={primary} />

          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Store navigation">
            {(config?.navigation ?? []).map((n) =>
              n.href.startsWith('http') ? (
                <a
                  key={n.id}
                  href={n.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--sf-secondary,#17252D)] hover:bg-[var(--sf-line,#eef)]"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.id}
                  to={href(n.href)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--sf-secondary,#17252D)] hover:bg-[var(--sf-line,#eef)]"
                >
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          <form onSubmit={submit} className="flex-1 md:max-w-xs">
            <div
              className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
              style={{ borderColor: 'var(--sf-line,#e5e7eb)', borderRadius: buttonRadius }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                aria-label="Search products"
              />
              <button type="submit" className="text-sm font-medium" style={{ color: primary }}>
                Search
              </button>
            </div>
          </form>

          <Link
            to={href('/shop/cart')}
            className="relative flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-[var(--sf-secondary,#17252D)]"
            style={{ borderColor: 'var(--sf-line,#e5e7eb)', borderRadius: buttonRadius }}
          >
            <ShoppingBag className="h-5 w-5" style={{ color: primary }} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: primary }}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <nav className="flex items-center gap-1 overflow-x-auto border-b bg-white px-4 py-2 md:hidden" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
        {(config?.navigation ?? []).map((n) => (
          <Link key={n.id} to={href(n.href)} className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-[var(--sf-secondary,#17252D)]">
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {isLoading && !config ? (
          <div className="py-24 text-center text-sm text-[var(--sf-muted,#6B7280)]">Loading store…</div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="mt-4 border-t" style={{ borderColor: 'var(--sf-line,#e5e7eb)', backgroundColor: '#ffffff' }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {config?.logo ? (
                <img src={config.logo} alt={config.storeName ?? 'logo'} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                  {(config?.storeName ?? 'S').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-lg font-bold text-[var(--sf-secondary,#17252D)]">{config?.storeName ?? 'Shop'}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--sf-muted,#6B7280)]">
              {config?.tagline || `${config?.storeName ?? 'Our store'} is your trusted neighbourhood shop — quality products, great prices, delivered your way.`}
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_ICONS.filter((s) => social?.[s.key as keyof typeof social]).map((s) => {
                const url = social?.[s.key as keyof typeof social];
                return (
                  <a
                    key={s.key}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: primary }}
                    aria-label={s.key}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                );
              })}
              {contact?.whatsappNumber && (
                <a
                  href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:opacity-80"
                  style={{ backgroundColor: '#25D366' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted,#6B7280)]">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--sf-secondary,#17252D)]">
              {(config?.navigation ?? []).map((n) => (
                <li key={n.id}>
                  <Link to={href(n.href)} className="inline-flex items-center gap-1.5 transition-colors hover:underline" style={{ color: 'var(--sf-secondary,#17252D)' }}>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={href('/shop')} className="transition-colors hover:underline">All products</Link>
              </li>
              <li>
                <Link to={href('/shop/cart')} className="transition-colors hover:underline">Your cart</Link>
              </li>
            </ul>
          </div>

          {(config?.categories?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted,#6B7280)]">Categories</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {config!.categories!.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link to={href(`/categories/${encodeURIComponent(c.name)}`)} className="transition-colors hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted,#6B7280)]">Get in touch</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--sf-secondary,#17252D)]">
              {contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: primary }} />
                  <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: primary }} />
                  <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                </li>
              )}
              {(contact?.location || contact?.address) && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} />
                  <span>{contact.address || contact.location}</span>
                </li>
              )}
              {(contact?.openingHours?.length ?? 0) > 0 && (
                <li className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} />
                  <ul className="space-y-1">
                    {contact?.openingHours?.slice(0, 4).map((h) => (
                      <li key={h.day} className="flex justify-between gap-6">
                        <span className="text-[var(--sf-muted,#6B7280)]">{h.day}</span>
                        <span>{h.open} – {h.close}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t px-4 py-5" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-[var(--sf-muted,#6B7280)] sm:flex-row">
            <p>{config?.copyright || `${config?.storeName ?? 'Shop'} · All rights reserved.`}</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> M-Pesa & pay on delivery
              </span>
              <span>Powered by DukaStock</span>
            </div>
          </div>
        </div>
      </footer>

      {contact?.showWhatsappBtn && contact?.whatsappNumber && (
        <WhatsAppButton number={contact.whatsappNumber} message={contact.whatsappMessage} primary={primary} floating />
      )}
    </div>
  );
}
