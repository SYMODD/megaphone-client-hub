
import { useCallback } from "react";
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { useClientExport } from "@/hooks/useClientExport";
import { useNationalities } from "@/hooks/useNationalities";

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
    applyServerFilters
  } = useClientData();

  const {
    nationalities,
    loading: nationalitiesLoading
  } = useNationalities();

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

  // Fix: Pass clients array instead of totalCount to useClientExport
  const { handleExport } = useClientExport(clients);

  // Fonction de rafraîchissement forcé après suppression
  const forceRefresh = useCallback(async () => {
    console.log('🔄 FORCE REFRESH - Rafraîchissement forcé des données');
    try {
      await fetchClients();
      console.log('✅ FORCE REFRESH - Données rafraîchies avec succès');
    } catch (error) {
      console.error('❌ FORCE REFRESH - Erreur lors du rafraîchissement:', error);
    }
  }, [fetchClients]);

  // Wrapper pour la suppression avec rafraîchissement forcé
  const handleConfirmDeleteWithRefresh = useCallback(async () => {
    console.log('🗑️ SUPPRESSION - Début de la suppression avec rafraîchissement');
    await confirmDeleteClient(forceRefresh);
  }, [confirmDeleteClient, forceRefresh]);

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Changement de page vers:', page);
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleClientUpdated = useCallback(async () => {
    console.log('📝 Client mis à jour - Rafraîchissement des données');
    await forceRefresh();
  }, [forceRefresh]);

  const handleRetry = useCallback(async () => {
    console.log('🔄 Nouvelle tentative de chargement');
    await forceRefresh();
  }, [forceRefresh]);

  return {
    // Données des clients
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    
    // Nationalités
    nationalities,
    nationalitiesLoading,
    
    // Actions sur les clients
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    handleDeleteClient,
    
    // États des dialogs
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    deleteDialogOpen,
    isDeleting,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    setDeleteDialogOpen,
    
    // Actions et callbacks
    handlePageChange,
    handleClientUpdated,
    handleExport,
    handleRetry,
    filterClients,
    forceRefresh,
    
    // CORRECTION : Utilise la fonction avec rafraîchissement forcé
    confirmDeleteClient: handleConfirmDeleteWithRefresh
  };
};
