'use client';

import { motion } from 'framer-motion';
import { useCategories, usePriceRange } from '@/hooks/useProducts';
import { COLOR_LABELS, COLORS, MATERIAL_LABELS, MATERIALS } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { IconClose } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

export interface Filters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  material?: string;
  color?: string;
  inStock?: boolean;
  featured?: boolean;
}

export function FiltersSidebar({
  filters,
  onChange,
  onClear,
  open,
  onClose,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const { data: categories } = useCategories();
  const { data: range } = usePriceRange();

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const content = (
    <div className="flex flex-col gap-7">
      {/* Category */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-charcoal">Categoría</h4>
        <div className="flex flex-col gap-1">
          <FilterOption active={!filters.category} label="Todas" onClick={() => set({ category: undefined })} />
          {categories?.map((c) => (
            <FilterOption
              key={c.id}
              active={filters.category === c.slug}
              label={c.name}
              count={c.productCount}
              onClick={() => set({ category: c.slug })}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-charcoal">Precio</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={range?.min}
            placeholder={`${formatPrice(range?.min ?? 0)}`}
            value={filters.minPrice ?? ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
            aria-label="Precio mínimo"
          />
          <span className="text-charcoal/50">—</span>
          <input
            type="number"
            max={range?.max}
            placeholder={`${formatPrice(range?.max ?? 2000)}`}
            value={filters.maxPrice ?? ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
            aria-label="Precio máximo"
          />
        </div>
      </div>

      {/* Material */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-charcoal">Material</h4>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => set({ material: filters.material === m ? undefined : m })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                filters.material === m
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-line bg-surface text-ink/70 hover:border-gold'
              )}
            >
              {MATERIAL_LABELS[m] ?? m}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-charcoal">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => set({ color: filters.color === c ? undefined : c })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                filters.color === c
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-line bg-surface text-ink/70 hover:border-gold'
              )}
            >
              {COLOR_LABELS[c] ?? c}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => set({ inStock: e.target.checked || undefined })}
            className="h-4 w-4 accent-ink"
          />
          Solo en stock
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={Boolean(filters.featured)}
            onChange={(e) => set({ featured: e.target.checked || undefined })}
            className="h-4 w-4 accent-ink"
          />
          Solo destacados
        </label>
      </div>

      <button onClick={onClear} className="text-left text-xs font-semibold uppercase tracking-widest text-gold-dark hover:text-ink">
        Limpiar todos los filtros
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-overlay/50" onClick={onClose} />
          <motion.div
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-ivory p-6"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl">Filtros</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-mist" aria-label="Cerrar filtros">
                <IconClose size={20} />
              </button>
            </div>
            {content}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function FilterOption({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-ink font-medium text-ivory' : 'text-ink/75 hover:bg-mist'
      )}
    >
      {label}
      {count !== undefined && <span className={cn('text-xs', active ? 'text-gold' : 'text-charcoal/50')}>{count}</span>}
    </button>
  );
}
