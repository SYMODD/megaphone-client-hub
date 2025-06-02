
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';
import { supabase } from '@/integrations/supabase/client';

export const useDataLoader = () => {
  const { toast } = useToast();

  const cleanupOrphanedData = async () => {
    try {
      console.log('🧹 Nettoyage des données orphelines...');
      
      // Supprimer tous les templates orphelins (sans fichier correspondant)
      const { error: deleteTemplatesError } = await supabase
        .from('pdf_templates')
        .delete()
        .neq('id', 'dummy'); // Supprime tous les templates
      
      if (deleteTemplatesError) {
        console.error('Erreur suppression templates:', deleteTemplatesError);
      } else {
        console.log('✅ Templates orphelins supprimés');
      }

      // Supprimer tous les mappings orphelins
      const { error: deleteMappingsError } = await supabase
        .from('pdf_template_mappings')
        .delete()
        .neq('id', 'dummy'); // Supprime tous les mappings
      
      if (deleteMappingsError) {
        console.error('Erreur suppression mappings:', deleteMappingsError);
      } else {
        console.log('✅ Mappings orphelins supprimés');
      }

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  };

  const loadTemplates = async (): Promise<PDFTemplate[]> => {
    try {
      console.log('🔄 Chargement des templates...');
      
      // D'abord nettoyer les données orphelines
      await cleanupOrphanedData();
      
      const loadedTemplates = await SupabasePDFStorage.loadTemplates();
      console.log(`✅ ${loadedTemplates.length} templates chargés après nettoyage`);
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

  const loadTemplatesAndMappings = async () => {
    console.log('🔄 Début du chargement des templates et mappings...');
    
    // Charger les templates et mappings en parallèle
    const [loadedTemplates, loadedMappings] = await Promise.all([
      loadTemplates(),
      loadMappings()
    ]);

    console.log('✅ Chargement terminé avec succès');
    return { loadedTemplates, loadedMappings };
  };

  return {
    loadTemplates,
    loadMappings,
    loadTemplatesAndMappings,
    cleanupOrphanedData
  };
};
