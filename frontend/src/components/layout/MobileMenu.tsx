'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLockBodyScroll } from '@/hooks/useGeneral';
import { useI18n } from '@/i18n';
import { IconArrowRight, IconClose, IconUser } from '@/components/ui/Icons';
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

const UTILITY: Array<{ t: string; href: string }> = [
  { t: 'm.myAccount', href: '/account' },
  { t: 'account.orders', href: '/account/orders' },
  { t: 'account.wishlist', href: '/account/wishlist' },
  { t: 'contact.menu', href: '/contact' },
  { t: 'about.menu', href: '/about' },
];

export function MobileMenu() {
  const open = useUiStore((s) => s.menuOpen);
  const close = useUiStore((s) => s.closeMenu);
  const status = useAuthStore((s) => s.status);
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const { t } = useI18n();

  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-overlay/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-ivory"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <div className="flex items-center gap-1">
                <LocaleSwitcher />
                <ThemeSwitcher />
                <button
                  onClick={close}
                  className="rounded-full p-2 text-charcoal transition-colors hover:bg-mist"
                  aria-label="Close menu"
                >
                  <IconClose size={22} />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              {status === 'authenticated' ? (
                <Link
                  href="/account"
                  onClick={close}
                  className="mb-5 flex items-center gap-3 rounded-2xl bg-ink p-4 text-ivory"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink">
                    <IconUser size={20} />
                  </span>
                  <span>
                    <span className="block font-display text-base">{t('m.myAccount')}</span>
                    <span className="text-xs text-ivory/60">{t('m.viewProfile')}</span>
                  </span>
                </Link>
              ) : (
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={close} className="btn-gold">
                    {t('nav.signIn')}
                  </Link>
                  <Link href="/register" onClick={close} className="btn-outline">
                    {t('m.register')}
                  </Link>
                </div>
              )}

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">{t('m.shop')}</p>
              <ul className="space-y-1">
                <li>
                  <Link href="/products" onClick={close} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-mist">
                    {t('m.allProducts')}
                  </Link>
                </li>
                {NAV_KEY.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 font-medium hover:bg-mist"
                    >
                      {t(link.t)}
                      <IconArrowRight size={15} className="text-charcoal/40 transition-transform group-hover:translate-x-1 group-hover:text-gold-dark" />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">{t('m.accountSection')}</p>
              <ul className="space-y-1">
                {UTILITY.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="block rounded-lg px-3 py-2.5 text-ink/80 hover:bg-mist">
                      {t(link.t)}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link href="/admin" onClick={close} className="block rounded-lg px-3 py-2.5 font-semibold text-gold-dark hover:bg-mist">
                      {t('admin.dashboard')}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
