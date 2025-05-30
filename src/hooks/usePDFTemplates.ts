
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export type { PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export const usePDFTemplates = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [templateMappings, setTemplateMappings] = useState<Record<string, FieldMapping[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadMappings();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loadedTemplates = await SupabasePDFStorage.loadTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async () => {
    try {
      const loadedMappings = await SupabasePDFStorage.loadMappings();
      setTemplateMappings(loadedMappings);
    } catch (error) {
      console.error('Error loading mappings:', error);
    }
  };

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      const newTemplate = await SupabasePDFStorage.saveTemplate(file, fileName);
      setTemplates(prev => [newTemplate, ...prev]);

      toast({
        title: "Template sauvegardé",
        description: `Le template "${fileName}" a été sauvegardé avec succès.`,
      });

      return newTemplate.id;
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const renameTemplate = async (templateId: string, newName: string) => {
    try {
      await SupabasePDFStorage.renameTemplate(templateId, newName);
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, name: newName } : t
      ));

      toast({
        title: "Template renommé",
        description: `Le template a été renommé en "${newName}".`,
      });
    } catch (error) {
      console.error('Erreur renommage template:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de renommer le template.",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await SupabasePDFStorage.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));

      // Remove associated mappings
      setTemplateMappings(prev => {
        const updated = { ...prev };
        delete updated[templateId];
        return updated;
      });

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Erreur suppression template:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le template.",
        variant: "destructive",
      });
    }
  };

  const saveMappings = async (templateId: string, mappings: FieldMapping[]) => {
    try {
      await SupabasePDFStorage.saveMappings(templateId, mappings);
      setTemplateMappings(prev => ({
        ...prev,
        [templateId]: mappings
      }));
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les mappings.",
        variant: "destructive",
      });
    }
  };

  const getTemplate = async (templateId: string): Promise<File | null> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    return SupabasePDFStorage.getTemplateFile(template);
  };

  return {
    templates,
    templateMappings,
    loading,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate,
    loadTemplates
  };
};
