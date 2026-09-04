import { useEffect, useState } from 'react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/storefront/ImageUploader';

export function StoreInfoEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    tagline: '',
    copyright: '',
    customerCount: 0,
    yearEstablished: '',
    heroImageUrl: '',
    heroImagePublicId: '',
    logoUrl: '',
    logoPublicId: '',
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  // Re-populate form when CMS config loads or refreshes after a save.
  useEffect(() => {
    const s = config?.storefront;
    if (!s) return;
    setForm({
      storeName: s.storeName ?? '',
      tagline: s.tagline ?? '',
      copyright: s.copyright ?? '',
      customerCount: s.customerCount ?? 0,
      yearEstablished: s.yearEstablished?.toString() ?? '',
      heroImageUrl: s.heroImageUrl ?? '',
      heroImagePublicId: s.heroImagePublicId ?? '',
      logoUrl: s.logoUrl ?? '',
      logoPublicId: s.logoPublicId ?? '',
    });
  }, [config?.storefront]);

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateInfo({
        storeName: form.storeName || null,
        tagline: form.tagline || null,
        copyright: form.copyright || null,
        customerCount: Number(form.customerCount) || 0,
        yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : null,
        heroImageUrl: form.heroImageUrl || null,
        heroImagePublicId: form.heroImagePublicId || null,
        logoUrl: form.logoUrl || null,
        logoPublicId: form.logoPublicId || null,
        onboardingStep: 1,
      });
      invalidate();
      toast('Store identity updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Store identity</h1>
        <p className="mt-1 text-sm text-muted">Your store name, tagline, logo and hero image — the basics of your brand.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Store name" value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} placeholder="My Fresh Store" />
            <Input label="Tagline" value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="Fresh goods, delivered." />
            <Input label="Year established" type="number" value={form.yearEstablished} onChange={(e) => set({ yearEstablished: e.target.value })} placeholder="2020" />
            <Input label="Happy customers" type="number" value={String(form.customerCount)} onChange={(e) => set({ customerCount: Number(e.target.value) })} />
            <div className="sm:col-span-2">
              <Input label="Copyright / footer text" value={form.copyright} onChange={(e) => set({ copyright: e.target.value })} placeholder="© 2024 My Fresh Store. All rights reserved." />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Logo & hero image</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Logo" value={form.logoUrl} onChange={(img) => set({ logoUrl: img.url ?? '', logoPublicId: img.publicId ?? '' })} folder="dukastock/storefront" aspect="aspect-square" />
            <ImageUploader label="Hero image (fallback)" value={form.heroImageUrl} onChange={(img) => set({ heroImageUrl: img.url ?? '', heroImagePublicId: img.publicId ?? '' })} folder="dukastock/storefront/hero" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save identity</Button>
        </div>
      </div>
    </div>
  );
}
