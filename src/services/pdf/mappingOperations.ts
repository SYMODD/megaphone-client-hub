
import { supabase } from '@/integrations/supabase/client';
import { FieldMapping } from './types';

export class MappingOperations {
  static async loadMappings(): Promise<Record<string, FieldMapping[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté, aucun mapping à charger');
        return {};
      }

      console.log('🔍 DEBUG: Chargement des mappings pour l\'utilisateur:', user.id);

      // Récupérer le profil utilisateur pour debug
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('🔍 DEBUG: Rôle de l\'utilisateur actuel (mappings):', profile?.role);

      // Récupérer tous les mappings accessibles via les nouvelles politiques RLS
      const { data: mappings, error } = await supabase
        .from('pdf_template_mappings')
        .select('*');

      if (error) {
        console.error('❌ Erreur lors du chargement des mappings:', error);
        return {};
      }

      console.log('🔍 DEBUG: Mappings récupérés:', mappings?.length);

      // Grouper les mappings par template_id
      const mappingsByTemplate: Record<string, FieldMapping[]> = {};
      
      mappings?.forEach(mapping => {
        if (!mappingsByTemplate[mapping.template_id]) {
          mappingsByTemplate[mapping.template_id] = [];
        }
        
        mappingsByTemplate[mapping.template_id].push({
          id: mapping.field_id,
          placeholder: mapping.placeholder,
          clientField: mapping.client_field,
          x: mapping.x || 0,
          y: mapping.y || 0,
          fontSize: mapping.font_size || 12,
          description: mapping.description || '',
          defaultValue: mapping.default_value || '' // Charger la valeur par défaut
        });
      });

      console.log('✅ Mappings organisés par template:', Object.keys(mappingsByTemplate).length, 'templates avec mappings');
      return mappingsByTemplate;
    } catch (error) {
      console.error('Erreur lors du chargement des mappings:', error);
      return {};
    }
  }

  static async saveMappings(templateId: string, mappings: FieldMapping[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Sauvegarde des mappings pour le template:', templateId);

      // Supprimer les anciens mappings pour ce template
      await supabase
        .from('pdf_template_mappings')
        .delete()
        .eq('template_id', templateId);

      // Insérer les nouveaux mappings
      if (mappings.length > 0) {
        const mappingsToInsert = mappings.map(mapping => ({
          template_id: templateId,
          user_id: user.id,
          field_id: mapping.id,
          placeholder: mapping.placeholder,
          client_field: mapping.clientField,
          x: mapping.x,
          y: mapping.y,
          font_size: mapping.fontSize,
          description: mapping.description,
          default_value: mapping.defaultValue || '' // Sauvegarder la valeur par défaut
        }));

        const { error } = await supabase
          .from('pdf_template_mappings')
          .insert(mappingsToInsert);

        if (error) {
          throw new Error(`Failed to save mappings: ${error.message}`);
        }
      }

      console.log('✅ Mappings sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des mappings:', error);
      throw error;
    }
  }
}
