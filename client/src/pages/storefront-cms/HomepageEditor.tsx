import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Star, X } from 'lucide-react';
import { productService } from '@/services/products';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/storefront/ImageUploader';
import { EditorSection, ReorderButtons, ToggleSwitch } from './cms-helpers';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';

const SECTION_OPTIONS: { key: string; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'categories', label: 'Categories' },
  { key: 'featured', label: 'Featured products' },
  { key: 'popular', label: 'Popular products' },
  { key: 'new', label: 'New arrivals' },
  { key: 'stats', label: 'Store stats' },
  { key: 'promo', label: 'Promotional banner' },
  { key: 'about', label: 'About preview' },
  { key: 'why', label: 'Why choose us' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'faq', label: 'FAQ preview' },
  { key: 'cta', label: 'Contact CTA' },
  { key: 'newsletter', label: 'Newsletter / contact' },
];

export function HomepageEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    description: '',
    primaryText: '',
    primaryLink: '',
    secondaryText: '',
    secondaryLink: '',
    imageUrl: '',
    imagePublicId: '',
    backgroundEnabled: false,
    alignment: 'left' as 'left' | 'center',
    show: true,
  });

  // Re-populate the hero form whenever the CMS config loads or changes (e.g.
  // after a save+refetch). Using a useEffect avoids the stale lazy-initializer
  // bug where config is undefined on first render but the form never updates.
  useEffect(() => {
    if (!config?.hero) return;
    const h = config.hero;
    setHero({
      title: h.title ?? '',
      subtitle: h.subtitle ?? '',
      description: h.description ?? '',
      primaryText: h.primaryText ?? '',
      primaryLink: h.primaryLink ?? '',
      secondaryText: h.secondaryText ?? '',
      secondaryLink: h.secondaryLink ?? '',
      imageUrl: h.imageUrl ?? '',
      imagePublicId: h.imagePublicId ?? '',
      backgroundEnabled: h.backgroundEnabled ?? false,
      alignment: (h.alignment as 'left' | 'center') ?? 'left',
      show: h.show ?? true,
    });
  }, [config?.hero]);

  const products = useQuery({ queryKey: ['products', { limit: 200 }], queryFn: () => productService.list({ limit: 200 }) });

  const sectionRows = config ? [...config.sections].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const featuredIds = new Set(config?.featured?.map((f) => f.productId) ?? []);
  const featuredOrder = config ? [...config.featured].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const saveHero = async () => {
    setSaving(true);
    try {
      await storefrontService.updateHero({
        title: hero.title || null,
        subtitle: hero.subtitle || null,
        description: hero.description || null,
        primaryText: hero.primaryText || null,
        primaryLink: hero.primaryLink || null,
        secondaryText: hero.secondaryText || null,
        secondaryLink: hero.secondaryLink || null,
        imageUrl: hero.imageUrl || null,
        imagePublicId: hero.imagePublicId || null,
        backgroundEnabled: hero.backgroundEnabled,
        alignment: hero.alignment,
        show: hero.show,
      });
      invalidate();
      toast('Homepage hero updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const saveSections = async (next: { section: string; enabled: boolean; sortOrder: number }[]) => {
    try {
      await storefrontService.updateSections(next);
      invalidate();
      toast('Homepage sections updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const onToggleSection = (index: number) => {
    const rows = sectionRows.map((s) => ({ section: s.section, enabled: s.enabled, sortOrder: s.sortOrder }));
    rows[index] = { ...rows[index], enabled: !rows[index].enabled };
    void saveSections(rows);
  };

  const onMoveSection = (index: number, dir: -1 | 1) => {
    const rows = sectionRows.map((s) => ({ section: s.section, enabled: s.enabled, sortOrder: s.sortOrder }));
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const tmp = rows[index];
    rows[index] = { ...rows[target], sortOrder: index };
    rows[target] = { ...tmp, sortOrder: target };
    void saveSections(rows);
  };

  const toggleFeatured = async (productId: string) => {
    try {
      if (featuredIds.has(productId)) {
        const row = config?.featured?.find((f) => f.productId === productId);
        if (row)         await storefrontService.removeFeatured(row.id);
        toast('Removed from featured');
      } else {
        await storefrontService.addFeatured(productId);
        toast('Added to featured');
      }
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="divide-y divide-line">
          <EditorSection
            title="Hero section"
            action={<ToggleSwitch checked={hero.show} onChange={(v) => setHero({ ...hero, show: v })} label="Visible" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Hero title" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} placeholder="Quality Products. Better Prices. Delivered to You." />
              </div>
              <div className="sm:col-span-2">
                <Input label="Subtitle" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} placeholder="Shop everyday essentials from our store." />
              </div>
              <div className="sm:col-span-2">
                <Textarea label="Description" rows={3} value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
              </div>
              <Input label="Primary button text" value={hero.primaryText} onChange={(e) => setHero({ ...hero, primaryText: e.target.value })} placeholder="Shop Now" />
              <Input label="Primary button link" value={hero.primaryLink} onChange={(e) => setHero({ ...hero, primaryLink: e.target.value })} placeholder="/shop" />
              <Input label="Secondary button text" value={hero.secondaryText} onChange={(e) => setHero({ ...hero, secondaryText: e.target.value })} placeholder="Contact Us" />
              <Input label="Secondary button link" value={hero.secondaryLink} onChange={(e) => setHero({ ...hero, secondaryLink: e.target.value })} placeholder="/contact" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select
                label="Alignment"
                value={hero.alignment}
                onChange={(e) => setHero({ ...hero, alignment: e.target.value as 'left' | 'center' })}
                options={[
                  { value: 'left', label: 'Left aligned' },
                  { value: 'center', label: 'Centered' },
                ]}
              />
              <div className="flex items-end pb-2">
                <ToggleSwitch checked={hero.backgroundEnabled} onChange={(v) => setHero({ ...hero, backgroundEnabled: v })} label="Use tinted background" />
              </div>
            </div>
            <div className="mt-4">
              <ImageUploader
                label="Hero image"
                value={hero.imageUrl}
                onChange={(img) => setHero({ ...hero, imageUrl: img.url ?? '', imagePublicId: img.publicId ?? '' })}
                folder="dukastock/storefront/hero"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={saveHero} loading={saving}>Save hero</Button>
            </div>
          </EditorSection>
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Homepage sections</h2>
          <p className="mt-0.5 text-xs text-muted">Choose which sections appear and in what order.</p>
          <ul className="mt-4 divide-y divide-line">
            {sectionRows.map((s, i) => {
              const opt = SECTION_OPTIONS.find((o) => o.key === s.section);
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className={cn('h-2 w-2 rounded-full', s.enabled ? 'bg-primary-light0' : 'bg-line')} />
                    <span className="text-sm text-ink">{opt?.label ?? s.section}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleSwitch checked={s.enabled} onChange={() => onToggleSection(i)} />
                    <ReorderButtons index={i} count={sectionRows.length} onUp={() => onMoveSection(i, -1)} onDown={() => onMoveSection(i, 1)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Featured products</h2>
              <p className="mt-0.5 text-xs text-muted">Pick products to showcase. Order here is the order shown on the website.</p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {featuredOrder.map((f, i) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  {f.product.imageUrl ? (
                    <img src={f.product.imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-light text-sm font-bold text-brand">
                      {f.product.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-sm text-ink">{f.product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ReorderButtons
                    index={i}
                    count={featuredOrder.length}
                    onUp={async () => {
                      const ids = featuredOrder.map((x) => x.id);
                      const tmp = ids[i - 1];
                      ids[i - 1] = ids[i];
                      ids[i] = tmp;
                      try {
                        await storefrontService.reorderFeatured(ids);
                        invalidate();
                        toast('Featured order updated');
                      } catch (err) {
                        toast(extractError(err).message, { type: 'error' });
                      }
                    }}
                    onDown={async () => {
                      const ids = featuredOrder.map((x) => x.id);
                      const tmp = ids[i + 1];
                      ids[i + 1] = ids[i];
                      ids[i] = tmp;
                      try {
                        await storefrontService.reorderFeatured(ids);
                        invalidate();
                        toast('Featured order updated');
                      } catch (err) {
                        toast(extractError(err).message, { type: 'error' });
                      }
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => toggleFeatured(f.productId)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs font-medium text-muted">Add products</div>
          <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {products.data?.products.slice(0, 100).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggleFeatured(p.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors',
                    featuredIds.has(p.id) ? 'bg-primary-light' : 'hover:bg-line/40',
                  )}
                >
                  <span className={cn('truncate', featuredIds.has(p.id) ? 'text-brand' : 'text-ink')}>{p.name}</span>
                  {featuredIds.has(p.id) ? <Check className="h-4 w-4 shrink-0 text-brand" /> : <Star className="h-4 w-4 shrink-0 text-muted/50" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

