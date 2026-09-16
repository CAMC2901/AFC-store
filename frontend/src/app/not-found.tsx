'use client';

import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconBox } from '@/components/ui/Icons';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="container-afc flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative flex items-center justify-center">
        <span className="select-none font-display text-[140px] font-extrabold leading-none text-gold/20 sm:text-[180px]">
          404
        </span>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Error 404
          </span>
        </div>
      </div>

      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink sm:text-5xl">
        {t('notFound.title')}
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-charcoal dark:text-neutral-400">
        {t('notFound.desc')}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/" size="lg">
          {t('common.backHome')}
          <IconArrowRight size={16} />
        </Button>
        <Button href="/products" variant="outline" size="lg">
          <IconBox size={18} />
          {t('product.browse')}
        </Button>
      </div>
    </div>
  );
}
