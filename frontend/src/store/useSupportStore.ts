import { create } from 'zustand';

interface SupportState {
  /** Custom message context (e.g. a product or order the user is asking about). */
  context: string | null;
  setContext: (message: string | null) => void;
}

export const useSupportStore = create<SupportState>((set) => ({
  context: null,
  setContext: (message) => set({ context: message }),
}));