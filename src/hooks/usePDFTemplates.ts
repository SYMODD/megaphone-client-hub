
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export type { PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export const usePDFTemplates = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [templateMappings, setTemplateMappings] = useState<Record<string, FieldMapping[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplatesAndMappings();
  }, []);

  const loadTemplatesAndMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Début du chargement des templates et mappings...');
      
      // Charger les templates et mappings en parallèle
      const [loadedTemplates, loadedMappings] = await Promise.all([
        loadTemplates(),
        loadMappings()
      ]);

      console.log('✅ Chargement terminé avec succès');
      setTemplates(loadedTemplates);
      setTemplateMappings(loadedMappings);
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement';
      setError(errorMessage);
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (): Promise<PDFTemplate[]> => {
    try {
      console.log('🔄 Chargement des templates...');
      const loadedTemplates = await SupabasePDFStorage.loadTemplates();
      console.log(`✅ ${loadedTemplates.length} templates chargés`);
      return loadedTemplates;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des templates:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les templates.";
      
      // Afficher un toast d'erreur plus spécifique
      toast({
        title: "Erreur de connexion au stockage",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const loadMappings = async (): Promise<Record<string, FieldMapping[]>> => {
    try {
      console.log('🔄 Chargement des mappings...');
      const loadedMappings = await SupabasePDFStorage.loadMappings();
      console.log('✅ Mappings chargés:', Object.keys(loadedMappings).length, 'templates avec mappings');
      return loadedMappings;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des mappings:', error);
      return {};
    }
  };

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      setError(null);
      console.log('🔄 Sauvegarde du template:', fileName);
      
      const newTemplate = await SupabasePDFStorage.saveTemplate(file, fileName);
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
      await SupabasePDFStorage.renameTemplate(templateId, newName);
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, name: newName } : t
      ));

      toast({
        title: "Template renommé",
        description: `Le template a été renommé en "${newName}".`,
      });
    } catch (error) {
      console.error('❌ Erreur renommage template:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de renommer le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de renommage",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setError(null);
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
      console.error('❌ Erreur suppression template:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de supprimer le template.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const saveMappings = async (templateId: string, mappings: FieldMapping[]) => {
    try {
      setError(null);
      await SupabasePDFStorage.saveMappings(templateId, mappings);
      setTemplateMappings(prev => ({
        ...prev,
        [templateId]: mappings
      }));
    } catch (error) {
      console.error('❌ Erreur sauvegarde mappings:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de sauvegarder les mappings.";
      setError(errorMessage);
      
      toast({
        title: "Erreur de sauvegarde des mappings",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getTemplate = async (templateId: string): Promise<File | null> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    try {
      return await SupabasePDFStorage.getTemplateFile(template);
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

  const retryLoad = () => {
    loadTemplatesAndMappings();
  };

  return {
    templates,
    templateMappings,
    loading,
    error,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate,
    loadTemplates: retryLoad
  };
};
