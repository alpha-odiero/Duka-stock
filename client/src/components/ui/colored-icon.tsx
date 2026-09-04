import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { iconColorVars, type IconColor } from '@/lib/icon-colors';

const sizes = {
  xs: 'h-7 w-7 rounded-md',
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-9 w-9 rounded-lg',
  lg: 'h-11 w-11 rounded-xl',
} as const;

export interface ColoredIconProps {
  icon: LucideIcon;
  color?: IconColor;
  size?: keyof typeof sizes;
  iconSizeClass?: string;
  active?: boolean;
  groupHover?: boolean;
  className?: string;
}

export function ColoredIcon({
  icon: Icon,
  color = 'orange',
  size = 'md',
  iconSizeClass = 'h-4 w-4',
  active = false,
  groupHover = false,
  className,
}: ColoredIconProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--tone-bg)] text-[var(--tone-color)] transition-colors duration-200',
        sizes[size],
        groupHover && 'group-hover:bg-[var(--tone-bg-hover)] group-hover:text-[var(--tone-hover)]',
        className,
      )}
      style={iconColorVars(color, active) as CSSProperties}
      aria-hidden
    >
      <Icon className={iconSizeClass} strokeWidth={2} />
    </span>
  );
}