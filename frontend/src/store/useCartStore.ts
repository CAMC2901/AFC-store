import { create } from 'zustand';
import { CartApi } from '@/services/cart';
import { ProductsApi } from '@/services/products';
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

const GUEST_CART_KEY = 'afc_guest_cart';

interface GuestItem {
  productId: string;
  quantity: number;
}

const getGuestItems = (): GuestItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestItem[]) : [];
  } catch {
    return [];
  }
};

const setGuestItems = (items: GuestItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* empty */
  }
};

const clearGuestItems = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    /* empty */
  }
};

const derive = (lines: CartLine[]) => ({
  count: lines.reduce((sum, l) => sum + l.quantity, 0),
  subtotal: lines.reduce((sum, l) => sum + l.subtotal, 0),
});

const hydrateGuestLines = async (guestItems: GuestItem[]): Promise<CartLine[]> => {
  if (guestItems.length === 0) return [];
  try {
    const res = await ProductsApi.list({ limit: 100 });
    const productMap = new Map(res.items.map((p) => [p.id, p]));
    const lines: CartLine[] = [];

    for (const item of guestItems) {
      const product = productMap.get(item.productId);
      if (product && product.isActive) {
        lines.push({
          productId: product.id,
          name: product.name,
          nameEn: product.nameEn,
          slug: product.slug,
          image: product.images[0] ?? '',
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: Math.round(product.price * item.quantity * 100) / 100,
          stock: product.stock,
        });
      }
    }
    return lines;
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  count: 0,
  subtotal: 0,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      // Check if guest items exist to merge with server cart
      const guest = getGuestItems();
      if (guest.length > 0) {
        for (const item of guest) {
          try {
            await CartApi.add(item.productId, item.quantity);
          } catch {
            /* ignore individual item add error */
          }
        }
        clearGuestItems();
      }

      const data = await CartApi.get();
      set({ lines: data.lines, ...derive(data.lines) });
    } catch {
      // Unauthenticated / Offline fallback: use local guest cart
      const guestItems = getGuestItems();
      const guestLines = await hydrateGuestLines(guestItems);
      set({ lines: guestLines, ...derive(guestLines) });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (productId, quantity = 1) => {
    try {
      const data = await CartApi.add(productId, quantity);
      set({ lines: data.lines, ...derive(data.lines) });
    } catch {
      // Guest mode
      const items = getGuestItems();
      const existing = items.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ productId, quantity });
      }
      setGuestItems(items);
      const guestLines = await hydrateGuestLines(items);
      set({ lines: guestLines, ...derive(guestLines) });
    }
  },

  update: async (productId, quantity) => {
    try {
      const { lines } = await CartApi.update(productId, quantity);
      set({ lines, ...derive(lines) });
    } catch {
      // Guest mode
      let items = getGuestItems();
      if (quantity <= 0) {
        items = items.filter((i) => i.productId !== productId);
      } else {
        const target = items.find((i) => i.productId === productId);
        if (target) target.quantity = quantity;
      }
      setGuestItems(items);
      const guestLines = await hydrateGuestLines(items);
      set({ lines: guestLines, ...derive(guestLines) });
    }
  },

  remove: async (productId) => {
    try {
      const { lines } = await CartApi.remove(productId);
      set({ lines, ...derive(lines) });
    } catch {
      // Guest mode
      const items = getGuestItems().filter((i) => i.productId !== productId);
      setGuestItems(items);
      const guestLines = await hydrateGuestLines(items);
      set({ lines: guestLines, ...derive(guestLines) });
    }
  },

  clear: async () => {
    try {
      await CartApi.clear();
    } catch {
      /* ignore */
    }
    clearGuestItems();
    set({ lines: [], count: 0, subtotal: 0 });
  },

  reset: () => {
    clearGuestItems();
    set({ lines: [], count: 0, subtotal: 0, isLoading: false });
  },
}));
