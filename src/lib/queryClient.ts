// src/lib/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

// ✅ Cache intelligent avec gestion d'erreurs optimisée
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Log uniquement les erreurs importantes en mode développement
    if (process.env.NODE_ENV === 'development' && query.state.data !== undefined) {
      console.warn('Query error with cached data:', error);
    }
  },
});

const mutationCache = new MutationCache({
  onError: (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Mutation error:', error);
    }
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // ✅ PERFORMANCE - Cache optimisé pour la vitesse
      staleTime: 5 * 60 * 1000,  // 5 minutes (plus rapide)
      gcTime: 15 * 60 * 1000,    // 15 minutes en cache
      
      // ✅ PERFORMANCE - Stratégie de retry intelligente
      retry: (failureCount, error: any) => {
        // Ne pas retry pour les erreurs 4xx (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1; // Maximum 1 retry pour plus de rapidité
      },
      retryDelay: 1500, // Délai fixe de 1.5s
      
      // ✅ PERFORMANCE - Optimisations de refetch
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Utilise le cache si disponible
      
      // ✅ PERFORMANCE - Network mode optimisé
      networkMode: 'online',
      
      // ✅ PERFORMANCE - Placeholders pour UX fluide
      placeholderData: (previousData) => previousData,
      
      // ✅ PERFORMANCE - Optimisation des re-renders
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
      
      // ✅ PERFORMANCE - Timeout optimisé
      meta: {
        timeout: 10000, // 10 secondes max
      }
    },
    mutations: {
      // ✅ PERFORMANCE - Mutations optimisées
      retry: 1,
      networkMode: 'online',
      
      // ✅ PERFORMANCE - Gestion d'erreur optimisée
      onError: (error) => {
        console.error('Mutation failed:', error);
      },
      
      // ✅ PERFORMANCE - Timeout pour mutations
      meta: {
        timeout: 15000, // 15 secondes pour les mutations
      }
    },
  },
});

// ✅ PERFORMANCE - Prefetching automatique des routes critiques (simplifié)
export const prefetchCriticalData = async () => {
  // Prefetch des données critiques pour le dashboard
  const criticalQueries = ['dashboard-stats', 'user-profile'];
  
  for (const queryKey of criticalQueries) {
    try {
      await queryClient.prefetchQuery({
        queryKey: [queryKey],
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    } catch (error) {
      // Ignore silencieusement les erreurs de prefetch
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Failed to prefetch ${queryKey}:`, error);
      }
    }
  }
};

// ✅ PERFORMANCE - Optimisation de la mémoire avec cleanup périodique
export const optimizeMemory = () => {
  // Nettoie les queries inactives toutes les 5 minutes
  setInterval(() => {
    queryClient.getQueryCache().clear();
  }, 5 * 60 * 1000);
};

// ✅ PERFORMANCE - Utilitaires de cache optimisés
export const cacheUtils = {
  // Invalidation intelligente
  invalidateQueries: (queryKey: string[]) => {
    return queryClient.invalidateQueries({ 
      queryKey,
      exact: false,
      refetchType: 'active' // Refetch uniquement les queries actives
    });
  },
  
  // Mise à jour optimiste
  setQueryData: <T>(queryKey: string[], updater: (old: T | undefined) => T) => {
    return queryClient.setQueryData(queryKey, updater);
  },
  
  // Prefetch conditionnel
  prefetchQuery: async (queryKey: string[], queryFn: () => Promise<any>) => {
    if (!queryClient.getQueryData(queryKey)) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000,
      });
    }
  },
  
  // Cleanup sélectif
  removeQueries: (queryKey: string[]) => {
    queryClient.removeQueries({ queryKey, exact: false });
  }
};

// ✅ PERFORMANCE - Configuration pour le développement
if (process.env.NODE_ENV === 'development') {
  console.log('Query Client optimisé activé pour le développement');
}

export default queryClient;