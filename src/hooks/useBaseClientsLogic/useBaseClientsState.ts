
import { useClientData } from "@/hooks/useClientData";
import { useClientActions } from "@/hooks/useClientActions";
import { useClientExport } from "@/hooks/useClientExport";
import { useNationalities } from "@/hooks/useNationalities";

export const useBaseClientsState = () => {
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
    forceRefreshClients
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

  return {
    // Client data state
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    
    // Nationalities state
    nationalities,
    nationalitiesLoading,
    
    // Client actions state
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
    setDeleteDialogOpen,
    
    // Data operations
    setCurrentPage,
    fetchClients,
    filterClients,
    applyServerFilters,
    forceRefreshClients,
    handleExport
  };
};
