'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Category } from '@/types';
import toast from 'react-hot-toast';
import { useI18n } from '@/i18n';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { localizeCategory, localizeProduct } from '@/i18n/localize';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const { locale } = useI18n();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: AdminApi.categories,
  });
  const { data: products } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => AdminApi.products({ limit: 200 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Categoría eliminada.');
    },
    onError: () => toast.error('No se pudo eliminar la categoría.'),
  });

  const cats = categories?.map((c) => localizeCategory(c, locale));
  const prods = products?.items.map((p) => localizeProduct(p, locale));

  if (isLoading || !categories) {
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
          <h1 className="font-display text-3xl">Categorías</h1>
          <p className="mt-1 text-sm text-charcoal/70">Organiza la colección por habitación y estilo.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Añadir categoría</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats?.map((c) => {
          const count = prods?.filter((p) => p.categoryId === c.id).length ?? c.productCount ?? 0;
          const inStock = prods?.filter((p) => p.categoryId === c.id && p.stock > 0).length ?? 0;
          return (
            <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg">{c.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs text-charcoal/60">{c.description || 'Sin descripción'}</p>
                  </div>
                  <Badge tone="muted">{count} productos</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-mist px-4 py-3 text-xs">
                  <span className="text-charcoal/70">{inStock} en stock</span>
                  <span className="font-semibold text-gold-dark">
                    {count === 0 ? '—' : `${formatPrice((prods?.find((p) => p.categoryId === c.id)?.price ?? 0))}+`}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  onClick={() => setEditingCategory(c)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-gold-dark hover:bg-gold/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar categoría "${c.name}"?`)) deleteMutation.mutate(c.id);
                  }}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(isCreateOpen || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingCategory(null);
          }}
          onSave={() => {
            setIsCreateOpen(false);
            setEditingCategory(null);
            qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
          }}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    imageUrl: category?.imageUrl ?? '',
    sortOrder: category?.sortOrder ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && category) {
        await AdminApi.updateCategory(category.id, form);
        toast.success('Categoría actualizada.');
      } else {
        await AdminApi.createCategory(form);
        toast.success('Categoría creada.');
      }
      onSave();
    } catch {
      toast.error('No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-ivory p-6 shadow-modal">
        <h2 className="font-display text-2xl">{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Nombre de Categoría" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug / URL (opcional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ej. mueble-salon" />
          <ImageUploader
            value={form.imageUrl ? [form.imageUrl] : []}
            onChange={(urls) => setForm({ ...form, imageUrl: urls[0] || '' })}
            multiple={false}
            label="Imagen de la Categoría (Arrastra o selecciona archivo)"
          />
          <Input label="Orden de Clasificación" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <div>
            <label className="label">Descripción</label>
            <textarea className="input h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar Cambios' : 'Crear Categoría'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
