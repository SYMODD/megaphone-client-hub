
import { useBaseClientsState } from "./useBaseClientsState";
import { useBaseClientsActions } from "./useBaseClientsActions";
import { useBaseClientsHandlers } from "./useBaseClientsHandlers";

export const useBaseClientsLogic = () => {
  const {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    nationalitiesLoading,
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
    setDeleteDialogOpen,
    setCurrentPage,
    filterClients,
    forceRefreshClients,
    handleExport,
    confirmDeleteClient
  } = useBaseClientsState();

  const {
    handleConfirmDeleteWithRefresh,
    handleClientUpdated,
    handleRetry
  } = useBaseClientsActions({
    forceRefreshClients,
    confirmDeleteClient
  });

  const {
    handlePageChange
  } = useBaseClientsHandlers({
    setCurrentPage
  });

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
