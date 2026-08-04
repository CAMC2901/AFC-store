import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_COMPARE = 4;

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  /** true if adding would exceed the cap */
  isFull: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => {
          if (s.ids.includes(id)) return { ids: s.ids.filter((x) => x !== id) };
          if (s.ids.length >= MAX_COMPARE) return s;
          return { ids: [...s.ids, id] };
        }),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
      isFull: () => get().ids.length >= MAX_COMPARE,
    }),
    { name: 'afc:compare' }
  )
);