import { useState } from 'react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/storefront/ImageUploader';

export function SeoEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const s = config?.seo;
  const [form, setForm] = useState({
    title: s?.title ?? '',
    description: s?.description ?? '',
    keywords: s?.keywords ?? '',
    ogImageUrl: s?.ogImageUrl ?? '',
    ogImagePublicId: s?.ogImagePublicId ?? '',
    ogTitle: s?.ogTitle ?? '',
    ogDescription: s?.ogDescription ?? '',
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateSeo({
        title: form.title || null,
        description: form.description || null,
        keywords: form.keywords || null,
        ogImageUrl: form.ogImageUrl || null,
        ogImagePublicId: form.ogImagePublicId || null,
        ogTitle: form.ogTitle || null,
        ogDescription: form.ogDescription || null,
      });
      invalidate();
      toast('SEO settings saved');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">SEO</h1>
        <p className="mt-1 text-sm text-muted">Control how your store appears in search engines and on social media.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Search engine</h2>
          <div className="mt-4 space-y-4">
            <Input label="Page title" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Fresh Groceries & More in Nairobi" />
            <Textarea label="Meta description" rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} />
            <Input label="Keywords" value={form.keywords} onChange={(e) => set({ keywords: e.target.value })} placeholder="groceries, nairobi, fresh produce" />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Social sharing (Open Graph)</h2>
          <div className="mt-4 space-y-4">
            <Input label="Share title" value={form.ogTitle} onChange={(e) => set({ ogTitle: e.target.value })} />
            <Textarea label="Share description" rows={3} value={form.ogDescription} onChange={(e) => set({ ogDescription: e.target.value })} />
            <ImageUploader label="Share image" value={form.ogImageUrl} onChange={(img) => set({ ogImageUrl: img.url ?? '', ogImagePublicId: img.publicId ?? '' })} folder="dukastock/storefront/seo" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save SEO</Button>
        </div>
      </div>
    </div>
  );
}
