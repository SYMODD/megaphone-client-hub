
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
          defaultValue: mapping.default_value || ''
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

      console.log('💾 Sauvegarde des mappings pour le template:', templateId);
      console.log('📋 Mappings à sauvegarder:', mappings.length);

      // Supprimer les anciens mappings pour ce template
      const { error: deleteError } = await supabase
        .from('pdf_template_mappings')
        .delete()
        .eq('template_id', templateId);

      if (deleteError) {
        console.error('❌ Erreur lors de la suppression des anciens mappings:', deleteError);
        throw new Error(`Failed to delete old mappings: ${deleteError.message}`);
      }

      // Insérer les nouveaux mappings
      if (mappings.length > 0) {
        const mappingsToInsert = mappings.map(mapping => {
          const mappingData = {
            template_id: templateId,
            user_id: user.id,
            field_id: mapping.id,
            placeholder: mapping.placeholder,
            client_field: mapping.clientField,
            x: mapping.x || 0,
            y: mapping.y || 0,
            font_size: mapping.fontSize || 12,
            description: mapping.description || '',
            default_value: mapping.defaultValue || ''
          };
          
          console.log('📝 Mapping à insérer:', {
            field_id: mappingData.field_id,
            client_field: mappingData.client_field,
            placeholder: mappingData.placeholder,
            isCheckbox: mappingData.client_field.startsWith('checkbox_')
          });
          
          return mappingData;
        });

        const { error: insertError } = await supabase
          .from('pdf_template_mappings')
          .insert(mappingsToInsert);

        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion des nouveaux mappings:', insertError);
          throw new Error(`Failed to save mappings: ${insertError.message}`);
        }

        console.log('✅ Tous les mappings sauvegardés avec succès:', mappingsToInsert.length);
      }

      console.log('✅ Sauvegarde terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des mappings:', error);
      throw error;
    }
  }
}
