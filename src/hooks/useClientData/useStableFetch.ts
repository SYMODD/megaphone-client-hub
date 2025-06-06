
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface StableFetchParams {
  userId: string;
  filters: any;
  page: number;
  forceRefresh?: boolean;
}

interface StableFetchDependencies {
  fetchClients: (userId: string, filters: any, page: number, forceRefresh?: boolean) => Promise<any>;
  setCurrentPage: (page: number) => void;
  lastFetchParamsRef: React.MutableRefObject<string>;
  isCurrentlyFetchingRef: React.MutableRefObject<boolean>;
}

export const useStableFetch = ({
  fetchClients,
  setCurrentPage,
  lastFetchParamsRef,
  isCurrentlyFetchingRef
}: StableFetchDependencies) => {
  
  // Fonction de fetch optimisée avec protection contre les appels multiples
  const stableFetchClients = useCallback(async (params: StableFetchParams) => {
    const { userId, filters, page, forceRefresh = false } = params;
    
    // Éviter les appels multiples simultanés
    if (isCurrentlyFetchingRef.current && !forceRefresh) {
      console.log('🔄 Fetch en cours, annulation de la requête');
      return;
    }
    
    // Créer une clé stable pour la comparaison
    const fetchKey = JSON.stringify({ filters, page });
    
    // Éviter les fetches redondants
    if (!forceRefresh && fetchKey === lastFetchParamsRef.current) {
      console.log('🔄 Fetch évité - mêmes paramètres');
      return;
    }
    
    lastFetchParamsRef.current = fetchKey;
    isCurrentlyFetchingRef.current = true;
    
    console.log('🔄 Chargement des clients avec params:', { page, forceRefresh, filters });
    
    try {
      const result = await fetchClients(userId, filters, page, forceRefresh);
      
      if (result?.shouldGoToPreviousPage && result.newPage) {
        console.log('📄 Redirection automatique vers la page', result.newPage);
        setCurrentPage(result.newPage);
        // Re-fetch avec la nouvelle page
        await fetchClients(userId, filters, result.newPage, true);
      }
      
      return result;
    } finally {
      isCurrentlyFetchingRef.current = false;
    }
  }, [fetchClients, setCurrentPage, lastFetchParamsRef, isCurrentlyFetchingRef]);

  return { stableFetchClients };
};
