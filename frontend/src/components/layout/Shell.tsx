'use client';

import { type ReactNode } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { ScrollToTop } from './ScrollToTop';
import { WhatsAppWidget } from '@/components/support/WhatsAppWidget';
import { AssistantWidget } from '@/components/support/AssistantWidget';
import { CompareBar } from '@/components/products/CompareBar';
import { OfflineBanner } from './OfflineBanner';

/**
 * App shell: hydrates session data and wraps every page with the global
 * navigation chrome (navbar, drawers, footer).
 */
export function Shell({ children }: { children: ReactNode }) {
  useHydration();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
      <ScrollToTop />
      <AssistantWidget />
      <WhatsAppWidget />
      <CompareBar />
      <OfflineBanner />
    </div>
  );
}
