
import { useState, useEffect, useRef } from 'react';
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
  
  // Référence pour éviter les rechargements multiples
  const isLoadingRef = useRef(false);
  
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
    if (isLoadingRef.current) {
      console.log('⚠️ Chargement déjà en cours, ignoré');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      templateOps.setError(null);
      mappingOps.setError(null);
      
      console.log('🔄 Chargement des templates et mappings...');
      
      const { loadedTemplates, loadedMappings } = await dataLoader.loadTemplatesAndMappings();
      
      // Mettre à jour les états immédiatement
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
      isLoadingRef.current = false;
    }
  };

  // FONCTION SIMPLIFIÉE: Rechargement sécurisé
  const safeReload = async (): Promise<void> => {
    if (isLoadingRef.current) {
      console.log('⚠️ Rechargement déjà en cours, ignoré');
      return;
    }

    console.log('🔄 Rechargement sécurisé des templates...');
    await loadTemplatesAndMappings();
  };

  // Wrapper pour les opérations de template avec rechargement
  const saveTemplateWithReload = async (file: File, fileName: string): Promise<string> => {
    console.log('🔄 Sauvegarde avec rechargement...');
    
    try {
      const templateId = await templateOps.saveTemplate(file, fileName);
      
      console.log('✅ Template sauvegardé, rechargement...');
      await safeReload();
      
      return templateId;
    } catch (error) {
      console.error('❌ Erreur dans saveTemplateWithReload:', error);
      throw error;
    }
  };

  const deleteTemplateWithReload = async (templateId: string) => {
    console.log('🗑️ Suppression avec rechargement...');
    
    try {
      await templateOps.deleteTemplate(templateId);
      await safeReload();
      
      console.log('✅ Suppression et rechargement terminés');
    } catch (error) {
      console.error('❌ Erreur dans deleteTemplateWithReload:', error);
      throw error;
    }
  };

  const renameTemplateWithReload = async (templateId: string, newName: string) => {
    console.log('🔄 Renommage avec rechargement...');
    
    try {
      await templateOps.renameTemplate(templateId, newName);
      await safeReload();
      
      console.log('✅ Renommage et rechargement terminés');
    } catch (error) {
      console.error('❌ Erreur dans renameTemplateWithReload:', error);
      throw error;
    }
  };

  return {
    templates: templateOps.templates,
    templateMappings: mappingOps.templateMappings,
    loading,
    error,
    saveTemplate: saveTemplateWithReload,
    renameTemplate: renameTemplateWithReload,
    deleteTemplate: deleteTemplateWithReload,
    saveMappings: mappingOps.saveMappings,
    getTemplate: templateOps.getTemplate,
    loadTemplates: safeReload
  };
};
