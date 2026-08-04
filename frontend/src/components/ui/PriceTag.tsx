import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

export function PriceTag({
  price,
  compareAtPrice,
  currency = 'USD',
  size = 'md',
  className,
}: {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-semibold text-ink', sizes[size])}>
        {formatPrice(price, currency)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={cn('text-charcoal/50 line-through', size === 'lg' ? 'text-base' : 'text-sm')}>
          {formatPrice(compareAtPrice, currency)}
        </span>
      )}
    </div>
  );
}
