import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function EditorShell({
  title,
  subtitle,
  description,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">
          {title}
          {subtitle && <span className="ml-2 text-sm font-medium text-muted">· {subtitle}</span>}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y divide-line">{children}</div>
      </Card>
      {footer}
    </div>
  );
}

export function EditorSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </button>
  );
}

export function ReorderButtons({
  index,
  count,
  onUp,
  onDown,
}: {
  index: number;
  count: number;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        title="Move up"
        disabled={index === 0}
        onClick={onUp}
        className="rounded p-1 text-muted hover:bg-line/50 hover:text-ink disabled:opacity-30"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Move down"
        disabled={index === count - 1}
        onClick={onDown}
        className="rounded p-1 text-muted hover:bg-line/50 hover:text-ink disabled:opacity-30"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SaveBar({
  onSave,
  onCancel,
  saving,
  dirty = true,
}: {
  onSave: () => void;
  onCancel?: () => void;
  saving: boolean;
  dirty?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      )}
      <Button type="button" onClick={onSave} loading={saving} disabled={!dirty}>
        <Save className="h-4 w-4" /> Save
      </Button>
    </div>
  );
}
