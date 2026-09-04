import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReorderButtons, ToggleSwitch } from './cms-helpers';

export function FaqEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const [editing, setEditing] = useState<{ id?: string; question: string; answer: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = config ? [...config.faqs].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await storefrontService.updateFaq(editing.id, { question: editing.question, answer: editing.answer });
        toast('FAQ updated');
      } else {
        await storefrontService.createFaq({ question: editing.question, answer: editing.answer });
        toast('FAQ added');
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
      await storefrontService.deleteFaq(id);
      invalidate();
      toast('FAQ removed');
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const toggle = async (id: string, enabled: boolean) => {
    try {
      await storefrontService.updateFaq(id, { enabled });
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
      await storefrontService.reorderFaqs(ids);
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">FAQ</h1>
        <p className="mt-1 text-sm text-muted">Answer the questions your customers ask most often.</p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Questions</h2>
          <Button size="sm" onClick={() => setEditing({ question: '', answer: '' })}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((f, i) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <ToggleSwitch checked={f.enabled} onChange={(v) => toggle(f.id, v)} />
                <p className="truncate text-sm text-ink">{f.question}</p>
              </div>
              <div className="flex items-center gap-1">
                <ReorderButtons index={i} count={rows.length} onUp={() => reorder(i, -1)} onDown={() => reorder(i, 1)} />
                <button type="button" className="rounded p-1.5 text-muted hover:bg-line/50 hover:text-ink" onClick={() => setEditing({ id: f.id, question: f.question, answer: f.answer })}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => remove(f.id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-sm text-muted">No questions yet.</li>}
        </ul>
      </div>

      {editing && (
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink">{editing.id ? 'Edit question' : 'New question'}</h2>
          <div className="mt-4 space-y-4">
            <Input label="Question" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="Do you offer delivery?" />
            <Textarea label="Answer" rows={4} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
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
