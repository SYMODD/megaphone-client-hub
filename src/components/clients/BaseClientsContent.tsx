
import { useState, useCallback, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useDebounce } from "@/hooks/useDebounce";

interface BaseClientsContentProps {
  clients: Client[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  nationalities: string[];
  nationalitiesLoading: boolean;
  onPageChange: (page: number) => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  filterClients: (searchTerm: string, selectedNationality: string, dateRange: DateRange | undefined) => Client[];
}

export const BaseClientsContent = ({
  clients,
  totalCount,
  currentPage,
  totalPages,
  nationalities,
  nationalitiesLoading,
  onPageChange,
  onViewClient,
  onEditClient,
  onGenerateDocument,
  onDeleteClient,
  onExport,
  filterClients
}: BaseClientsContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use a longer debounce delay to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 1500);

  // Memoize filter application to prevent unnecessary calls
  const applyFilters = useCallback((
    search: string,
    nationality: string,
    range: DateRange | undefined
  ) => {
    console.log('🎯 Applying filters:', { search, nationality, range });
    filterClients(search, nationality, range);
  }, [filterClients]);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only apply when debounce is complete
    
    console.log('🔍 Debounced search term changed:', debouncedSearchTerm);
    applyFilters(debouncedSearchTerm, selectedNationality, dateRange);
  }, [debouncedSearchTerm, selectedNationality, dateRange, applyFilters]);

  // Immediate handlers for non-search filters
  const handleNationalityChange = useCallback((nationality: string) => {
    console.log('🌍 Nationality changed:', nationality);
    setSelectedNationality(nationality);
    applyFilters(debouncedSearchTerm, nationality, dateRange);
  }, [debouncedSearchTerm, dateRange, applyFilters]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    console.log('📅 Date range changed:', range);
    setDateRange(range);
    applyFilters(debouncedSearchTerm, selectedNationality, range);
  }, [debouncedSearchTerm, selectedNationality, applyFilters]);

  const handleSearchChange = useCallback((term: string) => {
    console.log('🔍 Search term input:', term);
    setSearchTerm(term);
    // The debounced effect will handle the actual filtering
  }, []);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log('🔄 Manual refresh triggered');
    
    // Re-apply current filters
    applyFilters(debouncedSearchTerm, selectedNationality, dateRange);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [debouncedSearchTerm, selectedNationality, dateRange, applyFilters]);

  // Memoize the statistics to prevent unnecessary re-calculations
  const memoizedStatistics = useMemo(() => (
    <ClientStatistics 
      totalCount={totalCount}
      clients={clients}
      nationalities={nationalities}
    />
  ), [totalCount, clients, nationalities]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {memoizedStatistics}

      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Liste des clients ({totalCount} total)
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Filters */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        selectedNationality={selectedNationality}
        setSelectedNationality={handleNationalityChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        nationalities={nationalitiesLoading ? [] : nationalities}
        onExport={onExport}
      />

      {/* Loading indicator */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Actualisation des données en cours...</span>
          </div>
        </div>
      )}

      {/* Client table */}
      <ClientTable
        clients={clients}
        onViewClient={onViewClient}
        onEditClient={onEditClient}
        onGenerateDocument={onGenerateDocument}
        onDeleteClient={onDeleteClient}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages} ({totalCount} clients au total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
