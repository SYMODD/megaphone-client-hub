
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
    console.log('Applying server-side filters:', { searchTerm, nationality, dateRange });
    
    const newFilters: ClientFilters = {
      searchTerm,
      nationality,
      dateFrom: dateRange?.from || null,
      dateTo: dateRange?.to || null
    };

    setServerFilters(newFilters);
    
    return newFilters;
  }, []);

  return {
    serverFilters,
    setServerFilters,
    applyServerFilters
  };
};
