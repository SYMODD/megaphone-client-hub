// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garde en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry automatique en cas d'erreur
      retry: 1,
      // Refetch quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
    },
  },
});