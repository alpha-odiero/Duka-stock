import { QueryClient } from '@tanstack/react-query';

// Central QueryClient: retries once, keeps stale data while refetching so
// navigation feels instant, and treats 4xx errors as non-retryable.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
