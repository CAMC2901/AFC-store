import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IconChevronDown } from './Icons';
import { useClickOutside } from '@/hooks/useGeneral';

export function Dropdown({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'left',
  className,
}: {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: 'left' | 'right';
  className?: string;
}) {
  const ref = useClickOutside<HTMLDivElement>(() => onOpenChange(false));

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => onOpenChange(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-card-hover',
            align === 'left' ? 'left-0' : 'right-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink/80 transition-colors hover:bg-mist hover:text-ink',
        className
      )}
    >
      {children}
    </button>
  );
}

export function SortSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input appearance-none pr-10 text-sm"
        aria-label="Ordenar productos"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown size={16} className="pointer-events-none absolute right-3 text-charcoal" />
    </div>
  );
}
