'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: AdminApi.coupons,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AdminApi.deleteCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Cupón eliminado.');
    },
    onError: () => toast.error('No se pudo eliminar el cupón.'),
  });

  if (isLoading || !coupons) {
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
          <h1 className="font-display text-3xl">Cupones</h1>
          <p className="mt-1 text-sm text-charcoal/70">Códigos promocionales disponibles al pagar.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Añadir cupón</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => {
          const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
          const exhausted = c.usageLimit !== undefined && c.usedCount >= c.usageLimit;
          return (
            <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border-2 border-dashed border-gold px-3 py-1 font-mono text-sm font-bold tracking-wider text-gold-dark">
                    {c.code}
                  </span>
                  <Badge tone={!c.isActive || expired || exhausted ? 'red' : 'green'}>
                    {!c.isActive ? 'Inactivo' : expired ? 'Vencido' : exhausted ? 'Agotado' : 'Activo'}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-charcoal">
                  <p>
                    <span className="font-semibold text-ink">
                      {c.type === 'PERCENTAGE' ? `${c.value}% de descuento` : `${formatPrice(c.value)} de descuento`}
                    </span>
                  </p>
                  <p>Subtotal mín.: <span className="font-medium text-ink">{formatPrice(c.minSubtotal)}</span></p>
                  {c.maxDiscount && <p>Descuento máx.: {formatPrice(c.maxDiscount)}</p>}
                  <p>Usado: <span className="font-medium text-ink">{c.usedCount}</span>{c.usageLimit ? ` / ${c.usageLimit}` : ''}</p>
                  {c.expiresAt && <p>Vence: {new Date(c.expiresAt).toLocaleDateString()}</p>}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  onClick={() => setEditingCoupon(c)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-gold-dark hover:bg-gold/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar cupón "${c.code}"?`)) deleteMutation.mutate(c.id);
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

      {(isCreateOpen || editingCoupon) && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingCoupon(null);
          }}
          onSave={() => {
            setIsCreateOpen(false);
            setEditingCoupon(null);
            qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
          }}
        />
      )}
    </div>
  );
}

function CouponFormModal({
  coupon,
  onClose,
  onSave,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = Boolean(coupon);
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    type: coupon?.type ?? 'PERCENTAGE',
    value: coupon?.value ?? 10,
    minSubtotal: coupon?.minSubtotal ?? 0,
    maxDiscount: coupon?.maxDiscount ?? 0,
    usageLimit: coupon?.usageLimit ?? 100,
    isActive: coupon?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Partial<Coupon> = {
      code: form.code.toUpperCase(),
      type: form.type as 'PERCENTAGE' | 'FIXED',
      value: Number(form.value),
      minSubtotal: Number(form.minSubtotal),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    };

    try {
      if (isEdit && coupon) {
        await AdminApi.updateCoupon(coupon.id, payload);
        toast.success('Cupón actualizado.');
      } else {
        await AdminApi.createCoupon(payload);
        toast.success('Cupón creado.');
      }
      onSave();
    } catch {
      toast.error('No se pudo guardar el cupón.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-ivory p-6 shadow-modal">
        <h2 className="font-display text-2xl">{isEdit ? 'Editar Cupón' : 'Nuevo Cupón Promocional'}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Código Promocional" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="ej. AFC10" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Descuento</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto Fijo (COP)</option>
              </select>
            </div>
            <Input label="Valor del Descuento" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Subtotal Mínimo (COP)" type="number" value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })} />
            <Input label="Descuento Máximo (COP)" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} placeholder="opcional" />
          </div>

          <Input label="Límite de Usos Totales" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} placeholder="ej. 100" />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="couponActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded-sm border-line text-gold"
            />
            <label htmlFor="couponActive" className="text-sm font-medium text-ink">Cupón Activo para Clientes</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar Cambios' : 'Crear Cupón'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
