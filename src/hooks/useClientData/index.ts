
import { useAuth } from "@/contexts/AuthContext";
import { useClientFilters } from "./useClientFilters";
import { useClientFetcher } from "./useClientFetcher";
import { usePagination } from "./usePagination";
import { useClientDataState } from "./useClientDataState";
import { useStableFetch } from "./useStableFetch";
import { useClientDataEffects } from "./useClientDataEffects";
import { useClientDataActions } from "./useClientDataActions";

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
  
  const {
    nationalities,
    isInitialized,
    setIsInitialized,
    setNationalities,
    lastFetchParamsRef,
    isCurrentlyFetchingRef
  } = useClientDataState();

  const { stableFetchClients } = useStableFetch({
    fetchClients,
    setCurrentPage,
    lastFetchParamsRef,
    isCurrentlyFetchingRef
  });

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
