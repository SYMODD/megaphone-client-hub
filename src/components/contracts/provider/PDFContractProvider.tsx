
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
    saveMappings
  } = usePDFTemplates();

  console.log('📊 PDFContractProvider state:', {
    templatesCount: templates.length,
    loading,
    selectedTemplateId,
    selectedClient: !!selectedClient,
    userRole: profile?.role
  });

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
    userRole: profile?.role
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

  console.log('✅ PDFContractProvider rendering with context value');

  return (
    <PDFContractContext.Provider value={value}>
      {children}
    </PDFContractContext.Provider>
  );
};
