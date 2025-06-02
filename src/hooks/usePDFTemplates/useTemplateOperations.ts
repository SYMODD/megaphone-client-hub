
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TemplateOperations } from '@/services/pdf/templateOperations';
import { PDFTemplate } from './types';

export const useTemplateOperations = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reloadTemplates = async () => {
    try {
      console.log('🔄 Rechargement des templates depuis la base de données...');
      const loadedTemplates = await TemplateOperations.loadTemplates();
      setTemplates(loadedTemplates);
      console.log('✅ Templates rechargés:', loadedTemplates.length, 'templates trouvés');
      return loadedTemplates;
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des templates:', error);
      throw error;
    }
  };

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      setError(null);
      console.log('🔄 Sauvegarde du template:', fileName);
      
      const newTemplate = await TemplateOperations.saveTemplate(file, fileName);
      
      // Recharger tous les templates pour être sûr de la cohérence
      await reloadTemplates();

      toast({
        title: "Template sauvegardé",
        description: `Le template "${fileName}" a été sauvegardé avec succès.`,
      });

      console.log('✅ Template sauvegardé avec succès:', newTemplate.id);
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
      
      // Recharger tous les templates pour être sûr de la cohérence
      await reloadTemplates();

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
      
      // Supprimer le template côté backend
      await TemplateOperations.deleteTemplate(templateId);
      console.log('✅ Template supprimé côté backend');
      
      // Recharger tous les templates depuis la base de données pour être sûr de la cohérence
      await reloadTemplates();
      console.log('✅ Templates rechargés après suppression');

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
      
      console.log('✅ Suppression template terminée avec rechargement');
    } catch (error) {
      console.error('❌ Erreur suppression template:', error);
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

  return {
    templates,
    setTemplates,
    error,
    setError,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    getTemplate,
    reloadTemplates
  };
};
