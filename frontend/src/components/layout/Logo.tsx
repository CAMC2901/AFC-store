'use client';

import Link from 'next/link';
import { SITE } from '@/constants';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2', className)} aria-label={`${SITE.name} home`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-gold transition-transform duration-500 group-hover:rotate-6">
        A
      </span>
      <span className="font-display text-xl font-bold tracking-tightest text-ink">
        AFC<span className="text-gold">.</span>
      </span>
    </Link>
  );
}
