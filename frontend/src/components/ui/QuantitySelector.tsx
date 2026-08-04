import { cn } from '@/lib/utils';
import { IconMinus, IconPlus } from './Icons';

export function QuantitySelector({
  value,
  onChange,
  max = 99,
  min = 1,
  size = 'md',
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const btn = cn(
    'flex items-center justify-center text-ink/70 transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30',
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  );
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-surface',
        size === 'sm' ? 'h-8' : 'h-11',
        className
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
      >
        <IconMinus size={size === 'sm' ? 14 : 16} />
      </button>
      <span
        className={cn(
          'min-w-8 text-center font-semibold tabular-nums',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        <IconPlus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
}
