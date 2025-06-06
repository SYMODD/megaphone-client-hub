
import { useState, useCallback, useMemo, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientPagination } from "@/components/clients/ClientPagination";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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

  // Utiliser un délai de debounce plus long pour réduire les appels API
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Mémoriser l'application des filtres pour éviter les appels inutiles
  const applyFilters = useCallback((
    search: string,
    nationality: string,
    range: DateRange | undefined
  ) => {
    console.log('🎯 Application des filtres:', { search, nationality, range });
    filterClients(search, nationality, range);
  }, [filterClients]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    // Seulement appliquer quand le debounce est terminé
    if (debouncedSearchTerm !== searchTerm) return;
    
    console.log('🔍 Terme de recherche avec debounce changé:', debouncedSearchTerm);
    applyFilters(debouncedSearchTerm, selectedNationality, dateRange);
  }, [debouncedSearchTerm, selectedNationality, dateRange, applyFilters, searchTerm]);

  // Gestionnaires immédiats pour les filtres non-recherche
  const handleNationalityChange = useCallback((nationality: string) => {
    console.log('🌍 Nationalité changée:', nationality);
    setSelectedNationality(nationality);
    applyFilters(debouncedSearchTerm, nationality, dateRange);
  }, [debouncedSearchTerm, dateRange, applyFilters]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    console.log('📅 Plage de dates changée:', range);
    setDateRange(range);
    applyFilters(debouncedSearchTerm, selectedNationality, range);
  }, [debouncedSearchTerm, selectedNationality, applyFilters]);

  const handleSearchChange = useCallback((term: string) => {
    console.log('🔍 Saisie de recherche:', term);
    setSearchTerm(term);
    // L'effet avec debounce s'occupera de l'application
  }, []);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log('🔄 Actualisation manuelle déclenchée');
    
    // Ré-appliquer les filtres actuels
    applyFilters(debouncedSearchTerm, selectedNationality, dateRange);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [debouncedSearchTerm, selectedNationality, dateRange, applyFilters]);

  // Mémoriser les statistiques pour éviter les re-calculs inutiles
  const memoizedStatistics = useMemo(() => (
    <ClientStatistics 
      totalCount={totalCount}
      clients={clients}
      nationalities={nationalities}
    />
  ), [totalCount, clients, nationalities]);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {memoizedStatistics}

      {/* En-tête avec bouton d'actualisation */}
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

      {/* Filtres */}
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

      {/* Indicateur d'actualisation */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Actualisation des données en cours...</span>
          </div>
        </div>
      )}

      {/* Tableau des clients */}
      <ClientTable
        clients={clients}
        onViewClient={onViewClient}
        onEditClient={onEditClient}
        onGenerateDocument={onGenerateDocument}
        onDeleteClient={onDeleteClient}
      />

      {/* Pagination améliorée */}
      <ClientPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </div>
  );
};
