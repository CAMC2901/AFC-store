import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        'mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-3 text-base leading-relaxed text-charcoal">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  );
}
