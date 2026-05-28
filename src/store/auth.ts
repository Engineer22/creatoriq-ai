import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { storeTokens, clearTokens } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
  is_active?: boolean;
  is_verified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          const { access_token, refresh_token, user } = res.data;
          storeTokens(access_token, refresh_token);
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          const { access_token, refresh_token, user } = res.data;
          storeTokens(access_token, refresh_token);
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      fetchMe: async () => {
        try {
          const res = await authApi.me();
          set({ user: res.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
