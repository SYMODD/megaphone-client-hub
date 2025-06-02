
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
      
      // CORRECTION CRITIQUE: S'assurer que les templates sont mis à jour immédiatement
      templateOps.setTemplates(loadedTemplates);
      mappingOps.setTemplateMappings(loadedMappings);
      
      console.log('✅ Templates et mappings chargés et mis à jour dans l\'état:', loadedTemplates.length, 'templates');
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

  const retryLoad = async () => {
    console.log('🔄 Rechargement des templates demandé...');
    await loadTemplatesAndMappings();
  };

  // Wrapper pour les opérations de template avec recharge IMMÉDIATE
  const saveTemplateWithSync = async (file: File, fileName: string): Promise<string> => {
    console.log('🔄 Sauvegarde avec recharge immédiate...');
    
    try {
      const templateId = await templateOps.saveTemplate(file, fileName);
      
      console.log('✅ Template sauvegardé, rechargement immédiat...');
      
      // CORRECTION: Recharger immédiatement après sauvegarde
      await loadTemplatesAndMappings();
      
      console.log('✅ Sauvegarde et rechargement terminés');
      return templateId;
    } catch (error) {
      console.error('❌ Erreur dans saveTemplateWithSync:', error);
      throw error;
    }
  };

  const renameTemplateWithSync = async (templateId: string, newName: string) => {
    console.log('🔄 Renommage avec recharge immédiate...');
    
    try {
      await templateOps.renameTemplate(templateId, newName);
      
      // Recharger immédiatement après renommage
      await loadTemplatesAndMappings();
      
      console.log('✅ Renommage et rechargement terminés');
    } catch (error) {
      console.error('❌ Erreur dans renameTemplateWithSync:', error);
      throw error;
    }
  };

  const deleteTemplateWithSync = async (templateId: string) => {
    console.log('🔄 Suppression avec recharge immédiate...');
    
    try {
      await templateOps.deleteTemplate(templateId);
      
      // Recharger immédiatement après suppression
      await loadTemplatesAndMappings();
      
      console.log('✅ Suppression et rechargement terminés');
    } catch (error) {
      console.error('❌ Erreur dans deleteTemplateWithSync:', error);
      throw error;
    }
  };

  return {
    templates: templateOps.templates,
    templateMappings: mappingOps.templateMappings,
    loading,
    error,
    saveTemplate: saveTemplateWithSync,
    renameTemplate: renameTemplateWithSync,
    deleteTemplate: deleteTemplateWithSync,
    saveMappings: mappingOps.saveMappings,
    getTemplate: templateOps.getTemplate,
    loadTemplates: retryLoad
  };
};
