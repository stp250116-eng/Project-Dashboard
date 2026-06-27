import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient with enterprise-appropriate defaults.
 * staleTime/gcTime tuned to reduce redundant network chatter for dashboards.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      gcTime: 5 * 60_000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
