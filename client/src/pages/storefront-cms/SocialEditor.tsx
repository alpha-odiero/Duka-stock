import { useState } from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function SocialEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const s = config?.social;
  const [form, setForm] = useState({
    facebook: s?.facebook ?? '',
    instagram: s?.instagram ?? '',
    tiktok: s?.tiktok ?? '',
    twitter: s?.twitter ?? '',
    youtube: s?.youtube ?? '',
    linkedin: s?.linkedin ?? '',
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const fields: { key: keyof typeof form; label: string; icon: typeof Facebook; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/youraccount' },
    { key: 'tiktok', label: 'TikTok', icon: Facebook, placeholder: 'https://tiktok.com/@youraccount' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/youraccount' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/yourchannel' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourpage' },
  ];

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateSocial({
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        twitter: form.twitter || null,
        youtube: form.youtube || null,
        linkedin: form.linkedin || null,
      });
      invalidate();
      toast('Social links updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Social & footer links</h1>
        <p className="mt-1 text-sm text-muted">Add your social profiles. Links only show when a URL is provided.</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="w-full">
              <span className="label">{f.label}</span>
              <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-primary-light">
                <f.icon className="h-4 w-4 shrink-0 text-brand" />
                <input
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                  value={form[f.key]}
                  onChange={(e) => set({ [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} loading={saving}>Save links</Button>
        </div>
      </div>
    </div>
  );
}
