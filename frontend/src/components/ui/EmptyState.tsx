import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IconInfo } from './Icons';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mist text-charcoal">
        {icon ?? <IconInfo size={28} />}
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-charcoal">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
