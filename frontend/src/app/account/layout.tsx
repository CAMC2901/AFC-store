'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn, initials } from '@/lib/utils';
import {
  IconAddress,
  IconBox,
  IconHeart,
  IconLogout,
  IconUser,
} from './AccountIcons';
import { Spinner } from '@/components/ui/Spinner';

const links = [
  { href: '/account', label: 'Resumen', icon: IconUser },
  { href: '/account/orders', label: 'Pedidos', icon: IconBox },
  { href: '/account/wishlist', label: 'Lista de deseos', icon: IconHeart },
  { href: '/account/addresses', label: 'Direcciones', icon: IconAddress },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { status, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/account');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="container-afc flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} className="text-gold" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="container-afc py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg font-semibold text-gold">
              {initials(user?.firstName ?? 'A', user?.lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-charcoal/60">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-ink text-ivory'
                    : 'text-ink/70 hover:bg-mist hover:text-ink'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-ink text-ivory'
                    : 'text-ink/70 hover:bg-mist hover:text-ink'
                )}
              >
                <IconShieldAdmin />
                Administración
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <IconLogout size={18} />
              Cerrar sesión
            </button>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function IconShieldAdmin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
