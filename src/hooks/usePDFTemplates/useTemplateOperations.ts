
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
      setTemplates(prev => [newTemplate, ...prev]);

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
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, name: newName } : t
      ));

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
      
      await TemplateOperations.deleteTemplate(templateId);
      
      // Mise à jour immédiate de l'état local
      setTemplates(prev => {
        const newTemplates = prev.filter(t => t.id !== templateId);
        console.log('✅ État local mis à jour, templates restants:', newTemplates.length);
        return newTemplates;
      });

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
      
      console.log('✅ Template supprimé avec succès côté frontend');
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
    getTemplate
  };
};
