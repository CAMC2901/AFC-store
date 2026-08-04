import { create } from 'zustand';
import { CartApi } from '@/services/cart';
import type { CartLine } from '@/types';

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

const derive = (lines: CartLine[]) => ({
  count: lines.reduce((sum, l) => sum + l.quantity, 0),
  subtotal: lines.reduce((sum, l) => sum + l.subtotal, 0),
});

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  count: 0,
  subtotal: 0,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const data = await CartApi.get();
      set({ lines: data.lines, ...derive(data.lines) });
    } catch {
      set({ lines: [], count: 0, subtotal: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (productId, quantity = 1) => {
    const data = await CartApi.add(productId, quantity);
    set({ lines: data.lines, ...derive(data.lines) });
  },

  update: async (productId, quantity) => {
    const { lines } = await CartApi.update(productId, quantity);
    set({ lines, ...derive(lines) });
  },

  remove: async (productId) => {
    const { lines } = await CartApi.remove(productId);
    set({ lines, ...derive(lines) });
  },

  clear: async () => {
    await CartApi.clear();
    set({ lines: [], count: 0, subtotal: 0 });
  },

  reset: () => set({ lines: [], count: 0, subtotal: 0, isLoading: false }),
}));
