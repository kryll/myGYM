import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Tenant, AuthTokens, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/api';

interface AuthStore {
  user: User | null;
  tenant: Tenant | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<AuthTokens>;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { user, tenant, tokens } = response.data;
          set({
            user,
            tenant,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const axiosError = error as any;
          const serverMessage = axiosError?.response?.data?.message || message;
          set({ isLoading: false, error: serverMessage });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          const { user, tenant, tokens } = response.data;
          set({
            user,
            tenant,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al registrarse';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const axiosError = error as any;
          const serverMessage = axiosError?.response?.data?.message || message;
          set({ isLoading: false, error: serverMessage });
          throw error;
        }
      },

      logout: () => {
        authService.logout().catch(console.warn);
        set({
          user: null,
          tenant: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await authService.refreshToken(tokens.refreshToken);
        const newTokens = response.data;

        set({ tokens: newTokens });
        return newTokens;
      },

      setUser: (user) => set({ user }),

      setTenant: (tenant) => set({ tenant }),

      clearError: () => set({ error: null }),

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'mygym-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
