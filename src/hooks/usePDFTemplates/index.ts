
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTemplateOperations } from './useTemplateOperations';
import { useMappingOperations } from './useMappingOperations';
import { useDataLoader } from './useDataLoader';
import type { UsePDFTemplatesReturn } from './types';

// Re-export types for backward compatibility
export type { PDFTemplate, FieldMapping } from './types';

export const usePDFTemplates = (): UsePDFTemplatesReturn => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use the separate operation hooks
  const templateOps = useTemplateOperations();
  const mappingOps = useMappingOperations();
  const dataLoader = useDataLoader();

  // Combine errors from both operations
  const error = templateOps.error || mappingOps.error;

  useEffect(() => {
    loadTemplatesAndMappings();
  }, []);

  const loadTemplatesAndMappings = async () => {
    try {
      setLoading(true);
      templateOps.setError(null);
      mappingOps.setError(null);
      
      console.log('🔄 Chargement des templates et mappings...');
      const { loadedTemplates, loadedMappings } = await dataLoader.loadTemplatesAndMappings();
      
      templateOps.setTemplates(loadedTemplates);
      mappingOps.setTemplateMappings(loadedMappings);
      
      console.log('✅ Templates et mappings chargés:', loadedTemplates.length, 'templates');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement';
      templateOps.setError(errorMessage);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    console.log('🔄 Rechargement des templates demandé...');
    loadTemplatesAndMappings();
  };

  // Handle template deletion with mapping cleanup
  const deleteTemplate = async (templateId: string) => {
    console.log('🔄 Suppression complète du template:', templateId);
    
    // Supprimer le template
    await templateOps.deleteTemplate(templateId);
    
    // Supprimer les mappings associés
    mappingOps.setTemplateMappings(prev => {
      const updated = { ...prev };
      delete updated[templateId];
      console.log('🗑️ Mappings supprimés pour le template:', templateId);
      return updated;
    });
    
    console.log('✅ Suppression complète terminée pour:', templateId);
  };

  return {
    templates: templateOps.templates,
    templateMappings: mappingOps.templateMappings,
    loading,
    error,
    saveTemplate: templateOps.saveTemplate,
    renameTemplate: templateOps.renameTemplate,
    deleteTemplate,
    saveMappings: mappingOps.saveMappings,
    getTemplate: templateOps.getTemplate,
    loadTemplates: retryLoad
  };
};
