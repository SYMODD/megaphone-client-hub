
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TemplateOperations } from '@/services/pdf/templateOperations';
import { PDFTemplate } from './types';

export const useTemplateOperations = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      setError(null);
      console.log('🔄 Sauvegarde du template:', fileName);
      
      const newTemplate = await TemplateOperations.saveTemplate(file, fileName);

      console.log('✅ Template sauvegardé avec succès:', newTemplate.id);
      
      // CORRECTION: Ajouter immédiatement le nouveau template à l'état local
      setTemplates(prevTemplates => {
        const updatedTemplates = [...prevTemplates, newTemplate];
        console.log('✅ Template ajouté à l\'état local. Total:', updatedTemplates.length);
        return updatedTemplates;
      });

      toast({
        title: "Template sauvegardé",
        description: `Le template "${fileName}" a été sauvegardé avec succès.`,
      });

      return newTemplate.id;
    } catch (error) {
      console.error('❌ Erreur sauvegarde template:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de sauvegarder le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de sauvegarde",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const renameTemplate = async (templateId: string, newName: string) => {
    try {
      setError(null);
      console.log('🔄 Renommage du template:', templateId, 'vers:', newName);
      
      await TemplateOperations.renameTemplate(templateId, newName);

      // Mettre à jour immédiatement l'état local
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === templateId 
            ? { ...template, name: newName }
            : template
        )
      );

      toast({
        title: "Template renommé",
        description: `Le template a été renommé en "${newName}".`,
      });
      
      console.log('✅ Template renommé avec succès');
    } catch (error) {
      console.error('❌ Erreur renommage template:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de renommer le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de renommage",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setError(null);
      console.log('🔄 Suppression du template:', templateId);
      
      // PURGE EN DUR : Supprimer immédiatement de l'état local AVANT l'appel backend
      console.log('🗑️ PURGE EN DUR: Suppression immédiate de l\'état local');
      setTemplates(prevTemplates => {
        const filteredTemplates = prevTemplates.filter(template => template.id !== templateId);
        console.log('🗑️ État local purgé. Templates restants:', filteredTemplates.length);
        return filteredTemplates;
      });
      
      // Ensuite appeler le backend
      await TemplateOperations.deleteTemplate(templateId);

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
      
      console.log('✅ Suppression backend terminée. État local déjà purgé.');
    } catch (error) {
      console.error('❌ Erreur suppression template:', error);
      
      // En cas d'erreur backend, recharger les templates depuis le serveur pour resynchroniser
      console.log('⚠️ Erreur backend détectée, rechargement depuis serveur...');
      try {
        const freshTemplates = await TemplateOperations.loadTemplates();
        setTemplates(freshTemplates);
        console.log('🔄 État resynchronisé avec le serveur après erreur');
      } catch (loadError) {
        console.error('❌ Impossible de resynchroniser:', loadError);
      }
      
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTemplate = async (templateId: string): Promise<File | null> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    try {
      return await TemplateOperations.getTemplateFile(template);
    } catch (error) {
      console.error('❌ Erreur récupération template:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de récupérer le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de récupération",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // NOUVELLE FONCTION : Purge complète et rechargement depuis le serveur
  const hardPurgeAndReload = async (): Promise<void> => {
    try {
      console.log('🔥 PURGE EN DUR DÉCLENCHÉE');
      setError(null);
      
      // Vider complètement l'état local
      setTemplates([]);
      console.log('🗑️ État local vidé complètement');
      
      // Recharger depuis le serveur
      const freshTemplates = await TemplateOperations.loadTemplates();
      setTemplates(freshTemplates);
      
      console.log('✅ PURGE TERMINÉE. Templates rechargés depuis serveur:', freshTemplates.length);
      
      toast({
        title: "État synchronisé",
        description: "Les templates ont été rechargés depuis le serveur.",
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la purge complète:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la synchronisation.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    templates,
    setTemplates,
    error,
    setError,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    getTemplate,
    hardPurgeAndReload
  };
};
