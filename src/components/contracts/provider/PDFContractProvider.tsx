
import React, { useState, useEffect } from 'react';
import { usePDFTemplates, FieldMapping } from "@/hooks/usePDFTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { PDFContractContext } from './PDFContractContext';
import { useTemplateHandlers } from './useTemplateHandlers';
import { useContractGeneration } from './useContractGeneration';
import { Client, PDFContractContextType } from './types';

interface PDFContractProviderProps {
  children: React.ReactNode;
}

export const PDFContractProvider = ({ children }: PDFContractProviderProps) => {
  console.log('🔄 PDFContractProvider initializing...');
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const { profile } = useAuth();

  const {
    templates,
    templateMappings,
    loading,
    saveTemplate,
    saveMappings,
    loadTemplates
  } = usePDFTemplates();

  console.log('📊 PDFContractProvider state:', {
    templatesCount: templates.length,
    loading,
    selectedTemplateId,
    selectedClient: !!selectedClient,
    userRole: profile?.role
  });

  // CORRECTION: Forcer un rechargement si aucun template n'est visible mais qu'on n'est pas en loading
  useEffect(() => {
    if (!loading && templates.length === 0) {
      console.log('⚠️ Aucun template visible, rechargement forcé...');
      loadTemplates();
    }
  }, [loading, templates.length, loadTemplates]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const templateHandlers = useTemplateHandlers({
    selectedTemplateId,
    setSelectedTemplateId,
    setFieldMappings,
    setPreviewUrl,
    setShowUpload,
    templateMappings,
    templates,
    userRole: profile?.role,
    saveTemplate, // Passer la fonction saveTemplate
    loadTemplates // Passer la fonction loadTemplates pour forcer le rechargement
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

  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    console.log('🔄 Mise à jour des mappings:', mappings);
    setFieldMappings(mappings);
    
    if (selectedTemplateId) {
      console.log('💾 Sauvegarde automatique des mappings pour le template:', selectedTemplateId);
      saveMappings(selectedTemplateId, mappings);
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('🔄 Sélection du client:', client);
    setSelectedClient(client);
  };

  const value: PDFContractContextType = {
    // State
    selectedTemplateId,
    fieldMappings,
    selectedClient,
    isGenerating,
    previewUrl,
    showUpload,
    
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
    ...templateHandlers,
    ...contractGeneration
  };

  console.log('✅ PDFContractProvider rendering with context value. Templates disponibles:', templates.length);

  return (
    <PDFContractContext.Provider value={value}>
      {children}
    </PDFContractContext.Provider>
  );
};
