import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import type { Register, Shop, User } from '@/types';
import { hasPermission, type Permission } from '@/lib/permissions';
import { useToast } from '@/components/ui/toast';

interface AuthContextValue {
  user: User | null;
  shop: Shop | null;
  register: Register | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  registerBusiness: (input: Parameters<typeof authService.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => void;
  setUser: (user: User | null) => void;
  setShop: (shop: Shop | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await authService.me();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    await authService.login({ email, password });
    await queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  const registerBusiness = useCallback(
    async (input: Parameters<typeof authService.register>[0]) => {
      await authService.register(input);
      await queryClient.removeQueries({ queryKey: ['me'] });
      await refetch();
    },
    [queryClient, refetch],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    queryClient.clear();
    toast('Signed out', { type: 'info' });
  }, [queryClient, toast]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? null,
      shop: data?.shop ?? null,
      register: data?.register ?? null,
      isLoading,
      isAuthenticated: Boolean(data?.user),
      can: (permission) => hasPermission(data?.user?.role, permission),
      login,
      registerBusiness,
      logout,
      refresh: () => refetch(),
      setUser: (u) => queryClient.setQueryData(['me'], (old: unknown) =>
        old && typeof old === 'object' && 'user' in old ? { ...(old as object), user: u } : old),
      setShop: (s) => queryClient.setQueryData(['me'], (old: unknown) =>
        old && typeof old === 'object' && 'shop' in old ? { ...(old as object), shop: s } : old),
    }),
    [data, isLoading, login, registerBusiness, logout, refetch, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
