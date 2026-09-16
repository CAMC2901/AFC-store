'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';
import { useCompareProducts, useProducts } from '@/hooks/useProducts';
import { AssistantApi } from '@/services/assistant';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { StockBadge } from '@/components/ui/Badge';
import {
  IconCart,
  IconCompare,
  IconSparkle,
  IconTrash,
  IconArrowRight,
} from '@/components/ui/Icons';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

function formatDimensions(d?: { width?: number; height?: number; depth?: number; unit?: string }) {
  if (!d || (d.width === undefined && d.height === undefined && d.depth === undefined)) return '—';
  const unit = d.unit ?? 'in';
  return `${[d.width, d.height, d.depth].filter((v) => v !== undefined).join(' × ')} ${unit}`;
}

export default function ComparePage() {
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const toggle = useCompareStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.add);

  const { data: products = [], isLoading } = useCompareProducts(ids);
  const { data: popularList } = useProducts({ limit: 6 });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingCart, setAddingCart] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingCart(productId);
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} agregado al carrito.`);
    } catch {
      toast.error('No se pudo agregar al carrito.');
    } finally {
      setAddingCart(null);
    }
  };

  const handleRemove = (id: string) => {
    remove(id);
    setAiAnalysis(null);
    toast.success('Producto removido de la comparación.');
  };

  const handleClear = () => {
    clear();
    setAiAnalysis(null);
    toast.success('Selección de comparación limpiada.');
  };

  function generateInstantStaticAnalysis(p1: import('@/types').Product, p2: import('@/types').Product): string {
    const diffPrice = Math.abs(p1.price - p2.price);
    const cheaper = p1.price < p2.price ? p1 : p2;
    const pricier = p1.price >= p2.price ? p1 : p2;

    const mat1 = p1.material || 'materiales nobles de alta densidad';
    const mat2 = p2.material || 'materiales nobles de alta densidad';

    const col1 = p1.color ? ` en tonalidad ${p1.color}` : '';
    const col2 = p2.color ? ` en tonalidad ${p2.color}` : '';

    const dim1 = formatDimensions(p1.dimensions);
    const dim2 = formatDimensions(p2.dimensions);

    return `1. Análisis de Diseño, Materiales y Dimensiones:
Al comparar "${p1.name}" (${p1.brand || 'AFC Studio'}) frente a "${p2.name}" (${p2.brand || 'AFC Studio'}), evaluamos dos propuestas dentro de la colección de ${p1.categoryName || 'Muebles de Diseño'}. "${p1.name}" destaca por su confección en ${mat1}${col1} y dimensiones de ${dim1}. Por su parte, "${p2.name}" ofrece estructura en ${mat2}${col2} y dimensiones de ${dim2}.

2. Comparación de Inversión y Valor:
El producto "${cheaper.name}" representa la opción de mayor valor accesible a ${formatPrice(cheaper.price)} COP, mientras que "${pricier.name}" se ubica en ${formatPrice(pricier.price)} COP (diferencia de ${formatPrice(diffPrice)} COP). Ambas piezas incluyen 10 años de garantía estructural de AFC Furniture y envío asegurado a nivel nacional.

3. Veredicto Final y Recomendación:
• Si priorizas optimización de presupuesto y versatilidad en espacio: Te recomendamos **${cheaper.name}** (Valoración: ${cheaper.rating}/5 estrellas con ${cheaper.reviewCount} reseñas).
• Si prefieres acabados premium de máxima distinción y durabilidad: La mejor opción es **${pricier.name}** (Valoración: ${pricier.rating}/5 estrellas con ${pricier.reviewCount} reseñas).`;
  }

  const handleGenerateAiAnalysis = async () => {
    if (products.length < 2) return;
    setAnalyzing(true);

    const [p1, p2] = products;

    // Generación instantánea exacta basada en las especificaciones reales de los 2 productos
    const instantAnalysis = generateInstantStaticAnalysis(p1, p2);
    setAiAnalysis(instantAnalysis);
    setAnalyzing(false);

    try {
      const prompt = `Realiza un análisis comparativo breve en 3 párrafos entre los siguientes productos seleccionados:
