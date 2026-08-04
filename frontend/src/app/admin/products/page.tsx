'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => AdminApi.products({ limit: 50 }),
  });

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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-charcoal/70">{data.pagination.total} SKUs · {data.items.filter((p) => p.stock === 0).length} sin stock</p>
        </div>
        <Button href="/admin/products">Añadir producto</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wider text-charcoal/60">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Valoración</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-mist/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
                        <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-charcoal/60">{p.sku}</p>
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
                          aria-label="Añadir 5 al stock"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => stockMutation.mutate({ id: p.id, delta: -5 })}
                          className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold hover:bg-red-100"
                          aria-label="Quitar 5 del stock"
                        >
                          −5
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.rating.toFixed(1)} ★</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="rounded-full px-3 py-1 text-xs font-semibold text-gold-dark hover:bg-gold/10"
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
    </div>
  );
}
