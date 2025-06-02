
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

  const retryLoad = async () => {
    console.log('🔄 Rechargement des templates demandé...');
    await loadTemplatesAndMappings();
  };

  // Nouvelle fonction pour forcer une synchronisation complète
  const forceSyncWithBackend = async () => {
    console.log('🔄 Synchronisation forcée avec le backend...');
    try {
      setLoading(true);
      
      // Recharger TOUT depuis la base de données
      const { loadedTemplates, loadedMappings } = await dataLoader.loadTemplatesAndMappings();
      
      // Mettre à jour l'état avec les données fraîches
      templateOps.setTemplates(loadedTemplates);
      mappingOps.setTemplateMappings(loadedMappings);
      
      console.log('✅ Synchronisation complète terminée:', loadedTemplates.length, 'templates trouvés');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Wrapper pour les opérations de template avec synchronisation automatique
  const saveTemplateWithSync = async (file: File, fileName: string): Promise<string> => {
    console.log('🔄 Sauvegarde avec synchronisation automatique...');
    
    const templateId = await templateOps.saveTemplate(file, fileName);
    
    // Forcer la synchronisation après la sauvegarde
    await forceSyncWithBackend();
    
    console.log('✅ Sauvegarde et synchronisation terminées');
    return templateId;
  };

  const renameTemplateWithSync = async (templateId: string, newName: string) => {
    console.log('🔄 Renommage avec synchronisation automatique...');
    
    await templateOps.renameTemplate(templateId, newName);
    
    // Forcer la synchronisation après le renommage
    await forceSyncWithBackend();
    
    console.log('✅ Renommage et synchronisation terminés');
  };

  const deleteTemplateWithSync = async (templateId: string) => {
    console.log('🔄 Suppression avec synchronisation automatique...');
    
    // Supprimer le template côté backend
    await templateOps.deleteTemplate(templateId);
    
    // Supprimer les mappings locaux immédiatement
    mappingOps.setTemplateMappings(prev => {
      const updated = { ...prev };
      delete updated[templateId];
      console.log('🗑️ Mappings locaux supprimés pour:', templateId);
      return updated;
    });
    
    // Forcer la synchronisation complète pour être sûr
    await forceSyncWithBackend();
    
    console.log('✅ Suppression et synchronisation terminées pour:', templateId);
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
