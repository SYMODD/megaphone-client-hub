
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';
import { supabase } from '@/integrations/supabase/client';

export const useDataLoader = () => {
  const { toast } = useToast();

  const cleanupOrphanedData = async () => {
    try {
      console.log('🧹 Nettoyage des données orphelines...');
      
      // Vérifier l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Aucun utilisateur connecté, nettoyage annulé');
        return;
      }

      // Nettoyer seulement les données réellement orphelines en vérifiant l'existence des fichiers
      const { data: templates } = await supabase
        .from('pdf_templates')
        .select('*');

      if (templates) {
        for (const template of templates) {
          // Vérifier si le fichier existe dans le storage
          const { error: downloadError } = await supabase.storage
            .from('pdf-templates')
            .download(template.file_path);

          if (downloadError) {
            console.log(`🗑️ Template orphelin détecté: ${template.name} (fichier inexistant)`);
            
            // Supprimer les mappings associés d'abord
            await supabase
              .from('pdf_template_mappings')
              .delete()
              .eq('template_id', template.id);
            
            // Puis supprimer le template
            await supabase
              .from('pdf_templates')
              .delete()
              .eq('id', template.id);
            
            console.log(`🗑️ Template orphelin supprimé: ${template.name}`);
          }
        }
      }

      console.log('✅ Nettoyage terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
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
