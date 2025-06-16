
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SupabasePDFStorage, FieldMapping } from '@/services/supabasePDFStorage';

export const useMappingOperations = () => {
  const [templateMappings, setTemplateMappings] = useState<Record<string, FieldMapping[]>>({});
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  return {
    templateMappings,
    setTemplateMappings,
    error: error,
    setError,
    saveMappings,
    loadMappings
  };
};
