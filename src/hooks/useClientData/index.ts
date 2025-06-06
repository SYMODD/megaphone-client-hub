
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
  
  // Use refs to avoid dependency issues
  const lastFetchParamsRef = useRef<string>('');

  // Stable fetch function that doesn't change on every render
  const stableFetchClients = useCallback(async (params: {
    userId: string;
    filters: any;
    page: number;
    forceRefresh?: boolean;
  }) => {
    const { userId, filters, page, forceRefresh = false } = params;
    
    // Create a stable key for comparison
    const fetchKey = JSON.stringify({ filters, page, forceRefresh });
    
    // Avoid redundant fetches
    if (!forceRefresh && fetchKey === lastFetchParamsRef.current) {
      console.log('🔄 Fetch skipped - same parameters');
      return;
    }
    
    lastFetchParamsRef.current = fetchKey;
    
    console.log('🔄 Fetching clients with params:', { page, forceRefresh, filters });
    
    const result = await fetchClients(userId, filters, page, forceRefresh);
    
    if (result?.shouldGoToPreviousPage && result.newPage) {
      console.log('📄 Auto changement vers la page', result.newPage);
      setCurrentPage(result.newPage);
      // Re-fetch with new page
      await fetchClients(userId, filters, result.newPage, true);
    }
    
    return result;
  }, [fetchClients, setCurrentPage]);

  // Simplified fetch function for external use
  const fetchClientsWithFilters = useCallback(async (options?: {
    searchTerm?: string;
    nationality?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    page?: number;
    forceRefresh?: boolean;
  }) => {
    if (!user) {
      console.log('❌ No user - cannot fetch');
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

  // Apply filters and fetch - simplified
  const applyFiltersAndFetch = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('🎯 Applying filters and fetch:', { searchTerm, nationality, dateRange });
    
    // Update local filters immediately
    updateLocalFilters(searchTerm, nationality, dateRange);
    
    // Apply server filters
    const result = applyServerFilters(searchTerm, nationality, dateRange);
    
    if (result.updated && user) {
      // Use the stable fetch function
      stableFetchClients({
        userId: user.id,
        filters: result.filters,
        page: 1,
        forceRefresh: false
      });
    }
  }, [updateLocalFilters, applyServerFilters, user, stableFetchClients]);

  // Force refresh function
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

  // Fetch nationalities - separate effect
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

  // Initial data load - only once
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🚀 Initial data load');
      setIsInitialized(true);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: 1,
        forceRefresh: false
      });
    }
  }, [user, isInitialized, stableFetchClients, serverFilters]);

  // Handle page changes - separate effect
  useEffect(() => {
    if (isInitialized && currentPage > 1 && user) {
      console.log('📄 Page change to:', currentPage);
      
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
