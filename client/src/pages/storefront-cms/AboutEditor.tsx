import { useEffect, useState } from 'react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/storefront/ImageUploader';
import { ToggleSwitch } from './cms-helpers';

export function AboutEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    introduction: '',
    story: '',
    mission: '',
    vision: '',
    values: '',
    imageUrl: '',
    imagePublicId: '',
    secondaryImageUrl: '',
    secondaryImagePublicId: '',
    showTeam: false,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  // Re-populate form when CMS config loads or refreshes after a save.
  useEffect(() => {
    const about = config?.about;
    if (!about) return;
    setForm({
      title: about.title ?? '',
      introduction: about.introduction ?? '',
      story: about.story ?? '',
      mission: about.mission ?? '',
      vision: about.vision ?? '',
      values: about.values ?? '',
      imageUrl: about.imageUrl ?? '',
      imagePublicId: about.imagePublicId ?? '',
      secondaryImageUrl: about.secondaryImageUrl ?? '',
      secondaryImagePublicId: about.secondaryImagePublicId ?? '',
      showTeam: about.showTeam ?? false,
    });
  }, [config?.about]);

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateAbout({
        title: form.title || null,
        introduction: form.introduction || null,
        story: form.story || null,
        mission: form.mission || null,
        vision: form.vision || null,
        values: form.values || null,
        imageUrl: form.imageUrl || null,
        imagePublicId: form.imagePublicId || null,
        secondaryImageUrl: form.secondaryImageUrl || null,
        secondaryImagePublicId: form.secondaryImagePublicId || null,
        showTeam: form.showTeam,
      });
      invalidate();
      toast('About page updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">About page</h1>
        <p className="mt-1 text-sm text-muted">Tell your customers who you are, what you stand for, and your story.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Story</h2>
          <div className="mt-4 space-y-4">
            <Input label="Page title" value={form.title} onChange={(e) => set({ title: e.target.value })} />
            <Textarea label="Introduction" rows={3} value={form.introduction} onChange={(e) => set({ introduction: e.target.value })} />
            <Textarea label="Story" rows={5} value={form.story} onChange={(e) => set({ story: e.target.value })} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Primary image" value={form.imageUrl} onChange={(img) => set({ imageUrl: img.url ?? '', imagePublicId: img.publicId ?? '' })} folder="dukastock/storefront/about" />
            <ImageUploader label="Secondary image" value={form.secondaryImageUrl} onChange={(img) => set({ secondaryImageUrl: img.url ?? '', secondaryImagePublicId: img.publicId ?? '' })} folder="dukastock/storefront/about" />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Mission, Vision & Values</h2>
          <div className="mt-4 space-y-4">
            <Textarea label="Mission" rows={3} value={form.mission} onChange={(e) => set({ mission: e.target.value })} />
            <Textarea label="Vision" rows={3} value={form.vision} onChange={(e) => set({ vision: e.target.value })} />
            <Textarea label="Values" rows={3} value={form.values} onChange={(e) => set({ values: e.target.value })} />
            <div className="flex items-center">
              <ToggleSwitch checked={form.showTeam} onChange={(v) => set({ showTeam: v })} label="Show team section" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save about page</Button>
        </div>
      </div>
    </div>
  );
}
