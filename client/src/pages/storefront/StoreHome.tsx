import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Phone } from 'lucide-react';
import { storeService } from '@/services/store';
import { useStorefront } from '@/context/StorefrontContext';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import {
  CategoryPills,
  FaqList,
  FeaturesGrid,
  ProductGrid,
  Section,
  TestimonialsGrid,
  WhatsAppButton,
} from './components';
import { SectionRenderer } from './sections';
import { OffersSection } from './sections';

export function StoreHome() {
  const [params] = useSearchParams();
  const category = params.get('category') || undefined;
  const search = params.get('search') || undefined;
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);

  const {
    config,
    isLoading: configLoading,
    isError: configError,
    refetch,
    primary,
    accent,
    currency,
    buttonRadius,
    shopName,
    href,
  } = useStorefront();

  const products = useQuery({
    queryKey: ['store', 'products', { shop: shopName, category: selectedCategory, search }],
    queryFn: () => storeService.listProducts({ shop: shopName, category: selectedCategory, search }),
  });

  // Curated ~80 product homepage selection (used when not filtering/searching).
  const curatedProducts = useQuery({
    queryKey: ['store', 'curated', shopName] as const,
    queryFn: () => storeService.listCurated(shopName),
    enabled: !selectedCategory && !search,
  });

  // Active offers & promotions for the homepage.
  const offers = useQuery({
    queryKey: ['store', 'offers', shopName] as const,
    queryFn: () => storeService.listOffers(shopName),
    enabled: !selectedCategory && !search,
  });

  const categories = useQuery({
    queryKey: ['store', 'categories', shopName] as const,
    queryFn: () => storeService.listCategories(shopName),
  });

  if (configError && !config) {
    return (
      <Card className="p-8">
        <ErrorState onRetry={refetch} />
      </Card>
    );
  }
  if (configLoading && !config) {
    return (
      <Card className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </Card>
    );
  }

  const cfg = config!;
  const all = selectedCategory || search ? (products.data ?? []) : (curatedProducts.data ?? products.data ?? []);
  const cats = categories.data ?? [];
  const liveOffers = offers.data ?? [];

  const sectionEnabled = (key: string) => cfg.sections.find((s) => s.section === key)?.enabled ?? true;
  const orderedSections = [...cfg.sections].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.section);

  // When searching or filtering, show the focused product view (existing behaviour).
  if (selectedCategory || search) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sf-secondary,#17252D)]">
              {selectedCategory ? selectedCategory : search ? `Results for "${search}"` : 'Shop'}
            </h1>
            <p className="text-sm text-[var(--sf-muted,#6B7280)]">
              {search ? `${all.length} product(s) found` : `Browse the ${selectedCategory} collection`}
            </p>
          </div>
          <Link to={href('/shop')} className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: primary }}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {cats.length > 0 && (
          <CategoryPills categories={cats} active={selectedCategory} onSelect={(name) => setSelectedCategory(name)} />
        )}

        {products.isLoading && (
          <Card className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </Card>
        )}
        {products.isError && <ErrorState onRetry={() => products.refetch()} />}
        {products.data && all.length === 0 && (
          <Card>
            <EmptyState title="No products here" description="This category is empty or nothing matched your search." />
          </Card>
        )}
        {!products.isLoading && all.length > 0 && <ProductGrid products={all} currency={currency} />}
      </div>
    );
  }

  // Sections rendered by the shared SectionRenderer (polished, data-driven).
  const rendererSections = ['hero', 'benefits', 'categories', 'featured', 'popular', 'new', 'promo', 'promo_cards', 'newsletter'];
  const renderSection: Record<string, () => React.ReactNode> = {
    ...Object.fromEntries(
      rendererSections
        .filter((key) => key === 'hero' ? cfg.hero.show : true)
        .map((key) => [
          key,
          () => <SectionRenderer type={key} config={cfg} products={all} categories={cats} />,
        ]),
    ),
    stats: () => null,
    about: () =>
      cfg.about ? (
        <section className="grid items-center gap-6 rounded-2xl border bg-white p-6 lg:grid-cols-2" style={{ borderColor: 'var(--sf-line,#e5e7eb)' }}>
          <div className="order-1">
            <Section title={cfg.about.title || 'About us'} accent={accent}>
              <p className="text-sm leading-relaxed text-[var(--sf-secondary,#17252D)]">
                {cfg.about.introduction || cfg.about.story || cfg.about.mission || cfg.about.vision}
              </p>
              {cfg.about.mission && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--sf-muted,#6B7280)]">
                  <span className="font-semibold text-[var(--sf-secondary,#17252D)]">Mission: </span>
                  {cfg.about.mission}
                </p>
              )}
              {cfg.about.values && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--sf-muted,#6B7280)]">
                  {cfg.about.values}
                </p>
              )}
            </Section>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {cfg.about.customerCount > 0 && (
                <span className="rounded-lg px-3 py-2 text-sm font-bold" style={{ backgroundColor: `${primary}18`, color: primary }}>
                  {cfg.about.customerCount.toLocaleString()}+ customers
                </span>
              )}
              {cfg.about.yearEstablished && (
                <span className="rounded-lg px-3 py-2 text-sm font-bold text-[var(--sf-secondary,#17252D)]" style={{ backgroundColor: 'var(--sf-line,#eef)' }}>
                  Since {cfg.about.yearEstablished}
                </span>
              )}
              <Link
                to={href('/about')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: primary }}
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {cfg.about.imageUrl && (
            <img src={cfg.about.imageUrl} alt="" className="order-2 aspect-[4/3] w-full rounded-xl object-cover" />
          )}
        </section>
      ) : null,
    why: () =>
      cfg.features.length > 0 && (
        <Section title="Why choose us" accent={accent}>
          <FeaturesGrid features={cfg.features} primary={primary} />
        </Section>
      ),
    testimonials: () =>
      cfg.testimonials.length > 0 && (
        <Section title="What our customers say" accent={accent}>
          <TestimonialsGrid items={cfg.testimonials} accent={accent} />
        </Section>
      ),
    faq: () =>
      cfg.faqs.length > 0 && (
        <Section title="Frequently asked questions" accent={accent}>
          <FaqList items={cfg.faqs} />
        </Section>
      ),
    cta: () => (
      <section
        className="flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center text-white"
        style={{ backgroundColor: primary }}
      >
        <h2 className="text-2xl font-bold">{cfg.contact?.title || `Get in touch with ${cfg.storeName ?? 'us'}`}</h2>
        <p className="max-w-md text-sm text-white/80">{cfg.contact?.description || 'Questions about an order? We are happy to help.'}</p>
        {cfg.contact?.phone && (
          <a href={`tel:${cfg.contact.phone}`} className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:underline">
            <Phone className="h-4 w-4" /> {cfg.contact.phone}
          </a>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {cfg.contact?.whatsappNumber && <WhatsAppButton number={cfg.contact.whatsappNumber} message={cfg.contact.whatsappMessage} primary="#fff" />}
          <Link
            to={href('/shop/cart')}
            className="inline-flex items-center gap-2 rounded-md border border-white/60 px-4 py-2 text-sm font-semibold text-white"
            style={{ borderRadius: buttonRadius }}
          >
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    ),
    offers: () => <OffersSection offers={liveOffers} currency={currency} />,
  };

  const enabledKeys = orderedSections.filter((key) => (sectionEnabled(key) || key === 'hero') && renderSection[key]);

  // Insert the new reference-design sections at stable default positions. They
  // are data-driven and self-hide when there is no backing content, so this is
  // safe for merchants who have not configured them yet.
  const effectiveKeys: string[] = [];
  for (const key of enabledKeys) {
    if (key === 'categories' && renderSection.benefits && !effectiveKeys.includes('benefits')) effectiveKeys.push('benefits');
    effectiveKeys.push(key);
    if (key === 'categories' && renderSection.offers && !effectiveKeys.includes('offers')) effectiveKeys.push('offers');
    if (key === 'new' && renderSection.promo_cards && !effectiveKeys.includes('promo_cards')) effectiveKeys.push('promo_cards');
  }
  if (renderSection.benefits && !effectiveKeys.includes('benefits')) effectiveKeys.unshift('benefits');
  if (renderSection.offers && !effectiveKeys.includes('offers')) effectiveKeys.push('offers');
  if (renderSection.promo_cards && !effectiveKeys.includes('promo_cards')) effectiveKeys.push('promo_cards');

  const rendered = effectiveKeys.map((key) => renderSection[key]());

  return (
    <div className="space-y-12">
      {rendered.map((node, i) => (
        <div key={i}>{node}</div>
      ))}
    </div>
  );
}