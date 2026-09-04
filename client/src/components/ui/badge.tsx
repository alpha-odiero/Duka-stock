import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'green' | 'amber' | 'red' | 'gray' | 'blue';

const tones: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  gray: 'bg-line text-muted ring-1 ring-inset ring-line',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
