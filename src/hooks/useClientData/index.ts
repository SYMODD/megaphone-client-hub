
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useClientFilters } from "./useClientFilters";
import { useClientFetcher } from "./useClientFetcher";
import { usePagination } from "./usePagination";

export const useClientData = () => {
  const { user } = useAuth();
  const { serverFilters, applyServerFilters } = useClientFilters();
  const {
    clients,
    loading,
    error,
    totalCount,
    fetchClients
  } = useClientFetcher();
  const { currentPage, totalPages, handlePageChange, setCurrentPage } = usePagination(totalCount);
  const [nationalities, setNationalities] = useState<string[]>([]);

  // Fonction optimisée avec filtrage côté serveur
  const fetchClientsWithFilters = useCallback(async (filters?: {
    searchTerm?: string;
    nationality?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    page?: number;
    forceRefresh?: boolean;
  }) => {
    if (!user) return;

    const currentFilters = filters || serverFilters;
    const page = filters?.page || currentPage;
    const forceRefresh = filters?.forceRefresh || false;
    
    console.log('🔄 fetchClientsWithFilters called with:', { 
      page, 
      forceRefresh, 
      totalCurrentClients: clients.length 
    });

    const result = await fetchClients(user.id, {
      searchTerm: currentFilters.searchTerm || "",
      nationality: currentFilters.nationality || "",
      dateFrom: currentFilters.dateFrom,
      dateTo: currentFilters.dateTo
    }, page, forceRefresh);

    // Si on doit revenir à la page précédente (page vide après suppression)
    if (result && result.shouldGoToPreviousPage && result.newPage) {
      console.log('📄 Changement automatique vers la page', result.newPage);
      setCurrentPage(result.newPage);
      // Re-fetch avec la nouvelle page
      await fetchClients(user.id, {
        searchTerm: currentFilters.searchTerm || "",
        nationality: currentFilters.nationality || "",
        dateFrom: currentFilters.dateFrom,
        dateTo: currentFilters.dateTo
      }, result.newPage, true);
    }
  }, [user, serverFilters, currentPage, fetchClients, clients.length, setCurrentPage]);

  const applyFiltersAndFetch = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('Applying server-side filters:', { searchTerm, nationality, dateRange });
    
    const newFilters = applyServerFilters(searchTerm, nationality, dateRange);
    
    fetchClientsWithFilters({ ...newFilters, page: 1 });
  }, [applyServerFilters, fetchClientsWithFilters]);

  // Fonction de rafraîchissement forcé améliorée
  const forceRefreshClients = useCallback(async () => {
    console.log('🚀 FORCE REFRESH - Démarrage du rafraîchissement forcé');
    if (!user) {
      console.log('❌ FORCE REFRESH - Pas d\'utilisateur connecté');
      return;
    }
    
    try {
      await fetchClientsWithFilters({ 
        page: currentPage, 
        forceRefresh: true 
      });
      console.log('✅ FORCE REFRESH - Rafraîchissement terminé avec succès');
    } catch (error) {
      console.error('❌ FORCE REFRESH - Erreur:', error);
    }
  }, [user, currentPage, fetchClientsWithFilters]);

  // Fetch nationalities separately
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        console.log('Fetching unique nationalities...');
        const { data, error } = await supabase
          .from('clients')
          .select('nationalite')
          .not('nationalite', 'is', null);
        
        if (error) throw error;
        
        const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
        console.log('Unique nationalities loaded:', uniqueNationalities.length);
        setNationalities(uniqueNationalities);
      } catch (error) {
        console.error('Error fetching nationalities:', error);
        setNationalities([]);
      }
    };

    fetchNationalities();
  }, []);

  useEffect(() => {
    if (user) {
      fetchClientsWithFilters();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentPage > 1) {
      fetchClientsWithFilters({ page: currentPage });
    }
  }, [currentPage, user]);

  const filterClients = useCallback((
    searchTerm: string,
    selectedNationality: string,
    dateRange: DateRange | undefined
  ) => {
    if (
      searchTerm !== serverFilters.searchTerm ||
      selectedNationality !== serverFilters.nationality ||
      dateRange?.from?.getTime() !== serverFilters.dateFrom?.getTime() ||
      dateRange?.to?.getTime() !== serverFilters.dateTo?.getTime()
    ) {
      applyFiltersAndFetch(searchTerm, selectedNationality, dateRange);
      return clients;
    }
    
    return clients;
  }, [clients, serverFilters, applyFiltersAndFetch]);

  return {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    setCurrentPage: handlePageChange,
    fetchClients: fetchClientsWithFilters,
    filterClients,
    applyServerFilters: applyFiltersAndFetch,
    forceRefreshClients // Export the force refresh function
  };
};
