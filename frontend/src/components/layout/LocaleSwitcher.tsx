'use client';

import { useI18n } from '@/i18n';
import { IconGlobe } from '@/components/ui/Icons';

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={
        className ??
        'relative flex h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-mist'
      }
      aria-label="Change language"
      title="Change language"
    >
      <IconGlobe size={19} />
      <span>{locale === 'es' ? 'ES' : 'EN'}</span>
    </button>
  );
}