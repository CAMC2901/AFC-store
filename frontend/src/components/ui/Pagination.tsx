'use client';

import { cn } from '@/lib/utils';
import { IconChevronLeft, IconChevronRight } from './Icons';

function pageList(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | '…'> = [1];
  if (current > 3) pages.push('…');
  for (let p = current - 1; p <= current + 1; p++) {
    if (p > 1 && p < total) pages.push(p);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const btn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all disabled:opacity-30';

  return (
    <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Paginación">
      <button
        className={cn(btn, 'text-charcoal hover:bg-mist')}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <IconChevronLeft size={18} />
      </button>

      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className="px-1 text-charcoal/50">
            …
          </span>
        ) : (
          <button
            key={p}
            className={cn(
              btn,
              p === page ? 'bg-ink text-ivory shadow-gold' : 'text-ink hover:bg-mist'
            )}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={cn(btn, 'text-charcoal hover:bg-mist')}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <IconChevronRight size={18} />
      </button>
    </nav>
  );
}
