import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { iconColorVars, type IconColor } from '@/lib/icon-colors';

interface EmptyStateProps {
  icon?: ReactNode;
  iconTone?: IconColor;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, iconTone = 'orange', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && (
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tone-bg)] text-[var(--tone-color)]"
          style={iconColorVars(iconTone)}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
