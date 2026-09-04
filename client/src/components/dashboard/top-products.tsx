import { kes } from '@/lib/format';
import { ProductImage } from '@/components/ui/product-image';
import type { DashboardData } from '@/types';

export function TopProducts({ items }: { items: DashboardData['topProducts'] }) {
  if (!items.length) {
    return <p className="px-4 py-8 text-center text-sm text-muted">No sales recorded yet.</p>;
  }
  const max = Math.max(...items.map((i) => i.unitsSold), 1);
  return (
    <ul className="divide-y divide-line">
      {items.map((p) => (
        <li key={p.id} className="px-4 py-2.5">
          <div className="flex items-center gap-3">
            <ProductImage
              src={p.imageUrl}
              alt={p.name}
              size={64}
              wrapperClassName="h-8 w-8 shrink-0 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-ink">{p.name}</p>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{kes(p.revenue)}</p>
                  <p className="text-xs text-muted">{p.unitsSold} sold</p>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(6, (p.unitsSold / max) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
