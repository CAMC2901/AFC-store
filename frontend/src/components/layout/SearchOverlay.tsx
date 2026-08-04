'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useDebounce, useLockBodyScroll } from '@/hooks/useGeneral';
import { useProducts } from '@/hooks/useProducts';
import { IconArrowRight, IconClose, IconSearch, IconSparkle } from '@/components/ui/Icons';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export function SearchOverlay() {
  const open = useUiStore((s) => s.searchOpen);
  const close = useUiStore((s) => s.closeSearch);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 350);

  useLockBodyScroll(open);

  const { data } = useProducts(
    { search: debounced || undefined, limit: 6 },
    open && debounced.length >= 2
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      close();
    }
  };

  const popular = ['Sofá', 'Mesa de nogal', 'Escritorio', 'Cama', 'Lámpara', 'Alfombra'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-ivory/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="container-afc pt-10">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Buscar en AFC</span>
              <button
                onClick={close}
                className="rounded-full p-2 text-charcoal transition-colors hover:bg-mist"
                aria-label="Cerrar búsqueda"
              >
                <IconClose size={26} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 border-b-2 border-ink pb-4">
              <IconSearch size={28} className="text-ink" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Busca sofás, mesas de comedor, iluminación…"
                className="w-full bg-transparent font-display text-2xl text-ink placeholder:text-charcoal/40 focus:outline-none sm:text-3xl"
                aria-label="Buscar productos"
              />
              <button
                onClick={() => {
                  if (query.trim()) {
                    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
                    close();
                  }
                }}
                className="btn-gold shrink-0"
              >
                Buscar
              </button>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-5">
              {/* Suggestions */}
              <div className="lg:col-span-2">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-dark">
                  <IconSparkle size={14} /> Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-2">
                  {popular.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(term)}`);
                        close();
                      }}
                      className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-all hover:border-gold hover:text-gold-dark"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-widest text-gold-dark">Accesos rápidos</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/products" onClick={close} className="text-ink hover:text-gold-dark">Ver todos los muebles</Link>
                  </li>
                  <li>
                    <Link href="/products?featured=true" onClick={close} className="text-ink hover:text-gold-dark">Piezas destacadas</Link>
                  </li>
                  <li>
                    <Link href="/products?inStock=true&sortBy=rating" onClick={close} className="text-ink hover:text-gold-dark">Mejor valoradas en stock</Link>
                  </li>
                </ul>
              </div>

              {/* Live results */}
              <div className="lg:col-span-3">
                {debounced.length >= 2 ? (
                  data && data.items.length > 0 ? (
                    <>
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-dark">
                        {data.pagination.total} resultado{data.pagination.total !== 1 ? 's' : ''}
                      </p>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {data.items.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/products/${p.slug}`}
                              onClick={close}
                              className="group flex items-center gap-4 rounded-2xl bg-surface p-3 shadow-card transition-shadow hover:shadow-card-hover"
                            >
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-mist">
                                <Image src={p.images[0]} alt={p.name} fill sizes="64px" className="object-cover transition-transform group-hover:scale-105" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">{p.name}</p>
                                <p className="text-xs text-charcoal/60">{p.categoryName}</p>
                                <p className="mt-1 text-sm font-semibold text-gold-dark">{formatPrice(p.price)}</p>
                              </div>
                              <IconArrowRight size={16} className="ml-auto text-charcoal/40 transition-all group-hover:translate-x-1 group-hover:text-gold-dark" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-charcoal">Sin resultados para “{debounced}”. Prueba con otro término.</p>
                  )
                ) : (
                  <p className="text-sm text-charcoal/60">Empieza a escribir para ver sugerencias de productos en vivo.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
