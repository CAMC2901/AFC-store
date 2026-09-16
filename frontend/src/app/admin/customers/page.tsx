'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate, initials } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => AdminApi.customers({ limit: 100 }),
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="text-gold" />
      </div>
    );
  }

  const filtered = data.items.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Clientes</h1>
          <p className="mt-1 text-sm text-charcoal/70">{data.pagination.total} cuentas de usuario registradas</p>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wider text-charcoal/60">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Contacto</th>
                <th className="px-5 py-3">Direcciones</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-mist/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-semibold text-gold">
                        {initials(u.firstName, u.lastName)}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-charcoal/50">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{u.email}</p>
                    <p className="text-xs text-charcoal/60">{u.phone ?? 'Sin teléfono'}</p>
                  </td>
                  <td className="px-5 py-3 font-medium">{u.addresses.length} guardadas</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === 'ADMIN' ? 'gold' : 'muted'}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-charcoal/70">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
