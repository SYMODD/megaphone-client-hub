
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
    applyServerFilters,
    forceRefreshClients // Use the improved force refresh
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

  // Wrapper pour la suppression avec rafraîchissement forcé amélioré
  const handleConfirmDeleteWithRefresh = useCallback(async () => {
    console.log('🗑️ SUPPRESSION - Début de la suppression avec rafraîchissement amélioré');
    try {
      await confirmDeleteClient(forceRefreshClients);
      console.log('✅ SUPPRESSION - Suppression et rafraîchissement terminés');
    } catch (error) {
      console.error('❌ SUPPRESSION - Erreur lors de la suppression:', error);
    }
  }, [confirmDeleteClient, forceRefreshClients]);

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Changement de page vers:', page);
    setCurrentPage(page);
  }, [setCurrentPage]);

  const handleClientUpdated = useCallback(async () => {
    console.log('📝 Client mis à jour - Rafraîchissement des données');
    await forceRefreshClients();
  }, [forceRefreshClients]);

  const handleRetry = useCallback(async () => {
    console.log('🔄 Nouvelle tentative de chargement');
    await forceRefreshClients();
  }, [forceRefreshClients]);

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
    forceRefresh: forceRefreshClients, // Use the improved version
    
    // CORRECTION : Utilise la fonction avec rafraîchissement forcé amélioré
    confirmDeleteClient: handleConfirmDeleteWithRefresh
  };
};
