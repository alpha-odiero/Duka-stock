import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storefrontService } from '@/services/storefront';
import type { StorefrontCMSConfig } from '@/types';

export const STOREFRONT_CONFIG_KEY = ['storefront', 'config'] as const;
export const STOREFRONT_LAST_UPDATED_KEY = 'dukastock:storefront:lastUpdated';

interface StorefrontCmsValue {
  config: StorefrontCMSConfig | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  invalidate: () => void;
}

const StorefrontCmsContext = createContext<StorefrontCmsValue | null>(null);

export function StorefrontCmsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: STOREFRONT_CONFIG_KEY,
    queryFn: () => storefrontService.getConfig(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: STOREFRONT_CONFIG_KEY });
    queryClient.invalidateQueries({ queryKey: ['storefront', 'completeness'] });
    queryClient.invalidateQueries({ queryKey: ['store', 'config'] });
    try {
      localStorage.setItem(STOREFRONT_LAST_UPDATED_KEY, Date.now().toString());
    } catch {
      // localStorage may be unavailable in some environments
    }
  };

  return (
    <StorefrontCmsContext.Provider value={{ config: data, isLoading, isError, refetch, invalidate }}>
      {children}
    </StorefrontCmsContext.Provider>
  );
}

export function useStorefrontCms() {
  const ctx = useContext(StorefrontCmsContext);
  if (!ctx) throw new Error('useStorefrontCms must be used within StorefrontCmsProvider');
  return ctx;
}
