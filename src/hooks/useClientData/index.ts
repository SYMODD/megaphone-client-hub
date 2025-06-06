
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";
import { useClientFilters } from "./useClientFilters";
import { useClientFetcher } from "./useClientFetcher";
import { usePagination } from "./usePagination";
import { supabase } from "@/integrations/supabase/client";

export const useClientData = () => {
  const { user } = useAuth();
  const { serverFilters, localFilters, updateLocalFilters, applyServerFilters } = useClientFilters();
  const {
    clients,
    loading,
    error,
    totalCount,
    fetchClients
  } = useClientFetcher();
  const { currentPage, totalPages, handlePageChange, setCurrentPage } = usePagination(totalCount);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Utiliser des refs pour éviter les re-renders inutiles
  const lastFetchParamsRef = useRef<string>('');
  const isCurrentlyFetchingRef = useRef(false);

  // Fonction de fetch optimisée avec protection contre les appels multiples
  const stableFetchClients = useCallback(async (params: {
    userId: string;
    filters: any;
    page: number;
    forceRefresh?: boolean;
  }) => {
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
  }, [fetchClients, setCurrentPage]);

  // Fonction simplifiée pour fetch avec options
  const fetchClientsWithFilters = useCallback(async (options?: {
    searchTerm?: string;
    nationality?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    page?: number;
    forceRefresh?: boolean;
  }) => {
    if (!user) {
      console.log('❌ Pas d\'utilisateur - impossible de charger');
      return;
    }

    const filters = options ? {
      searchTerm: options.searchTerm || "",
      nationality: options.nationality || "",
      dateFrom: options.dateFrom,
      dateTo: options.dateTo
    } : serverFilters;
    
    const page = options?.page || currentPage;
    const forceRefresh = options?.forceRefresh || false;

    return stableFetchClients({
      userId: user.id,
      filters,
      page,
      forceRefresh
    });
  }, [user, stableFetchClients, serverFilters, currentPage]);

  // Application des filtres et fetch - optimisée
  const applyFiltersAndFetch = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('🎯 Application des filtres:', { searchTerm, nationality, dateRange });
    
    // Mettre à jour les filtres locaux immédiatement
    updateLocalFilters(searchTerm, nationality, dateRange);
    
    // Appliquer les filtres serveur
    const result = applyServerFilters(searchTerm, nationality, dateRange);
    
    if (result.updated && user) {
      // Réinitialiser à la page 1 lors de nouveaux filtres
      setCurrentPage(1);
      
      // Utiliser la fonction de fetch stable
      stableFetchClients({
        userId: user.id,
        filters: result.filters,
        page: 1,
        forceRefresh: false
      });
    }
  }, [updateLocalFilters, applyServerFilters, user, stableFetchClients, setCurrentPage]);

  // Force refresh - optimisée
  const forceRefreshClients = useCallback(async () => {
    console.log('🚀 FORCE REFRESH');
    if (!user) return;
    
    return stableFetchClients({
      userId: user.id,
      filters: serverFilters,
      page: currentPage,
      forceRefresh: true
    });
  }, [user, serverFilters, currentPage, stableFetchClients]);

  // Chargement des nationalités - effet séparé et optimisé
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        console.log('Chargement des nationalités uniques...');
        const { data, error } = await supabase
          .from('clients')
          .select('nationalite')
          .not('nationalite', 'is', null);
        
        if (error) throw error;
        
        const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
        console.log('Nationalités chargées:', uniqueNationalities.length);
        setNationalities(uniqueNationalities);
      } catch (error) {
        console.error('Erreur lors du chargement des nationalités:', error);
        setNationalities([]);
      }
    };

    fetchNationalities();
  }, []);

  // Chargement initial des données - une seule fois
  useEffect(() => {
    if (user && !isInitialized && !loading) {
      console.log('🚀 Chargement initial des données');
      setIsInitialized(true);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: 1,
        forceRefresh: false
      });
    }
  }, [user, isInitialized, loading, stableFetchClients, serverFilters]);

  // Gestion des changements de page - effet séparé
  useEffect(() => {
    if (isInitialized && currentPage > 1 && user && !isCurrentlyFetchingRef.current) {
      console.log('📄 Changement de page vers:', currentPage);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: currentPage,
        forceRefresh: false
      });
    }
  }, [currentPage, isInitialized, user, serverFilters, stableFetchClients]);

  const filterClients = useCallback((
    searchTerm: string,
    selectedNationality: string,
    dateRange: DateRange | undefined
  ) => {
    applyFiltersAndFetch(searchTerm, selectedNationality, dateRange);
    return clients;
  }, [clients, applyFiltersAndFetch]);

  return {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    localFilters,
    setCurrentPage: handlePageChange,
    fetchClients: fetchClientsWithFilters,
    filterClients,
    applyServerFilters: applyFiltersAndFetch,
    forceRefreshClients
  };
};
