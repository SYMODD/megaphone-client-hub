
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
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen
  } = useClientActions();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClientUpdated = () => {
    fetchClients();
  };

  // Fonction optimisée pour l'export avec gestion de gros volumes
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (totalCount === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucun client dans la base de données.",
        variant: "destructive",
        style: {
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          color: "#0f172a",
          zIndex: 9999
        }
      });
      return;
    }

    try {
      // Pour de gros volumes, on exporte par chunks
      const EXPORT_CHUNK_SIZE = 1000;
      let allClients: Client[] = [];
      let currentChunk = 0;
      
      toast({
        title: "Export en cours...",
        description: `Préparation de l'export de ${totalCount} clients.`,
        style: {
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          color: "#0f172a",
          zIndex: 9999
        }
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
        
        // Toast de progression pour gros volumes
        if (totalCount > 5000) {
          toast({
            title: "Export en cours...",
            description: `${allClients.length}/${totalCount} clients chargés.`,
            style: {
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              zIndex: 9999
            }
          });
        }
      }

      const filename = `clients_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(allClients, filename);
        toast({
          title: "Export CSV réussi",
          description: `${allClients.length} client(s) exporté(s) en CSV.`,
          style: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            zIndex: 9999
          }
        });
      } else {
        exportToPDF(allClients, filename);
        toast({
          title: "Export PDF réussi", 
          description: `${allClients.length} client(s) exporté(s) en PDF.`,
          style: {
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            zIndex: 9999
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
        style: {
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          color: "#0f172a",
          zIndex: 9999
        }
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
    handlePageChange,
    handleClientUpdated,
    handleExport,
    handleRetry,
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    filterClients
  };
};
