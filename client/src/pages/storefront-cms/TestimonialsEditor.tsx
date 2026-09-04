import { useState } from 'react';
import { Pencil, Plus, Star, X } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/storefront/ImageUploader';
import { ReorderButtons, ToggleSwitch } from './cms-helpers';
import { cn } from '@/lib/cn';

export function TestimonialsEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [editing, setEditing] = useState<{
    id?: string;
    customerName: string;
    role: string;
    content: string;
    rating: number;
    featured: boolean;
    imageUrl: string;
    imagePublicId: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = config ? [...config.testimonials].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        customerName: editing.customerName,
        role: editing.role || null,
        content: editing.content,
        rating: editing.rating,
        featured: editing.featured,
        imageUrl: editing.imageUrl || null,
        imagePublicId: editing.imagePublicId || null,
      };
      if (editing.id) {
        await storefrontService.updateTestimonial(editing.id, payload);
        toast('Testimonial updated');
      } else {
        await storefrontService.createTestimonial(payload);
        toast('Testimonial added');
      }
      setEditing(null);
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await storefrontService.deleteTestimonial(id);
      invalidate();
      toast('Testimonial removed');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const toggle = async (id: string, enabled: boolean) => {
    try {
      await storefrontService.updateTestimonial(id, { enabled });
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const ids = rows.map((r) => r.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    const tmp = ids[index];
    ids[index] = ids[target];
    ids[target] = tmp;
    try {
      await storefrontService.reorderTestimonials(ids);
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Testimonials</h1>
        <p className="mt-1 text-sm text-muted">Showcase what happy customers say about your store.</p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Testimonials</h2>
          <Button size="sm" onClick={() => setEditing({ customerName: '', role: '', content: '', rating: 5, featured: false, imageUrl: '', imagePublicId: '' })}>
            <Plus className="h-4 w-4" /> Add testimonial
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((t, i) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <ToggleSwitch checked={t.enabled} onChange={(v) => toggle(t.id, v)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{t.customerName}</p>
                    {t.featured && <span className="rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold text-brand">FEATURED</span>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, n) => (
                      <Star key={n} className={cn('h-3 w-3', n < t.rating ? 'fill-amber-400 text-amber-400' : 'text-line')} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ReorderButtons index={i} count={rows.length} onUp={() => reorder(i, -1)} onDown={() => reorder(i, 1)} />
                <button type="button" className="rounded p-1.5 text-muted hover:bg-line/50 hover:text-ink" onClick={() => setEditing({ id: t.id, customerName: t.customerName, role: t.role ?? '', content: t.content, rating: t.rating, featured: t.featured, imageUrl: t.imageUrl ?? '', imagePublicId: t.imagePublicId ?? '' })}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => remove(t.id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-sm text-muted">No testimonials yet.</li>}
        </ul>
      </div>

      {editing && (
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">{editing.id ? 'Edit testimonial' : 'New testimonial'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Customer name" value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} />
            <Input label="Role / title" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Happy customer" />
          </div>
          <div className="mt-4">
            <Textarea label="Review" rows={3} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <span className="label">Rating</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, n) => (
                  <button type="button" key={n} onClick={() => setEditing({ ...editing, rating: n + 1 })}>
                    <Star className={cn('h-5 w-5', n < editing.rating ? 'fill-amber-400 text-amber-400' : 'text-line')} />
                  </button>
                ))}
              </div>
            </div>
            <ToggleSwitch checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Mark as featured" />
          </div>
          <div className="mt-4 max-w-md">
            <ImageUploader label="Customer photo" value={editing.imageUrl} onChange={(img) => setEditing({ ...editing, imageUrl: img.url ?? '', imagePublicId: img.publicId ?? '' })} folder="dukastock/storefront/testimonials" aspect="aspect-square" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
