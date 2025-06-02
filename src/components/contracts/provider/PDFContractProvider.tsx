
import React, { useState, useEffect, useRef } from 'react';
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { profile } = useAuth();

  // Référence pour éviter les rechargements en boucle
  const isReloadingRef = useRef(false);
  const initialLoadCompleted = useRef(false);
  const lastSavedMappings = useRef<string>('');

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
    hasUnsavedChanges
  });

  // Effet pour marquer la fin du chargement initial
  useEffect(() => {
    if (!loading && !initialLoadCompleted.current) {
      console.log('✅ Chargement initial terminé. Templates disponibles:', templates.length);
      initialLoadCompleted.current = true;
    }
  }, [loading, templates.length]);

  // CORRECTION: Surveiller les templates sélectionnés qui disparaissent
  useEffect(() => {
    if (selectedTemplateId && !templates.find(t => t.id === selectedTemplateId)) {
      console.log('🗑️ Template sélectionné n\'existe plus, désélection automatique:', selectedTemplateId);
      setSelectedTemplateId(null);
      setFieldMappings([]);
      setPreviewUrl('');
      setHasUnsavedChanges(false);
    }
  }, [templates, selectedTemplateId]);

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

  // CORRECTION: Éviter la sauvegarde en boucle des mappings
  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    console.log('🔄 Mise à jour des mappings:', mappings.length, 'champs');
    setFieldMappings(mappings);
    
    // Marquer comme ayant des changements non sauvegardés
    const mappingsString = JSON.stringify(mappings);
    const hasChanges = mappingsString !== lastSavedMappings.current;
    setHasUnsavedChanges(hasChanges);
    
    // Sauvegarder automatiquement seulement si les mappings ont vraiment changé
    if (selectedTemplateId && hasChanges) {
      console.log('💾 Sauvegarde automatique des mappings pour le template:', selectedTemplateId);
      
      // Sauvegarder avec un délai pour éviter les appels multiples
      setTimeout(() => {
        saveMappings(selectedTemplateId, mappings).then(() => {
          lastSavedMappings.current = mappingsString;
          setHasUnsavedChanges(false);
        });
      }, 500);
    }
  };

  // NOUVELLE FONCTION: Sauvegarde manuelle des mappings
  const handleSaveMappings = async () => {
    if (!selectedTemplateId || !fieldMappings.length) {
      console.warn('⚠️ Aucun template sélectionné ou aucun mapping à sauvegarder');
      return;
    }

    try {
      console.log('💾 Sauvegarde manuelle des mappings pour le template:', selectedTemplateId);
      await saveMappings(selectedTemplateId, fieldMappings);
      
      const mappingsString = JSON.stringify(fieldMappings);
      lastSavedMappings.current = mappingsString;
      setHasUnsavedChanges(false);
      
      console.log('✅ Sauvegarde manuelle terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde manuelle:', error);
      throw error; // Re-throw pour que le composant puisse gérer l'erreur
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('🔄 Sélection du client:', client);
    setSelectedClient(client);
  };

  // NOUVELLE FONCTION: Rechargement manuel sécurisé
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
