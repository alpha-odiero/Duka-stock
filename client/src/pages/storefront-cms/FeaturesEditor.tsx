import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ReorderButtons, ToggleSwitch } from './cms-helpers';

const ICONS = ['Truck', 'Shield', 'BadgeCheck', 'Tag', 'Clock', 'Headset', 'Wallet', 'Sparkles'];

export function FeaturesEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [editing, setEditing] = useState<{ id?: string; title: string; description: string; icon: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = config ? [...config.features].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await storefrontService.updateFeature(editing.id, { title: editing.title, description: editing.description, icon: editing.icon || null });
        toast('Feature updated');
      } else {
        await storefrontService.createFeature({ title: editing.title, description: editing.description, icon: editing.icon || undefined });
        toast('Feature added');
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
      await storefrontService.deleteFeature(id);
      invalidate();
      toast('Feature removed');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const toggle = async (id: string, enabled: boolean) => {
    try {
      await storefrontService.updateFeature(id, { enabled });
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
      await storefrontService.reorderFeatures(ids);
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Why choose us</h1>
        <p className="mt-1 text-sm text-muted">Highlight your strengths — shipping, support, quality, and more.</p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Features</h2>
          <Button size="sm" onClick={() => setEditing({ title: '', description: '', icon: 'BadgeCheck' })}>
            <Plus className="h-4 w-4" /> Add feature
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((f, i) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <ToggleSwitch checked={f.enabled} onChange={(v) => toggle(f.id, v)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{f.title}</p>
                  <p className="truncate text-xs text-muted">{f.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ReorderButtons index={i} count={rows.length} onUp={() => reorder(i, -1)} onDown={() => reorder(i, 1)} />
                <button type="button" className="rounded p-1.5 text-muted hover:bg-line/50 hover:text-ink" onClick={() => setEditing({ id: f.id, title: f.title, description: f.description, icon: f.icon ?? 'BadgeCheck' })}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => remove(f.id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-sm text-muted">No features yet. Add your first one.</li>}
        </ul>
      </div>

      {editing && (
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">{editing.id ? 'Edit feature' : 'New feature'}</h2>
          <div className="mt-4 space-y-4">
            <Input label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Free local delivery" />
            <Textarea label="Description" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Select label="Icon" value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} options={ICONS.map((k) => ({ value: k, label: k }))} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} loading={saving}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
