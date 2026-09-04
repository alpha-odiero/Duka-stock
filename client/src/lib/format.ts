// Formatting helpers shared across the UI. Money values arrive as strings from
// the API (PostgreSQL DECIMAL) so we convert with Number only for display.

export function kes(value: string | number | null | undefined, currency = 'KES'): string {
  if (value === null || value === undefined) return `${currency} 0.00`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${currency} 0.00`;
  return `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function kesCompact(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return 'KES 0';
  return `KES ${n.toLocaleString('en-KE')}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '\u2014';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '\u2014';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}
