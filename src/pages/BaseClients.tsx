import { useState } from "react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientViewDialog } from "@/components/clients/ClientViewDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { ClientDocumentDialog } from "@/components/clients/ClientDocumentDialog";
import { Button } from "@/components/ui/button";

const BaseClients = () => {
  const { toast } = useToast();
  const {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    setCurrentPage,
    fetchClients,
    filterClients
  } = useClientData();

  const {
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen
  } = useClientActions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredClients = filterClients(searchTerm, selectedNationality, dateRange);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClientUpdated = () => {
    fetchClients();
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (filteredClients.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucun client correspondant aux critères sélectionnés.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = `clients${dateRange?.from ? `_${dateRange.from.toISOString().split('T')[0]}` : ''}${dateRange?.to ? `_au_${dateRange.to.toISOString().split('T')[0]}` : ''}`;
      
      if (format === 'csv') {
        exportToCSV(filteredClients, filename);
        toast({
          title: "Export CSV réussi",
          description: `${filteredClients.length} client(s) exporté(s) en CSV.`,
        });
      } else {
        exportToPDF(filteredClients, filename);
        toast({
          title: "Export PDF réussi", 
          description: `${filteredClients.length} client(s) exporté(s) en PDF.`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={fetchClients} 
                className="mt-4"
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Base Clients</h1>
            <p className="text-slate-600">Gérez et consultez tous vos clients enregistrés</p>
          </div>

          {/* Statistiques rapides */}
          <ClientStatistics 
            totalCount={totalCount}
            clients={clients}
            nationalities={nationalities}
          />

          {/* Filtres et recherche */}
          <ClientFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedNationality={selectedNationality}
            setSelectedNationality={setSelectedNationality}
            dateRange={dateRange}
            setDateRange={setDateRange}
            nationalities={nationalities}
            onExport={handleExport}
          />

          {/* Liste des clients */}
          <ClientTable
            clients={filteredClients}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onViewClient={handleViewClient}
            onEditClient={handleEditClient}
            onGenerateDocument={handleGenerateDocument}
          />
        </div>
      </main>

      {/* Dialogues */}
      <ClientViewDialog
        client={selectedClient}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <ClientEditDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={handleClientUpdated}
      />
      
      <ClientDocumentDialog
        client={selectedClient}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
      />
    </div>
  );
};

export default BaseClients;
