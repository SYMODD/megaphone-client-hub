import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { useNationalities } from "@/hooks/useNationalities";
import { Client } from "@/hooks/useClientData/types";
import { supabase } from "@/integrations/supabase/client";

export const useBaseClientsLogic = () => {
  const { toast } = useToast();
  const {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    setCurrentPage,
    fetchClients,
    filterClients,
  } = useClientData();

  const { nationalities, loading: nationalitiesLoading } = useNationalities();

  const {
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    handleDeleteClient,
    confirmDeleteClient,
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    deleteDialogOpen,
    isDeleting,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    setDeleteDialogOpen
  } = useClientActions();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClientUpdated = () => {
    console.log("Client updated, reloading data...");
    fetchClients();
  };

  // CORRECTION: Fonction de suppression améliorée avec rechargement forcé
  const handleConfirmDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      console.log('Début suppression client:', selectedClient.id);
      
      // Appeler la fonction de suppression
      await confirmDeleteClient();
      
      console.log('Suppression réussie, rechargement des données...');
      
      // Forcer le rechargement immédiat des données
      await fetchClients();
      
      console.log('Données rechargées après suppression');
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le client. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Fonction optimisée pour l'export avec gestion de gros volumes
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (totalCount === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucun client dans la base de données.",
        variant: "destructive",
      });
      return;
    }

    try {
      const EXPORT_CHUNK_SIZE = 1000;
      let allClients: Client[] = [];
      let currentChunk = 0;
      
      toast({
        title: "Export en cours...",
        description: `Préparation de l'export de ${totalCount} clients.`,
      });

      while (currentChunk * EXPORT_CHUNK_SIZE < totalCount) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })
          .range(
            currentChunk * EXPORT_CHUNK_SIZE, 
            (currentChunk + 1) * EXPORT_CHUNK_SIZE - 1
          );

        if (error) throw error;
        
        allClients.push(...(data || []));
        currentChunk++;
        
        if (totalCount > 5000) {
          toast({
            title: "Export en cours...",
            description: `${allClients.length}/${totalCount} clients chargés.`,
          });
        }
      }

      const filename = `clients_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(allClients, filename);
        toast({
          title: "Export CSV réussi",
          description: `${allClients.length} client(s) exporté(s) en CSV.`,
        });
      } else {
        exportToPDF(allClients, filename);
        toast({
          title: "Export PDF réussi", 
          description: `${allClients.length} client(s) exporté(s) en PDF.`,
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

  const handleRetry = () => {
    fetchClients();
  };

  return {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    nationalitiesLoading,
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    deleteDialogOpen,
    isDeleting,
    handlePageChange,
    handleClientUpdated,
    handleExport,
    handleRetry,
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    handleDeleteClient,
    confirmDeleteClient: handleConfirmDeleteClient,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    setDeleteDialogOpen,
    filterClients
  };
};
