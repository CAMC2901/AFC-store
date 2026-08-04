'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconChevronDown } from './Icons';

export function Accordion({
  items,
  defaultOpen,
}: {
  items: Array<{ title: string; content: ReactNode }>;
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-mist"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-ink">{item.title}</span>
              <IconChevronDown
                size={18}
                className={cn('text-charcoal transition-transform duration-300', isOpen && 'rotate-180 text-gold-dark')}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-charcoal">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
