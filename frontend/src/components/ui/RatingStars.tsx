import { cn } from '@/lib/utils';
import { IconStar, IconStarHalf } from './Icons';

export function RatingStars({
  rating,
  size = 14,
  className,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const rounded = rating - full >= 0.75;

  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full || (i === full && rounded)) {
      return <IconStar key={i} size={size} className="text-gold" />;
    }
    if (i === full && half) {
      return <IconStarHalf key={i} size={size} className="text-gold" />;
    }
    return <IconStar key={i} size={size} className="text-line" />;
  });

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && (
        <span className="ml-1 text-xs font-semibold text-charcoal">
          {rating.toFixed(1)}
          {count !== undefined && <span className="text-charcoal/50"> ({count})</span>}
        </span>
      )}
    </div>
  );
}
