import { useState } from 'react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export function BrandingEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const b = config?.branding;
  const [form, setForm] = useState({
    primaryColor: b?.primaryColor ?? '#176B5B',
    secondaryColor: b?.secondaryColor ?? '#17252D',
    accentColor: b?.accentColor ?? '#D6A84F',
    buttonStyle: b?.buttonStyle ?? 'rounded',
    radius: b?.radius ?? 'smooth',
    font: b?.font ?? 'inter',
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const colorRows = [
    { key: 'primaryColor' as const, label: 'Primary color', desc: 'Buttons, links and highlights.' },
    { key: 'secondaryColor' as const, label: 'Secondary color', desc: 'Headers, text and dark surfaces.' },
    { key: 'accentColor' as const, label: 'Accent color', desc: 'Badges, sale tags and highlights.' },
  ];

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateBranding({
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        buttonStyle: form.buttonStyle,
        radius: form.radius,
        font: form.font,
      });
      invalidate();
      toast('Branding updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Branding</h1>
        <p className="mt-1 text-sm text-muted">Set the look and feel of your online store.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Colors</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {colorRows.map((c) => (
              <div key={c.key}>
                <label className="label">{c.label}</label>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md border border-line">
                    <input
                      type="color"
                      value={form[c.key]}
                      onChange={(e) => set({ [c.key]: e.target.value })}
                      className="absolute -inset-2 h-16 w-16 cursor-pointer"
                    />
                  </div>
                  <input
                    value={form[c.key]}
                    onChange={(e) => set({ [c.key]: e.target.value })}
                    className="input w-28 font-mono text-sm uppercase"
                  />
                </div>
                <p className="mt-2 text-xs text-muted">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Select
              label="Button style"
              value={form.buttonStyle}
              onChange={(e) => set({ buttonStyle: e.target.value as typeof form.buttonStyle })}
              options={[
                { value: 'rounded', label: 'Rounded' },
                { value: 'pill', label: 'Pill' },
                { value: 'square', label: 'Square' },
              ]}
            />
            <Select
              label="Corner radius"
              value={form.radius}
              onChange={(e) => set({ radius: e.target.value as typeof form.radius })}
              options={[
                { value: 'subtle', label: 'Subtle' },
                { value: 'smooth', label: 'Smooth' },
                { value: 'large', label: 'Large' },
              ]}
            />
            <Select
              label="Font"
              value={form.font}
              onChange={(e) => set({ font: e.target.value as typeof form.font })}
              options={[
                { value: 'inter', label: 'Inter' },
                { value: 'poppins', label: 'Poppins' },
                { value: 'system', label: 'System default' },
              ]}
            />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Live preview</h2>
          <div className="mt-4 rounded-lg border border-line p-4" style={{ background: '#F7F5EF' }}>
            <button
              type="button"
              className={cn(
                'px-4 py-2 text-sm font-semibold text-white',
                form.buttonStyle === 'rounded' && 'rounded-md',
                form.buttonStyle === 'pill' && 'rounded-full',
                form.buttonStyle === 'square' && 'rounded-none',
              )}
              style={{ backgroundColor: form.primaryColor }}
            >
              Shop now
            </button>
            <span className="ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: form.accentColor }}>
              SALE
            </span>
            <p className="mt-3 text-sm" style={{ color: form.secondaryColor }}>
              Sample heading in the selected color scheme.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save branding</Button>
        </div>
      </div>
    </div>
  );
}
