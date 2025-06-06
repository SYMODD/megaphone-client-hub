
import { useAuth } from "@/contexts/AuthContext";
import { useClientFilters } from "./useClientFilters";
import { useClientFetcher } from "./useClientFetcher";
import { usePagination } from "./usePagination";
import { useClientDataState } from "./useClientDataState";
import { useStableFetch } from "./useStableFetch";
import { useClientDataEffects } from "./useClientDataEffects";
import { useClientDataActions } from "./useClientDataActions";

export const useClientData = () => {
  console.log('🔍 useClientData - Début du hook');
  
  const { user } = useAuth();
  console.log('🔍 useClientData - User récupéré:', !!user);
  
  const { serverFilters, localFilters, updateLocalFilters, applyServerFilters } = useClientFilters();
  console.log('🔍 useClientData - Filtres initialisés');
  
  const {
    clients,
    loading,
    error,
    totalCount,
    fetchClients
  } = useClientFetcher();
  console.log('🔍 useClientData - Fetcher initialisé:', { loading, error, clientsCount: clients?.length, totalCount });
  
  const { currentPage, totalPages, handlePageChange, setCurrentPage } = usePagination(totalCount);
  console.log('🔍 useClientData - Pagination initialisée:', { currentPage, totalPages });
  
  const {
    nationalities,
    isInitialized,
    setIsInitialized,
    setNationalities,
    lastFetchParamsRef,
    isCurrentlyFetchingRef
  } = useClientDataState();
  console.log('🔍 useClientData - État initialisé:', { 
    nationalitiesCount: nationalities?.length, 
    isInitialized,
    isCurrentlyFetching: isCurrentlyFetchingRef.current 
  });

  const { stableFetchClients } = useStableFetch({
    fetchClients,
    setCurrentPage,
    lastFetchParamsRef,
    isCurrentlyFetchingRef
  });
  console.log('🔍 useClientData - StableFetch initialisé');

  useClientDataEffects({
    user,
    isInitialized,
    loading,
    setIsInitialized,
    setNationalities,
    stableFetchClients,
    serverFilters,
    currentPage,
    isCurrentlyFetchingRef
  });
  console.log('🔍 useClientData - Effets initialisés');

  const {
    fetchClientsWithFilters,
    applyFiltersAndFetch,
    forceRefreshClients,
    filterClients
  } = useClientDataActions({
    stableFetchClients,
    serverFilters,
    currentPage,
    updateLocalFilters,
    applyServerFilters,
    setCurrentPage,
    clients
  });
  console.log('🔍 useClientData - Actions initialisées');

  console.log('🔍 useClientData - Hook terminé, état final:', { 
    loading, 
    error, 
    clientsCount: clients?.length, 
    totalCount,
    isInitialized 
  });

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
