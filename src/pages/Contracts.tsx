
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useContractManagement } from "@/hooks/useContractManagement";
import { AgentContractInterface } from "@/components/contracts/AgentContractInterface";
import { AdminContractInterface } from "@/components/contracts/AdminContractInterface";
import { ContractDebugInfo } from "@/components/contracts/ContractDebugInfo";
import { PDFContractGenerator } from "@/components/contracts/PDFContractGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileDown } from "lucide-react";

const Contracts = () => {
  const { profile } = useAuth();
  const {
    clients,
    loading,
    selectedClient,
    selectedTemplate,
    showPreview,
    customTemplates,
    handleClientSelect,
    handleGenerateContract,
    handleDownloadHTML,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    setSelectedTemplate,
  } = useContractManagement();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAgent = profile?.role === "agent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Génération de Contrats</h1>
            <p className="text-sm sm:text-base text-slate-600">
              {isAgent ? "Créez des contrats pour vos clients" : "Créez des contrats personnalisés pour vos clients"}
            </p>
          </div>

          {/* Debug info - à supprimer en production */}
          {!isAgent && (
            <ContractDebugInfo customTemplates={customTemplates} />
          )}

          <Tabs defaultValue="html" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contrats HTML
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Contrats PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              {isAgent ? (
                <AgentContractInterface
                  clients={clients}
                  selectedClient={selectedClient}
                  selectedTemplate={selectedTemplate}
                  customTemplates={customTemplates}
                  showPreview={showPreview}
                  onClientSelect={handleClientSelect}
                  onTemplateSelect={setSelectedTemplate}
                  onGenerateContract={handleGenerateContract}
                  onDownloadHTML={handleDownloadHTML}
                />
              ) : (
                <AdminContractInterface
                  clients={clients}
                  selectedClient={selectedClient}
                  selectedTemplate={selectedTemplate}
                  customTemplates={customTemplates}
                  showPreview={showPreview}
                  onClientSelect={handleClientSelect}
                  onTemplateSelect={setSelectedTemplate}
                  onGenerateContract={handleGenerateContract}
                  onDownloadHTML={handleDownloadHTML}
                  onAddTemplate={handleAddTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              )}
            </TabsContent>

            <TabsContent value="pdf">
              <PDFContractGenerator clients={clients} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Contracts;
