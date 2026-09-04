import type { LucideIcon } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { iconColors, type IconColor } from '@/lib/icon-colors';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: IconColor;
  className?: string;
}

// KPI card tuned for small screens: compact padding on mobile, a value that
// wraps instead of truncating (so long currency amounts never get cut off on a
// narrow two-column grid), and an icon that scales down on phones.
export function StatCard({ label, value, icon, hint, tone = 'orange', className }: StatCardProps) {
  return (
    <div className={cn('card card-hover relative overflow-hidden p-3.5 sm:p-4', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: iconColors[tone].wash }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
            {label}
          </p>
          <p className="mt-1 text-lg font-bold leading-tight tabular-nums tracking-tight text-ink sm:text-xl">
            {value}
          </p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
        </div>
        <ColoredIcon icon={icon} color={tone} size="md" iconSizeClass="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
      </div>
    </div>
  );
}