import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ColoredIcon } from '@/components/ui/colored-icon';
import type { IconColor } from '@/lib/icon-colors';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('card', className)}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconColor;
  iconClassName?: string;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon: Icon, iconTone = 'orange', iconClassName, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-line px-4 py-3', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <ColoredIcon icon={Icon} color={iconTone} size="sm" className={iconClassName} />
        )}
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
