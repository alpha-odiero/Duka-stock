import { PackagePlus, ShoppingCart, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardActivity } from '@/types';
import { timeAgo } from '@/lib/format';
import { ColoredIcon } from '@/components/ui/colored-icon';
import type { IconColor } from '@/lib/icon-colors';

const icons: Record<DashboardActivity['type'], { Icon: LucideIcon; color: IconColor }> = {
  sale: { Icon: ShoppingCart, color: 'orange' },
  stock_in: { Icon: PackagePlus, color: 'teal' },
  stock_out: { Icon: TrendingUp, color: 'blue' },
  expense: { Icon: AlertTriangle, color: 'red' },
  product: { Icon: FileText, color: 'slate' },
};

export function RecentActivity({ items }: { items: DashboardActivity[] }) {
  if (!items.length) {
    return <p className="px-4 py-8 text-center text-sm text-muted">No activity yet.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {items.map((a) => {
        const { Icon, color } = icons[a.type] ?? icons.product;
        return (
          <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
            <ColoredIcon icon={Icon} color={color} size="xs" iconSizeClass="h-4 w-4" className="rounded-full" />
            <p className="min-w-0 flex-1 truncate text-sm text-ink">{a.text}</p>
            <span className="shrink-0 text-xs text-muted">{timeAgo(a.createdAt)}</span>
          </li>
        );
      })}
    </ul>
  );
}
