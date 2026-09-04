import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

function pageList(page: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageList(page, totalPages);
  let prev = 0;

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm"
    >
      <span className="text-xs text-muted">
        {total} {total === 1 ? 'item' : 'items'} · page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-line/50 hover:text-ink disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => {
          const isGap = p === prev + 1 ? false : !pages.includes(prev + 1) && p > prev + 1;
          prev = p;
          if (isGap) {
            return (
              <span key={`gap-${p}`} className="px-1 text-muted">
                …
              </span>
            );
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm font-medium',
                p === page ? 'bg-brand text-white' : 'text-ink hover:bg-line/50',
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-line/50 hover:text-ink disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
