
import { useState, useEffect } from "react";
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

  // Debounce la recherche pour éviter trop d'appels API
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Déclencher le filtrage seulement quand les valeurs debounced changent
  useEffect(() => {
    console.log('🔍 Filtres débounced mis à jour:', { 
      searchTerm: debouncedSearchTerm, 
      selectedNationality, 
      dateRange 
    });
    filterClients(debouncedSearchTerm, selectedNationality, dateRange);
  }, [debouncedSearchTerm, selectedNationality, dateRange, filterClients]);

  // Handler pour le rafraîchissement manuel
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Rafraîchissement manuel déclenché par l\'utilisateur');
    
    // Déclenche un nouveau filtrage avec les paramètres actuels
    filterClients(debouncedSearchTerm, selectedNationality, dateRange);
    
    // Simule un délai pour l'animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleNationalityChange = (nationality: string) => {
    console.log('🌍 Changement de nationalité:', nationality);
    setSelectedNationality(nationality);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    console.log('📅 Changement de plage de dates:', range);
    setDateRange(range);
  };

  const handleSearchChange = (term: string) => {
    console.log('🔍 Changement de terme de recherche:', term);
    setSearchTerm(term);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <ClientStatistics 
        totalCount={totalCount}
        clients={clients}
        nationalities={nationalities}
      />

      {/* Header avec bouton de rafraîchissement */}
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

      {/* Filtres et recherche optimisés */}
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

      {/* Indicateur de chargement pendant le rafraîchissement */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Actualisation des données en cours...</span>
          </div>
        </div>
      )}

      {/* Liste des clients */}
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
