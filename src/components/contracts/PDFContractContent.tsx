
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PDFContractTabs } from "./PDFContractTabs";
import { usePDFContract } from "./provider/PDFContractContext";
import { Client } from "./provider/types";

interface PDFContractContentProps {
  clients: Client[];
}

export const PDFContractContent = ({ clients }: PDFContractContentProps) => {
  console.log('🔄 PDFContractContent rendering...');
  
  const context = usePDFContract();
  
  console.log('✅ Context loaded:', !!context);
  
  const {
    templates,
    selectedTemplateId,
    selectedClient,
    fieldMappings,
    isGenerating,
    previewUrl,
    showUpload,
    loading,
    setShowUpload,
    handleTemplateUploaded,
    handleTemplateSelect,
    handleDeleteTemplate,
    handleRenameTemplate,
    handleFieldMappingsChange,
    handleClientSelect,
    handleGenerateContract,
    handlePreviewContract,
    handleForceReload
  } = context;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-slate-600">Chargement des templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <PDFContractTabs
      clients={clients}
      templates={templates}
      selectedTemplateId={selectedTemplateId}
      selectedTemplate={selectedTemplate}
      selectedClient={selectedClient}
      fieldMappings={fieldMappings}
      isGenerating={isGenerating}
      previewUrl={previewUrl}
      showUpload={showUpload}
      onTemplateUploaded={handleTemplateUploaded}
      onTemplateSelect={handleTemplateSelect}
      onDeleteTemplate={handleDeleteTemplate}
      onRenameTemplate={handleRenameTemplate}
      onFieldMappingsChange={handleFieldMappingsChange}
      onClientSelect={handleClientSelect}
      onGenerateContract={handleGenerateContract}
      onPreviewContract={handlePreviewContract}
      onUploadNew={() => setShowUpload(true)}
      onCancelUpload={() => setShowUpload(false)}
      onForceReload={handleForceReload}
    />
  );
};
