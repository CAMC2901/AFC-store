import { create } from 'zustand';
import { AuthApi } from '@/services/auth';
import type { User } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/** Client-side auth store. Tokens never reach the browser — they live in HTTP-only cookies. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  hydrate: async () => {
    try {
      const user = await AuthApi.me();
      set({ user, status: 'authenticated' });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        set({ user: null, status: 'unauthenticated' });
      }
      // If it's a timeout or network error (like Render sleeping), keep current state
      // or at least don't force 'unauthenticated' so it doesn't wipe the cart.
    }
  },

  login: async (email, password) => {
    const user = await AuthApi.login({ email, password });
    set({ user, status: 'authenticated' });
    return user;
  },

  register: async (payload) => {
    const user = await AuthApi.register(payload);
    set({ user, status: 'authenticated' });
    return user;
  },

  logout: async () => {
    try {
      await AuthApi.logout();
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
}));

// React to expired sessions (dispatch from api-client after failed refresh).
if (typeof window !== 'undefined') {
  window.addEventListener('afc:unauthorized', () => {
    useAuthStore.setState({ user: null, status: 'unauthenticated' });
  });
}
