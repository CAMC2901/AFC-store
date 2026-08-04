'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/services/account';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate, initials } from '@/lib/utils';

export default function AdminCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => AdminApi.customers({ limit: 50 }),
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
      <div className="mb-6">
        <h1 className="font-display text-3xl">Clientes</h1>
        <p className="mt-1 text-sm text-charcoal/70">{data.pagination.total} cuentas registradas</p>
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
                <th className="px-5 py-3">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-mist/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-semibold text-gold">
                        {initials(u.firstName, u.lastName)}
                      </span>
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p>{u.email}</p>
                    <p className="text-xs text-charcoal/60">{u.phone ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3">{u.addresses.length}</td>
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
