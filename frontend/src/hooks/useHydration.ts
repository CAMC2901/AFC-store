'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

/**
 * Hydrates auth, cart and wishlist from the server on mount and whenever the
 * auth status changes (login/logout). Must be mounted inside providers.
 */
export function useHydration() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const resetCart = useCartStore((s) => s.reset);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const resetWishlist = useWishlistStore((s) => s.reset);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (status === 'authenticated') {
      void Promise.all([hydrateCart(), hydrateWishlist()]);
    } else if (status === 'unauthenticated') {
      resetCart();
      resetWishlist();
    }
  }, [status, hydrateCart, resetCart, hydrateWishlist, resetWishlist]);
}
