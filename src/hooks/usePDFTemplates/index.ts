
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

  const retryLoad = async (): Promise<void> => {
    console.log('🔄 Rechargement des templates demandé...');
    await loadTemplatesAndMappings();
  };

  // NOUVELLE FONCTION : Purge complète
  const hardPurge = async (): Promise<void> => {
    console.log('🔥 PURGE COMPLÈTE DÉCLENCHÉE');
    
    try {
      setLoading(true);
      
      // Utiliser la fonction de purge des templates
      await templateOps.hardPurgeAndReload();
      
      // Recharger aussi les mappings
      const { loadedMappings } = await dataLoader.loadTemplatesAndMappings();
      mappingOps.setTemplateMappings(loadedMappings);
      
      console.log('🔥 PURGE COMPLÈTE TERMINÉE');
      
    } catch (error) {
      console.error('❌ Erreur lors de la purge complète:', error);
    } finally {
      setLoading(false);
    }
  };

  // Wrapper pour les opérations de template avec purge IMMÉDIATE
  const saveTemplateWithSync = async (file: File, fileName: string): Promise<string> => {
    console.log('🔄 Sauvegarde avec purge après...');
    
    try {
      const templateId = await templateOps.saveTemplate(file, fileName);
      
      console.log('✅ Template sauvegardé, purge et rechargement...');
      
      // Purge complète après sauvegarde
      await hardPurge();
      
      console.log('✅ Sauvegarde et purge terminées');
      return templateId;
    } catch (error) {
      console.error('❌ Erreur dans saveTemplateWithSync:', error);
      throw error;
    }
  };

  const deleteTemplateWithPurge = async (templateId: string) => {
    console.log('🔥 Suppression avec purge immédiate...');
    
    try {
      await templateOps.deleteTemplate(templateId);
      
      // Purge complète après suppression pour garantir la synchronisation
      await hardPurge();
      
      console.log('🔥 Suppression et purge complètes terminées');
    } catch (error) {
      console.error('❌ Erreur dans deleteTemplateWithPurge:', error);
      throw error;
    }
  };

  const renameTemplateWithSync = async (templateId: string, newName: string) => {
    console.log('🔄 Renommage avec purge après...');
    
    try {
      await templateOps.renameTemplate(templateId, newName);
      
      // Purge complète après renommage
      await hardPurge();
      
      console.log('✅ Renommage et purge terminés');
    } catch (error) {
      console.error('❌ Erreur dans renameTemplateWithSync:', error);
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
    deleteTemplate: deleteTemplateWithPurge,
    saveMappings: mappingOps.saveMappings,
    getTemplate: templateOps.getTemplate,
    loadTemplates: hardPurge  // Utiliser la purge complète au lieu du simple rechargement
  };
};