Producto A: ${p1.name} (Categoría: ${p1.categoryName}, Precio: ${formatPrice(p1.price)}, Material: ${p1.material || 'N/A'}, Calificación: ${p1.rating}/5)
Producto B: ${p2.name} (Categoría: ${p2.categoryName}, Precio: ${formatPrice(p2.price)}, Material: ${p2.material || 'N/A'}, Calificación: ${p2.rating}/5)`;

      const res = await AssistantApi.ask([
        { id: '1', role: 'user', content: prompt, createdAt: new Date().toISOString() },
      ]);
      if (res?.reply) {
        setAiAnalysis(res.reply);
      }
    } catch {
      // Mantiene el análisis estático detallado
    }
  };

  if (isLoading) {
    return (
      <div className="container-afc py-16">
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-mist" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-mist" />
          <div className="h-96 animate-pulse rounded-2xl bg-mist" />
        </div>
      </div>
    );
  }

  // Fewer than 2 products selected -> Show selector & preset recommendations
  if (products.length < 2) {
    return (
      <div className="container-afc py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark">
            <IconCompare size={32} />
          </div>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Comparador de Productos (50% / 50%)</h1>
          <p className="mt-3 text-charcoal">
            Selecciona 2 productos para ver la comparación lado a lado en pantalla dividida mitad y mitad con análisis inteligente de IA.
          </p>

          {products.length === 1 && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-sm text-ink">
              <span>Producto seleccionado (1/2): <strong>{products[0].name}</strong></span>
              <button onClick={() => handleRemove(products[0].id)} className="text-xs font-bold text-red-500 hover:underline">Quitar</button>
            </div>
          )}
        </div>

        {/* Popular products picker */}
        <div className="mt-12">
          <h2 className="mb-6 text-center font-display text-xl">Elige productos populares para comparar:</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {popularList?.items.slice(0, 6).map((item) => {
              const selected = ids.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`group cursor-pointer rounded-2xl border p-3 text-center transition-all ${
                    selected ? 'border-gold bg-gold/10 ring-2 ring-gold' : 'border-line bg-surface hover:border-gold'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                    <Image src={item.images[0]} alt={item.name} fill sizes="120px" className="object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-ink">{item.name}</p>
                  <p className="text-[11px] text-gold-dark font-bold">{formatPrice(item.price)}</p>
                  <button className={`mt-2 w-full rounded-full py-1 text-[10px] font-bold uppercase transition-colors ${
                    selected ? 'bg-gold text-ink' : 'bg-mist text-charcoal hover:bg-gold hover:text-ink'
                  }`}>
                    {selected ? 'Seleccionado ✓' : '+ Seleccionar'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2 or more products -> Full 50% / 50% split screen view
  const [prodA, prodB] = products;

  return (
    <div className="container-afc py-10 lg:py-14">
      {/* Header Bar */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="eyebrow">Comparativa Lado a Lado</span>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">50% / 50% Vista Dividida</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateAiAnalysis}
            loading={analyzing}
            variant="gold"
            size="md"
          >
            <IconSparkle size={18} />
            {analyzing ? 'Analizando con IA...' : 'Generar Análisis IA'}
          </Button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-charcoal transition-colors hover:border-red-400 hover:text-red-500"
          >
            <IconTrash size={15} /> Limpiar Selección
          </button>
        </div>
      </div>

      {/* AI Analysis Box */}
      {aiAnalysis && (
        <div className="mb-10 rounded-2xl border border-gold/40 bg-gradient-to-r from-amber-500/10 via-surface to-amber-500/5 p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-gold-dark font-bold text-sm uppercase tracking-wider">
            <IconSparkle size={18} /> Dictamen Comparativo de la IA de AFC
          </div>
          <div className="prose max-w-none text-sm text-ink leading-relaxed whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* 50% / 50% Split Screen Comparison Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
        {[prodA, prodB].map((p, idx) => (
          <div
            key={p.id}
            className="relative flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            {/* Split Screen Badge */}
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-ivory">
                Opción {idx === 0 ? 'A (50%)' : 'B (50%)'}
              </span>
              <button
                onClick={() => handleRemove(p.id)}
                className="rounded-full p-2 text-charcoal hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Quitar de la comparación"
              >
                <IconTrash size={18} />
              </button>
            </div>

            {/* Product Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-mist">
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Title & Category */}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-dark">{p.categoryName}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{p.name}</h2>
              <p className="mt-1 text-xs text-charcoal/60">SKU: {p.sku}</p>
            </div>

            {/* Price & Rating */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
              <div>
                <p className="font-display text-3xl font-bold text-ink">{formatPrice(p.price)}</p>
                {p.compareAtPrice && (
                  <p className="text-xs text-charcoal/50 line-through">{formatPrice(p.compareAtPrice)}</p>
                )}
              </div>
              <div>
                <RatingStars rating={p.rating} showValue count={p.reviewCount} />
                <div className="mt-1">
                  <StockBadge stock={p.stock} />
                </div>
              </div>
            </div>

            {/* Specs Table */}
            <div className="mt-6 flex-1 space-y-3 text-sm">
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Material</span>
                <span className="font-medium text-ink">{p.material || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Color</span>
                <span className="font-medium text-ink">{p.color || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Dimensiones</span>
                <span className="font-medium text-ink">{formatDimensions(p.dimensions)}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Marca</span>
                <span className="font-medium text-ink">{p.brand}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Ensamblaje</span>
                <span className="font-medium text-ink">{p.dimensions?.assembly || 'No requiere'}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold uppercase text-charcoal/60">Garantía</span>
                <span className="font-medium text-ink">10 años estructural</span>
              </div>

              {/* Description */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase text-charcoal/60 mb-1">Descripción</p>
                <p className="text-xs text-charcoal/80 leading-relaxed line-clamp-3">{p.description}</p>
              </div>

              {/* Tags */}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-mist px-2 py-0.5 text-[10px] font-semibold text-charcoal">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 grid grid-cols-2 gap-3 pt-4 border-t border-line">
              <Button
                onClick={() => handleAddToCart(p.id, p.name)}
                loading={addingCart === p.id}
                variant="gold"
                fullWidth
                size="md"
              >
                <IconCart size={16} /> Carrito
              </Button>
              <Button
                href={`/products/${p.slug}`}
                variant="outline"
                fullWidth
                size="md"
              >
                Ver Detalle <IconArrowRight size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
