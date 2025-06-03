
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const { currentPage, totalPages, handlePageChange } = usePagination(totalCount);

  // Fonction optimisée avec filtrage côté serveur
  const fetchClientsWithFilters = useCallback(async (filters?: {
    searchTerm?: string;
    nationality?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    page?: number;
  }) => {
    if (!user) return;

    const currentFilters = filters || serverFilters;
    const page = filters?.page || currentPage;
    
    await fetchClients(user.id, {
      searchTerm: currentFilters.searchTerm || "",
      nationality: currentFilters.nationality || "",
      dateFrom: currentFilters.dateFrom,
      dateTo: currentFilters.dateTo
    }, page);
  }, [user, serverFilters, currentPage, fetchClients]);

  const applyFiltersAndFetch = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('Applying server-side filters:', { searchTerm, nationality, dateRange });
    
    const newFilters = applyServerFilters(searchTerm, nationality, dateRange);
    
    fetchClientsWithFilters({ ...newFilters, page: 1 });
  }, [applyServerFilters, fetchClientsWithFilters]);

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

  const nationalities = useMemo(async () => {
    try {
      console.log('Fetching unique nationalities...');
      const { data, error } = await supabase
        .from('clients')
        .select('nationalite')
        .not('nationalite', 'is', null);
      
      if (error) throw error;
      
      const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
      console.log('Unique nationalities loaded:', uniqueNationalities.length);
      return uniqueNationalities;
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      return [];
    }
  }, []);

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
    applyServerFilters: applyFiltersAndFetch
  };
};
