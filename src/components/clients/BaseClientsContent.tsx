
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Utilise le filtrage optimisé côté serveur
  const filteredClients = filterClients(searchTerm, selectedNationality, dateRange);

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <ClientStatistics 
        totalCount={totalCount}
        clients={clients}
        nationalities={nationalities}
      />

      {/* Filtres et recherche optimisés */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedNationality={selectedNationality}
        setSelectedNationality={setSelectedNationality}
        dateRange={dateRange}
        setDateRange={setDateRange}
        nationalities={nationalitiesLoading ? [] : nationalities}
        onExport={onExport}
      />

      {/* Liste des clients avec pagination côté serveur */}
      <ClientTable
        clients={filteredClients}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onViewClient={onViewClient}
        onEditClient={onEditClient}
        onGenerateDocument={onGenerateDocument}
        onDeleteClient={onDeleteClient}
      />
    </div>
  );
};
