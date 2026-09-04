import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ToggleSwitch } from './cms-helpers';
import type { OpeningHour } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ContactEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    phone: '',
    whatsappNumber: '',
    whatsappMessage: '',
    email: '',
    location: '',
    address: '',
    mapsUrl: '',
    showContactForm: true,
    showWhatsappBtn: true,
  });
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  // Re-populate form and hours when CMS config loads or refreshes after a save.
  useEffect(() => {
    const c = config?.contact;
    if (!c) return;
    setForm({
      title: c.title ?? '',
      description: c.description ?? '',
      phone: c.phone ?? '',
      whatsappNumber: c.whatsappNumber ?? '',
      whatsappMessage: c.whatsappMessage ?? '',
      email: c.email ?? '',
      location: c.location ?? '',
      address: c.address ?? '',
      mapsUrl: c.mapsUrl ?? '',
      showContactForm: c.showContactForm ?? true,
      showWhatsappBtn: c.showWhatsappBtn ?? true,
    });
    setHours(Array.isArray(c.openingHours) ? c.openingHours : []);
  }, [config?.contact]);

  const updateHour = (i: number, patch: Partial<OpeningHour>) =>
    setHours((h) => h.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const addHour = () => {
    const used = new Set(hours.map((h) => h.day));
    const day = DAYS.find((d) => !used.has(d)) ?? `Day ${hours.length + 1}`;
    setHours([...hours, { day, open: '09:00', close: '17:00' }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await storefrontService.updateContact({
        title: form.title || null,
        description: form.description || null,
        phone: form.phone || null,
        whatsappNumber: form.whatsappNumber || null,
        whatsappMessage: form.whatsappMessage || null,
        email: form.email || null,
        location: form.location || null,
        address: form.address || null,
        mapsUrl: form.mapsUrl || null,
        showContactForm: form.showContactForm,
        showWhatsappBtn: form.showWhatsappBtn,
        openingHours: hours,
      });
      invalidate();
      toast('Contact page updated');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Contact</h1>
        <p className="mt-1 text-sm text-muted">Phone, WhatsApp, email, location and opening hours shown to customers.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">Contact details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Title" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Get in touch" />
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Description" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <Input label="Phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            <Input label="WhatsApp number" value={form.whatsappNumber} onChange={(e) => set({ whatsappNumber: e.target.value })} placeholder="e.g. +254712345678" />
            <Input label="WhatsApp message" value={form.whatsappMessage} onChange={(e) => set({ whatsappMessage: e.target.value })} placeholder="Hi, I'd like to place an order." />
            <Input label="Location / area" value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Kilimani, Nairobi" />
            <Input label="Address" value={form.address} onChange={(e) => set({ address: e.target.value })} />
            <Input label="Google Maps URL" value={form.mapsUrl} onChange={(e) => set({ mapsUrl: e.target.value })} />
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <ToggleSwitch checked={form.showContactForm} onChange={(v) => set({ showContactForm: v })} label="Show contact form" />
            <ToggleSwitch checked={form.showWhatsappBtn} onChange={(v) => set({ showWhatsappBtn: v })} label="Show WhatsApp button" />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Opening hours</h2>
            <Button size="sm" variant="secondary" onClick={addHour}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {hours.map((h, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <div className="w-32">
                  <Select value={h.day} onChange={(e) => updateHour(i, { day: e.target.value })} options={DAYS.map((d) => ({ value: d, label: d }))} />
                </div>
                <Input type="time" value={h.open} onChange={(e) => updateHour(i, { open: e.target.value })} className="w-28" />
                <span className="text-muted">–</span>
                <Input type="time" value={h.close} onChange={(e) => updateHour(i, { close: e.target.value })} className="w-28" />
                <button type="button" className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => setHours((x) => x.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {hours.length === 0 && <p className="text-sm text-muted">No opening hours set.</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Save contact</Button>
        </div>
      </div>
    </div>
  );
}
