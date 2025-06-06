
import { useState, useCallback, useRef } from "react";
import { DateRange } from "react-day-picker";
import { ClientFilters } from "./types";

export const useClientFilters = () => {
  const [serverFilters, setServerFilters] = useState<ClientFilters>({
    searchTerm: "",
    nationality: "",
    dateFrom: null,
    dateTo: null
  });

  const [localFilters, setLocalFilters] = useState<ClientFilters>({
    searchTerm: "",
    nationality: "",
    dateFrom: null,
    dateTo: null
  });

  // Utiliser une ref pour éviter les comparaisons infinies
  const lastAppliedFiltersRef = useRef<ClientFilters>(serverFilters);

  const updateLocalFilters = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    const newLocalFilters: ClientFilters = {
      searchTerm: searchTerm.trim(),
      nationality,
      dateFrom: dateRange?.from || null,
      dateTo: dateRange?.to || null
    };
    
    setLocalFilters(newLocalFilters);
    return newLocalFilters;
  }, []);

  // Helper pour comparer les filtres de manière plus robuste
  const filtersAreEqual = useCallback((filters1: ClientFilters, filters2: ClientFilters): boolean => {
    return (
      filters1.searchTerm === filters2.searchTerm &&
      filters1.nationality === filters2.nationality &&
      (filters1.dateFrom?.getTime() || null) === (filters2.dateFrom?.getTime() || null) &&
      (filters1.dateTo?.getTime() || null) === (filters2.dateTo?.getTime() || null)
    );
  }, []);

  const applyServerFilters = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    const newFilters: ClientFilters = {
      searchTerm: searchTerm.trim(),
      nationality,
      dateFrom: dateRange?.from || null,
      dateTo: dateRange?.to || null
    };

    console.log('🔍 Tentative d\'application des filtres serveur:', newFilters);

    // Comparer avec les derniers filtres appliqués via la ref
    if (!filtersAreEqual(newFilters, lastAppliedFiltersRef.current)) {
      console.log('✅ Filtres différents détectés, mise à jour en cours...');
      lastAppliedFiltersRef.current = newFilters;
      setServerFilters(newFilters);
      setLocalFilters(newFilters);
      return { updated: true, filters: newFilters };
    } else {
      console.log('⏭️ Filtres identiques, pas de mise à jour nécessaire');
      return { updated: false, filters: serverFilters };
    }
  }, [filtersAreEqual, serverFilters]);

  return {
    serverFilters,
    localFilters,
    setServerFilters,
    updateLocalFilters,
    applyServerFilters
  };
};
