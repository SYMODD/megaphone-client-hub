
import React from 'react';
import { usePDFTemplates } from "@/hooks/usePDFTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { PDFContractContext } from './PDFContractContext';
import { useTemplateHandlers } from './useTemplateHandlers';
import { useContractGeneration } from './useContractGeneration';
import { usePDFContractState } from './usePDFContractState';
import { useFieldMappingManager } from './useFieldMappingManager';
import { useProviderEffects } from './useProviderEffects';
import { Client, PDFContractContextType } from './types';

interface PDFContractProviderProps {
  children: React.ReactNode;
}

export const PDFContractProvider = ({ children }: PDFContractProviderProps) => {
  console.log('🔄 PDFContractProvider initializing...');
  
  const { profile } = useAuth();
  
  // State management
  const {
    selectedTemplateId,
    fieldMappings,
    selectedClient,
    isGenerating,
    previewUrl,
    showUpload,
    hasUnsavedChanges,
    setSelectedTemplateId,
    setFieldMappings,
    setSelectedClient,
    setIsGenerating,
    setPreviewUrl,
    setShowUpload,
    setHasUnsavedChanges,
    isReloadingRef,
    initialLoadCompleted,
    lastSavedMappings,
    lastLoadedTemplateId
  } = usePDFContractState();

  const {
    templates,
    templateMappings,
    loading,
    saveTemplate,
    saveMappings,
    loadTemplates,
    deleteTemplate
  } = usePDFTemplates();

  console.log('📊 PDFContractProvider state:', {
    templatesCount: templates.length,
    loading,
    selectedTemplateId,
    selectedClient: !!selectedClient,
    userRole: profile?.role,
    initialLoadCompleted: initialLoadCompleted.current,
    fieldMappingsCount: fieldMappings.length,
    hasUnsavedChanges,
    templateMappingsCount: Object.keys(templateMappings).length
  });

  // Field mapping management
  const { handleFieldMappingsChange, handleSaveMappings } = useFieldMappingManager({
    selectedTemplateId,
    fieldMappings,
    setFieldMappings,
    setHasUnsavedChanges,
    templateMappings,
    lastSavedMappings,
    lastLoadedTemplateId
  });

  // Provider effects
  useProviderEffects({
    loading,
    templates,
    selectedTemplateId,
    previewUrl,
    initialLoadCompleted,
    lastLoadedTemplateId,
    setSelectedTemplateId,
    setFieldMappings,
    setPreviewUrl,
    setHasUnsavedChanges
  });

  const templateHandlers = useTemplateHandlers({
    selectedTemplateId,
    setSelectedTemplateId,
    setFieldMappings,
    setPreviewUrl,
    setShowUpload,
    templateMappings,
    templates,
    userRole: profile?.role,
    saveTemplate,
    loadTemplates,
    deleteTemplate
  });

  const contractGeneration = useContractGeneration({
    selectedTemplateId,
    selectedClient,
    fieldMappings,
    templates,
    setIsGenerating,
    setPreviewUrl,
    previewUrl
  });

  const handleClientSelect = (client: Client) => {
    console.log('🔄 Sélection du client:', client);
    setSelectedClient(client);
  };

  // Rechargement manuel sécurisé
  const handleForceReload = async () => {
    if (isReloadingRef.current) {
      console.log('⚠️ Rechargement déjà en cours, ignoré');
      return;
    }

    try {
      isReloadingRef.current = true;
      console.log('🔄 Rechargement manuel des templates...');
      await loadTemplates();
      console.log('✅ Rechargement manuel terminé');
    } catch (error) {
      console.error('❌ Erreur lors du rechargement manuel:', error);
    } finally {
      isReloadingRef.current = false;
    }
  };

  const handleDownloadPDF = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = 'contract.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Obtenir le nom du template sélectionné
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const selectedTemplateName = selectedTemplate?.name;

  const value: PDFContractContextType = {
    // State
    selectedTemplateId,
    fieldMappings,
    selectedClient,
    isGenerating,
    previewUrl,
    showUpload,
    hasUnsavedChanges,
    selectedTemplateName,
    
    // From hook
    templates,
    templateMappings,
    loading,
    
    // Actions
    setSelectedTemplateId,
    setFieldMappings,
    setSelectedClient,
    setShowUpload,
    handleFieldMappingsChange,
    handleClientSelect,
    handleSaveMappings,
    handleDownloadPDF,
    ...templateHandlers,
    ...contractGeneration,
    handleForceReload
  };

  console.log('✅ PDFContractProvider rendering with context value. Templates disponibles:', templates.length);

  return (
    <PDFContractContext.Provider value={value}>
      {children}
    </PDFContractContext.Provider>
  );
};
