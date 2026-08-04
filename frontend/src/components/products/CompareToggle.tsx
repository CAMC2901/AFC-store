'use client';

import { useCompareStore, MAX_COMPARE } from '@/store/useCompareStore';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { IconCompare } from '@/components/ui/Icons';
import toast from 'react-hot-toast';

export function CompareToggle({
  productId,
  className,
  iconOnly = false,
}: {
  productId: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const isFull = useCompareStore((s) => s.isFull);
  const { t } = useI18n();

  const active = ids.includes(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!active && isFull(productId)) {
      toast(`Puedes comparar hasta ${MAX_COMPARE} artículos.`, { icon: 'ℹ️' });
      return;
    }
    toggle(productId);
    toast.success(active ? t('compare.removed') : t('compare.added'));
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={active ? t('compare.removeLabel') : t('compare.addLabel')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all duration-300',
          active ? 'bg-gold text-ink' : 'bg-surface/80 text-ink hover:bg-gold hover:text-ink',
          className
        )}
      >
        <IconCompare size={17} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300',
        active
          ? 'border-gold bg-gold text-ink'
          : 'border-ink/15 bg-transparent text-ink hover:border-gold hover:text-gold-dark',
        className
      )}
    >
      <IconCompare size={17} />
      {active ? t('compare.inCompare') : t('compare.add')}
    </button>
  );
}