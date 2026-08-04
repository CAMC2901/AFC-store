import { create } from 'zustand';

interface UiState {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  closeAll: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true, menuOpen: false, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openMenu: () => set({ menuOpen: true, cartOpen: false, searchOpen: false }),
  closeMenu: () => set({ menuOpen: false }),
  openSearch: () => set({ searchOpen: true, menuOpen: false, cartOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  closeAll: () => set({ cartOpen: false, menuOpen: false, searchOpen: false }),
}));
