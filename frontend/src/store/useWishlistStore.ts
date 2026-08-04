import { create } from 'zustand';
import { WishlistApi } from '@/services/orders';
import type { Product } from '@/types';

interface WishlistState {
  products: Product[];
  ids: Set<string>;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  products: [],
  ids: new Set(),
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const products = await WishlistApi.list();
      set({ products, ids: new Set(products.map((p) => p.id)) });
    } catch {
      set({ products: [], ids: new Set() });
    } finally {
      set({ isLoading: false });
    }
  },

  toggle: async (productId) => {
    const { added } = await WishlistApi.toggle(productId);
    const { products, ids } = useWishlistStore.getState();
    if (added) {
      const full = await WishlistApi.list();
      set({ products: full, ids: new Set(full.map((p) => p.id)) });
    } else {
      const next = products.filter((p) => p.id !== productId);
      const nextIds = new Set(ids);
      nextIds.delete(productId);
      set({ products: next, ids: nextIds });
    }
    return added;
  },

  remove: async (productId) => {
    await WishlistApi.remove(productId);
    const { products, ids } = useWishlistStore.getState();
    set({
      products: products.filter((p) => p.id !== productId),
      ids: new Set([...ids].filter((id) => id !== productId)),
    });
  },

  reset: () => set({ products: [], ids: new Set(), isLoading: false }),
}));
