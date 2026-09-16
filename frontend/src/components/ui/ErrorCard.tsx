import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ErrorCard({
  code,
  title,
  description,
  icon,
  primaryLabel = 'Go Home',
  primaryHref = '/',
  secondaryLabel = 'Browse the collection',
  secondaryHref = '/products',
}: {
  code: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div
      className={cn(
        'container-afc flex min-h-[60vh] flex-col items-center justify-center py-20 text-center',
        'animate-fade-in'
      )}
    >
      <div className="text-gold">{icon}</div>
      <p className="mt-4 font-display text-[96px] font-bold leading-none text-gold/80 lg:text-[120px]">
        {code}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-3 max-w-md text-charcoal">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={primaryHref}>{primaryLabel}</Button>
        <Button href={secondaryHref} variant="outline">
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
