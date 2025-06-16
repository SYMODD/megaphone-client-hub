
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

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
  // États des filtres appliqués (synchronisés avec les données affichées)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedNationality, setAppliedNationality] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();
  
  // État du chargement des filtres
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handler pour appliquer les filtres (contrôlé par le bouton)
  const handleApplyFilters = async (searchTerm: string, selectedNationality: string, dateRange: DateRange | undefined) => {
    setIsApplyingFilters(true);
    console.log('🔍 Application des filtres depuis BaseClientsContent:', { 
      searchTerm, 
      selectedNationality, 
      dateRange 
    });
    
    try {
      // Mettre à jour les filtres appliqués
      setAppliedSearchTerm(searchTerm);
      setAppliedNationality(selectedNationality);
      setAppliedDateRange(dateRange);
      
      // Déclencher le filtrage avec les nouveaux critères
      filterClients(searchTerm, selectedNationality, dateRange);
    } finally {
      // Délai pour l'animation
      setTimeout(() => {
        setIsApplyingFilters(false);
      }, 500);
    }
  };

  // Handler pour le rafraîchissement manuel
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Rafraîchissement manuel avec filtres actuels');
    
    // Re-appliquer les filtres actuels
    filterClients(appliedSearchTerm, appliedNationality, appliedDateRange);
    
    // Simule un délai pour l'animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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
          disabled={isRefreshing || isApplyingFilters}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Filtres avec contrôle d'application */}
      <ClientFilters
        searchTerm={appliedSearchTerm}
        setSearchTerm={setAppliedSearchTerm}
        selectedNationality={appliedNationality}
        setSelectedNationality={setAppliedNationality}
        dateRange={appliedDateRange}
        setDateRange={setAppliedDateRange}
        nationalities={nationalitiesLoading ? [] : nationalities}
        onExport={onExport}
        onApplyFilters={handleApplyFilters}
        isApplyingFilters={isApplyingFilters}
      />

      {/* Indicateur de chargement pendant l'application des filtres */}
      {isApplyingFilters && (
        <div className="flex items-center justify-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Application des filtres en cours...</span>
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
