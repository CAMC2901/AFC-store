'use client';

import Link from 'next/link';
import { useScrollDirection } from '@/hooks/useGeneral';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  IconCart,
  IconHeart,
  IconMenu,
  IconSearch,
  IconUser,
} from '@/components/ui/Icons';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';

const NAV_KEY: Array<{ t: string; href: string }> = [
  { t: 'nav.living', href: '/products?category=living-room' },
  { t: 'nav.bedroom', href: '/products?category=bedroom' },
  { t: 'nav.dining', href: '/products?category=dining' },
  { t: 'nav.office', href: '/products?category=office' },
  { t: 'nav.lighting', href: '/products?category=lighting' },
  { t: 'nav.decor', href: '/products?category=decor' },
];

export function Navbar() {
  const direction = useScrollDirection();
  const openCart = useUiStore((s) => s.openCart);
  const openMenu = useUiStore((s) => s.openMenu);
  const openSearch = useUiStore((s) => s.openSearch);
  const status = useAuthStore((s) => s.status);
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.ids.size);
  const { t, formatMoney } = useI18n();

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-line bg-ivory/85 backdrop-blur-xl transition-transform duration-300',
        direction === 'down' ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <nav className="container-afc flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-1">
          <button className={cn(iconBtn, 'lg:hidden')} onClick={openMenu} aria-label="Open menu">
            <IconMenu size={22} />
          </button>
          <Logo />
        </div>

        {/* Center: categories (desktop) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_KEY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="link-underline rounded-md px-3 py-2 text-[13px] font-medium uppercase tracking-wider text-ink/80 transition-colors hover:text-ink"
              >
                {t(item.t)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeSwitcher />

          <button className={iconBtn} onClick={openSearch} aria-label="Search">
            <IconSearch size={21} />
          </button>

          <Link
            href={status === 'authenticated' ? '/account' : '/login'}
            className={cn(iconBtn, 'hidden sm:flex')}
            aria-label="Account"
          >
            <IconUser size={21} />
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-gold" />
          </Link>

          <Link
            href="/account/wishlist"
            className={cn(iconBtn, 'hidden sm:flex')}
            aria-label="Wishlist"
          >
            <IconHeart size={21} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button className={iconBtn} onClick={openCart} aria-label="Open cart">
            <IconCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-ivory">
                {cartCount}
              </span>
            )}
          </button>

          {status === 'unauthenticated' && (
            <Link href="/login" className="btn-gold ml-2 hidden px-5 py-2.5 text-xs lg:inline-flex">
              {t('nav.signIn')}
            </Link>
          )}
        </div>
      </nav>

      {/* Trust strip */}
      <div className="hidden items-center justify-center gap-10 border-t border-line py-2 text-[11px] font-medium uppercase tracking-widest text-charcoal/70 lg:flex">
        <span>{t('trust.freeShipping', { amount: formatMoney(1499) })}</span>
        <span className="text-gold">·</span>
        <span>{t('trust.warranty')}</span>
        <span className="text-gold">·</span>
        <span>{t('trust.sustainably')}</span>
        <span className="text-gold">·</span>
        <span>{t('trust.comfort')}</span>
      </div>
    </header>
  );
}
