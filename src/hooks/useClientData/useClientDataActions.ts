
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

interface ClientDataActionsProps {
  stableFetchClients: (params: any) => Promise<any>;
  serverFilters: any;
  currentPage: number;
  updateLocalFilters: (searchTerm: string, nationality: string, dateRange: DateRange | undefined) => any;
  applyServerFilters: (searchTerm: string, nationality: string, dateRange: DateRange | undefined) => any;
  setCurrentPage: (page: number) => void;
  clients: any[];
}

export const useClientDataActions = ({
  stableFetchClients,
  serverFilters,
  currentPage,
  updateLocalFilters,
  applyServerFilters,
  setCurrentPage,
  clients
}: ClientDataActionsProps) => {
  const { user } = useAuth();

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

  const filterClients = useCallback((
    searchTerm: string,
    selectedNationality: string,
    dateRange: DateRange | undefined
  ) => {
    applyFiltersAndFetch(searchTerm, selectedNationality, dateRange);
    return clients;
  }, [clients, applyFiltersAndFetch]);

  return {
    fetchClientsWithFilters,
    applyFiltersAndFetch,
    forceRefreshClients,
    filterClients
  };
};
