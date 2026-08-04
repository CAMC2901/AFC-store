'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import {
  IconChart,
  IconBox,
  IconUsers,
  IconTag,
  IconGrid,
  IconPackage,
} from '@/components/ui/Icons';

const links = [
  { href: '/admin', label: 'Panel', icon: IconChart },
  { href: '/admin/products', label: 'Productos', icon: IconBox },
  { href: '/admin/orders', label: 'Pedidos', icon: IconPackage },
  { href: '/admin/customers', label: 'Clientes', icon: IconUsers },
  { href: '/admin/categories', label: 'Categorías', icon: IconGrid },
  { href: '/admin/coupons', label: 'Cupones', icon: IconTag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/admin');
    else if (status === 'authenticated' && user?.role !== 'ADMIN') router.replace('/account');
  }, [status, user, router]);

  if (status !== 'authenticated' || user?.role !== 'ADMIN') {
    return (
      <div className="container-afc flex min-h-[60vh] items-center justify-center">
        <Spinner size={32} className="text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-mist/40">
      <div className="border-b border-line bg-ink text-ivory">
        <div className="container-afc flex items-center justify-between py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Consola de administración</p>
            <h1 className="font-display text-2xl">Panel de administración de AFC</h1>
          </div>
          <Link href="/" className="text-sm text-ivory/60 hover:text-gold">
            Ver tienda →
          </Link>
        </div>
      </div>

      <div className="container-afc grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-24">
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href ? 'bg-ink text-ivory' : 'text-ink/70 hover:bg-mist'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            <p className="px-3.5 text-xs text-charcoal/60">
              Sesión iniciada como <span className="font-medium text-ink">{user?.email}</span>
            </p>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
