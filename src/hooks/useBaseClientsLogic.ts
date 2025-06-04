
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { useNationalities } from "@/hooks/useNationalities";
import { useClientExport } from "@/hooks/useClientExport";
import { useClientUpdate } from "@/hooks/useClientUpdate";
import { useClientDelete } from "@/hooks/useClientDelete";

export const useBaseClientsLogic = () => {
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

  const { handleExport } = useClientExport(totalCount);

  const { handleClientUpdated } = useClientUpdate({
    fetchClients,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen
  });

  const { handleConfirmDeleteClient } = useClientDelete({
    selectedClient,
    setDeleteDialogOpen,
    fetchClients,
    currentPage,
    setCurrentPage,
    clients
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    fetchClients();
  };

  // Fonction pour forcer le rafraîchissement des données avec vérification complète
  const forceRefresh = async () => {
    console.log("🔄 Forçage du rafraîchissement des données clients avec vérification images...");
    
    try {
      await fetchClients();
      console.log("✅ Rafraîchissement terminé - Vérification des images de code-barres...");
      
      // Log pour vérifier la présence des URLs d'images de code-barres
      const clientsWithBarcodeImages = clients.filter(client => client.code_barre_image_url);
      console.log(`📊 Clients avec images de code-barres: ${clientsWithBarcodeImages.length}/${clients.length}`);
      
      clientsWithBarcodeImages.forEach(client => {
        console.log(`✅ Client ${client.prenom} ${client.nom} - Image code-barres: ${client.code_barre_image_url}`);
      });
      
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement:", error);
    }
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
    filterClients,
    forceRefresh
  };
};
