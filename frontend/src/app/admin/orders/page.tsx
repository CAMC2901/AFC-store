'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => AdminApi.orders({ limit: 50, status: statusFilter === 'ALL' ? undefined : statusFilter }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => AdminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      toast.success('Pedido actualizado.');
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Pedidos</h1>
          <p className="mt-1 text-sm text-charcoal/70">{data?.pagination.total ?? '…'} pedidos</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-ink text-ivory' : 'bg-surface text-charcoal hover:bg-mist'
              }`}
            >
              {s === 'ALL' ? 'Todos' : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} className="text-gold" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wider text-charcoal/60">
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Artículos</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((o) => (
                  <tr key={o.id} className="align-top transition-colors hover:bg-mist/40">
                    <td className="px-5 py-3 font-mono font-medium">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{o.contact.firstName} {o.contact.lastName}</p>
                      <p className="text-xs text-charcoal/60">{o.contact.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 4).map((item) => (
                          <div key={item.productId} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-mist">
                            <Image src={item.image} alt={item.name} fill sizes="36px" className="object-cover" />
                          </div>
                        ))}
                        {o.items.length > 4 && (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-ink text-[10px] font-bold text-ivory">
                            +{o.items.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3 text-charcoal/70">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                        className="input w-auto cursor-pointer px-3 py-1.5 text-xs font-medium"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
