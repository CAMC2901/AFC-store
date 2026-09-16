'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useI18n } from '@/i18n';
import { localizeProduct } from '@/i18n/localize';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const { locale } = useI18n();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => AdminApi.products({ limit: 100 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => AdminApi.categories(),
  });

  const items = data?.items.map((p) => localizeProduct(p, locale));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Producto eliminado.');
    },
    onError: () => toast.error('No se pudo eliminar el producto.'),
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => AdminApi.adjustStock(id, delta),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Inventario actualizado.');
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-charcoal/70">
            {data.pagination.total} SKUs · {items?.filter((p) => p.stock === 0).length} sin stock
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Añadir producto</Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wider text-charcoal/60">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items?.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-mist/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
                        <Image src={p.images[0] ?? ''} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-charcoal/60">{p.sku} · {p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-charcoal/70">{p.categoryName}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={p.stock === 0 ? 'red' : p.stock <= 10 ? 'gold' : 'green'}>{p.stock}</Badge>
                      <div className="flex gap-1">
                        <button
                          onClick={() => stockMutation.mutate({ id: p.id, delta: 5 })}
                          className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold hover:bg-gold/20"
                          aria-label="Añadir 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => stockMutation.mutate({ id: p.id, delta: -5 })}
                          className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold hover:bg-red-100"
                          aria-label="Quitar 5"
                        >
                          −5
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${p.featured ? 'bg-amber-100 text-amber-800' : 'bg-mist text-charcoal/70'}`}>
                      {p.featured ? '★ Destacado' : 'Estándar'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-gold-dark hover:bg-gold/10"
                      >
                        Editar
                      </button>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="rounded-full px-3 py-1 text-xs font-semibold text-charcoal hover:bg-mist"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${p.name}"?`)) deleteMutation.mutate(p.id);
                        }}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación / Edición */}
      {(isCreateOpen || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          categories={categories ?? []}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setIsCreateOpen(false);
            setEditingProduct(null);
            qc.invalidateQueries({ queryKey: ['admin', 'products'] });
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: import('@/types').Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? 0,
    stock: product?.stock ?? 10,
    categoryId: product?.categoryId ?? (categories[0]?.id || 'cat_living'),
    brand: product?.brand ?? 'AFC Studio',
    material: product?.material ?? '',
    color: product?.color ?? '',
    width: product?.dimensions?.width ?? '',
    height: product?.dimensions?.height ?? '',
    depth: product?.dimensions?.depth ?? '',
    weight: product?.weight ?? '',
    images: product?.images ?? ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
    description: product?.description ?? '',
    featured: product?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const imgList = form.images.filter(Boolean);

    const payload: Partial<Product> = {
      name: form.name,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock),
      categoryId: form.categoryId,
      brand: form.brand,
      material: form.material || undefined,
      color: form.color || undefined,
      dimensions: {
        width: form.width ? Number(form.width) : undefined,
        height: form.height ? Number(form.height) : undefined,
        depth: form.depth ? Number(form.depth) : undefined,
        unit: 'cm', // Default to cm for international/Latam use as standard
      },
      weight: form.weight ? Number(form.weight) : undefined,
      images: imgList.length > 0 ? imgList : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
      description: form.description,
      featured: form.featured,
    };

    try {
      if (isEdit && product) {
        await AdminApi.updateProduct(product.id, payload);
        toast.success('Producto actualizado.');
      } else {
        await AdminApi.createProduct(payload);
        toast.success('Producto creado con éxito.');
      }
      onSave();
    } catch {
      toast.error('No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-ivory p-6 shadow-modal">
        <h2 className="font-display text-2xl">{isEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre del Producto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div>
              <label className="label">Categoría</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="Precio (COP)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <Input label="Precio Comparativo / Anterior" type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: Number(e.target.value) })} />
            <Input label="Stock Inicial" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            <Input label="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
            <Input label="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="ej. Madera de Roble" />
            <Input label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="ej. Marrón / Nogal" />
            <Input label="Ancho (cm)" type="number" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} placeholder="ej. 120" />
            <Input label="Alto (cm)" type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="ej. 80" />
            <Input label="Profundidad (cm)" type="number" value={form.depth} onChange={(e) => setForm({ ...form, depth: e.target.value })} placeholder="ej. 60" />
            <Input label="Peso (kg)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="ej. 25.5" step="0.1" />
          </div>

          <ImageUploader
            value={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
            multiple={true}
            label="Imágenes del Producto (Arrastra y suelta imágenes o selecciona archivos)"
          />

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input h-24"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded-sm border-line text-gold"
            />
            <label htmlFor="featured" className="text-sm font-medium text-ink">Destacar en la página de inicio</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar Cambios' : 'Crear Producto'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
