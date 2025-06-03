
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { useBaseClientsLogic } from "@/hooks/useBaseClientsLogic";
import { BaseClientsHeader } from "@/components/clients/BaseClientsHeader";
import { BaseClientsContent } from "@/components/clients/BaseClientsContent";
import { BaseClientsDialogs } from "@/components/clients/BaseClientsDialogs";

const BaseClients = () => {
  const {
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
    confirmDeleteClient,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    setDeleteDialogOpen,
    filterClients
  } = useBaseClientsLogic();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement optimisé des clients...</p>
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
                onClick={handleRetry} 
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
          <BaseClientsHeader totalCount={totalCount} />
          
          <BaseClientsContent
            clients={clients}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            nationalities={nationalities}
            nationalitiesLoading={nationalitiesLoading}
            onPageChange={handlePageChange}
            onViewClient={handleViewClient}
            onEditClient={handleEditClient}
            onGenerateDocument={handleGenerateDocument}
            onDeleteClient={handleDeleteClient}
            onExport={handleExport}
            filterClients={filterClients}
          />
        </div>
      </main>

      <BaseClientsDialogs
        selectedClient={selectedClient}
        viewDialogOpen={viewDialogOpen}
        editDialogOpen={editDialogOpen}
        documentDialogOpen={documentDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        setViewDialogOpen={setViewDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        setDocumentDialogOpen={setDocumentDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        onClientUpdated={handleClientUpdated}
        onConfirmDelete={confirmDeleteClient}
      />
    </div>
  );
};

export default BaseClients;
