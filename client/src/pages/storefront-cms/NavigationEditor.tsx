import { Plus, X } from 'lucide-react';
import { storefrontService } from '@/services/storefront';
import { useStorefrontCms } from '@/context/StorefrontCmsContext';
import { useToast } from '@/components/ui/toast';
import { extractError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ReorderButtons, ToggleSwitch } from './cms-helpers';
import { cn } from '@/lib/cn';

type NavInput = { id?: string; label: string; href: string; enabled: boolean };

export function NavigationEditor() {
  const { config, invalidate } = useStorefrontCms();
  const { toast } = useToast();
  const nav = config ? [...config.navigation].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const saveItems = async (items: NavInput[], action: string) => {
    try {
      await storefrontService.updateNavigation(items);
      toast(action);
      invalidate();
    } catch (err) {
      toast(extractError(err).message, { type: 'error' });
    }
  };

  const updateLocal = (index: number, patch: Partial<{ label: string; href: string; enabled: boolean }>) => {
    const items: NavInput[] = nav.map((n, i) => ({
      id: n.id,
      label: n.label,
      href: n.href,
      enabled: n.enabled,
      ...(i === index ? patch : {}),
    }));
    void saveItems(items, 'Navigation updated');
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= nav.length) return;
    const items: NavInput[] = nav.map((n) => ({ id: n.id, label: n.label, href: n.href, enabled: n.enabled }));
    const tmp = items[index];
    items[index] = items[target];
    items[target] = tmp;
    void saveItems(items, 'Navigation reordered');
  };

  const remove = (index: number) => {
    const items: NavInput[] = nav.filter((_, i) => i !== index).map((n) => ({ id: n.id, label: n.label, href: n.href, enabled: n.enabled }));
    void saveItems(items, 'Navigation item removed');
  };

  const add = () => {
    const items: NavInput[] = nav.map((n) => ({ id: n.id, label: n.label, href: n.href, enabled: n.enabled }));
    items.push({ label: 'New link', href: '/shop', enabled: true });
    void saveItems(items, 'Navigation item added');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Navigation</h1>
        <p className="mt-1 text-sm text-muted">Control the menu shown across your store. System links (like Home) can't be removed or renamed.</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Menu items</h2>
          <Button size="sm" onClick={add}>
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {nav.map((n, i) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <ToggleSwitch checked={n.enabled} onChange={(v) => updateLocal(i, { enabled: v })} />
                <div className="min-w-0">
                  <p className={cn('truncate text-sm font-medium text-ink', !n.enabled && 'text-muted line-through')}>
                    {n.label}
                    {n.isSystem && <span className="ml-2 rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold text-brand">SYSTEM</span>}
                  </p>
                  <p className="truncate text-xs text-muted">{n.href}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  disabled={n.isSystem}
                  value={n.href}
                  onChange={(e) => updateLocal(i, { href: e.target.value })}
                  className="input w-32 disabled:opacity-50"
                />
                <ReorderButtons index={i} count={nav.length} onUp={() => move(i, -1)} onDown={() => move(i, 1)} />
                {!n.isSystem && (
                  <button type="button" className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => remove(i)}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {nav.length === 0 && <p className="py-6 text-center text-sm text-muted">No navigation items.</p>}
      </div>
    </div>
  );
}
