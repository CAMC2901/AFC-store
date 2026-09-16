'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCompareStore } from '@/store/useCompareStore';
import { useI18n } from '@/i18n';
import { IconClose } from '@/components/ui/Icons';

export function CompareBar() {
  const ids = useCompareStore((s) => s.ids);
  const clear = useCompareStore((s) => s.clear);
  const remove = useCompareStore((s) => s.remove);
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed inset-x-0 bottom-0 z-[85]"
        >
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card-hover">
            <span className="text-sm font-semibold text-ink">
              {t('compare.title')}{' '}
              <span className="text-charcoal">· {ids.length}</span>
            </span>
            <div className="flex items-center -space-x-2">
              {ids.map((id) => (
                <span key={id} className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-mist text-[10px] font-bold text-ink">
                  {id.slice(0, 2).toUpperCase()}
                  <button
                    onClick={() => remove(id)}
                    aria-label="Quitar"
                    className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                  >
                    <IconClose size={10} />
                  </button>
                </span>
              ))}
            </div>
            <button onClick={clear} className="rounded-full px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:bg-mist">
              {t('compare.clear')}
            </button>
            <Link href="/compare" className="btn-gold px-5 py-2 text-xs">
              {t('compare.view')}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
