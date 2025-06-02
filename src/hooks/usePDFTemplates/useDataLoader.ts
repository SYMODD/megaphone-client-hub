
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export const useDataLoader = () => {
  const { toast } = useToast();

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
    loadTemplatesAndMappings
  };
};
