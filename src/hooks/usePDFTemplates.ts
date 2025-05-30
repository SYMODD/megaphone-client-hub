
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PDFTemplateStorage, PDFTemplate, FieldMapping } from '@/services/pdfTemplateStorage';

export type { PDFTemplate, FieldMapping } from '@/services/pdfTemplateStorage';

export const usePDFTemplates = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [templateMappings, setTemplateMappings] = useState<Record<string, FieldMapping[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadMappings();
  }, []);

  const loadTemplates = async () => {
    const loadedTemplates = await PDFTemplateStorage.loadTemplates();
    setTemplates(loadedTemplates);
  };

  const loadMappings = () => {
    const loadedMappings = PDFTemplateStorage.loadMappings();
    setTemplateMappings(loadedMappings);
  };

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      const newTemplate = await PDFTemplateStorage.createTemplate(file, fileName);
      const updatedTemplates = [...templates, newTemplate];
      
      await PDFTemplateStorage.saveTemplates(updatedTemplates);
      setTemplates(updatedTemplates);

      toast({
        title: "Template sauvegardé",
        description: `Le template "${fileName}" a été sauvegardé avec succès.`,
      });

      return newTemplate.id;
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const renameTemplate = async (templateId: string, newName: string) => {
    try {
      const updatedTemplates = templates.map(t => 
        t.id === templateId ? { ...t, name: newName } : t
      );
      
      await PDFTemplateStorage.saveTemplates(updatedTemplates);
      setTemplates(updatedTemplates);

      toast({
        title: "Template renommé",
        description: `Le template a été renommé en "${newName}".`,
      });
    } catch (error) {
      console.error('Erreur renommage template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renommer le template.",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    
    await PDFTemplateStorage.saveTemplates(updatedTemplates);
    setTemplates(updatedTemplates);

    // Remove associated mappings
    const updatedMappings = { ...templateMappings };
    delete updatedMappings[templateId];
    PDFTemplateStorage.saveMappings(updatedMappings);
    setTemplateMappings(updatedMappings);

    toast({
      title: "Template supprimé",
      description: "Le template a été supprimé avec succès.",
    });
  };

  const saveMappings = (templateId: string, mappings: FieldMapping[]) => {
    const updatedMappings = {
      ...templateMappings,
      [templateId]: mappings
    };
    
    PDFTemplateStorage.saveMappings(updatedMappings);
    setTemplateMappings(updatedMappings);
  };

  const getTemplate = async (templateId: string): Promise<File | null> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    return PDFTemplateStorage.getTemplateFile(template);
  };

  return {
    templates,
    templateMappings,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate,
    loadTemplates
  };
};
