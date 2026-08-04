'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { useLockBodyScroll } from '@/hooks/useGeneral';
import { IconClose } from './Icons';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useLockBodyScroll(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-overlay/50 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-t-3xl bg-surface shadow-drawer sm:rounded-3xl',
              maxWidth
            )}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              {title ? <h3 className="font-display text-lg">{title}</h3> : <span />}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-charcoal transition-colors hover:bg-mist hover:text-ink"
                aria-label="Cerrar diálogo"
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
