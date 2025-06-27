
import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { useClientExport } from "@/hooks/useClientExport";
import { useNationalities } from "@/hooks/useNationalities";

export const useBaseClientsLogic = () => {
  const location = useLocation();
  
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

  // Gérer les états de navigation depuis le dashboard
  useEffect(() => {
    const state = location.state as any;
    if (state && clients.length > 0) {
      // Si on vient du dashboard avec un ID de client à visualiser
      if (state.viewClientId && state.action === 'view') {
        const clientToView = clients.find(c => c.id === state.viewClientId.toString());
        if (clientToView) {
          console.log('🔍 Ouverture automatique du dialog de visualisation pour:', clientToView);
          handleViewClient(clientToView);
        }
      }
      
      // Si on vient du dashboard avec un ID de client à éditer
      if (state.editClientId && state.action === 'edit') {
        const clientToEdit = clients.find(c => c.id === state.editClientId.toString());
        if (clientToEdit) {
          console.log('✏️ Ouverture automatique du dialog d\'édition pour:', clientToEdit);
          handleEditClient(clientToEdit);
        }
      }
      
      // Nettoyer l'état de navigation pour éviter les réouvertures
      window.history.replaceState({}, document.title);
    }
  }, [location.state, clients, handleViewClient, handleEditClient]);

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
