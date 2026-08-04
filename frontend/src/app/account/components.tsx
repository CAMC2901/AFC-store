import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Card({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-gold hover:shadow-card-hover">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-widest text-charcoal/60">{label}</p>
        <p className="font-display text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4')}>
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-charcoal/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
