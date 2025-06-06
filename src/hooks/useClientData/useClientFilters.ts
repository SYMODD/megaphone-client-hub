
import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { ClientFilters } from "./types";

export const useClientFilters = () => {
  const [serverFilters, setServerFilters] = useState<ClientFilters>({
    searchTerm: "",
    nationality: "",
    dateFrom: null,
    dateTo: null
  });

  const applyServerFilters = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('🔍 Applying server-side filters:', { searchTerm, nationality, dateRange });
    
    const newFilters: ClientFilters = {
      searchTerm: searchTerm.trim(),
      nationality,
      dateFrom: dateRange?.from || null,
      dateTo: dateRange?.to || null
    };

    // Ne mettre à jour que si les filtres ont vraiment changé
    const hasChanged = 
      newFilters.searchTerm !== serverFilters.searchTerm ||
      newFilters.nationality !== serverFilters.nationality ||
      newFilters.dateFrom?.getTime() !== serverFilters.dateFrom?.getTime() ||
      newFilters.dateTo?.getTime() !== serverFilters.dateTo?.getTime();

    if (hasChanged) {
      console.log('✅ Filtres modifiés, mise à jour en cours...');
      setServerFilters(newFilters);
    } else {
      console.log('⏭️ Filtres identiques, pas de mise à jour');
    }
    
    return newFilters;
  }, [serverFilters]);

  return {
    serverFilters,
    setServerFilters,
    applyServerFilters
  };
};
