
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

      console.log('Chargement des mappings pour l\'utilisateur:', user.id);

      const { data, error } = await supabase
        .from('pdf_template_mappings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors du chargement des mappings:', error);
        throw new Error(`Impossible de charger les mappings: ${error.message}`);
      }

      console.log('Mappings chargés depuis la base de données:', data);

      // Grouper les mappings par template_id
      const mappingsGrouped: Record<string, FieldMapping[]> = {};
      
      data?.forEach(mapping => {
        if (!mappingsGrouped[mapping.template_id]) {
          mappingsGrouped[mapping.template_id] = [];
        }
        
        mappingsGrouped[mapping.template_id].push({
          id: mapping.field_id,
          placeholder: mapping.placeholder,
          clientField: mapping.client_field,
          description: mapping.description || '',
          x: mapping.x ? Number(mapping.x) : undefined,
          y: mapping.y ? Number(mapping.y) : undefined,
          fontSize: mapping.font_size ? Number(mapping.font_size) : undefined
        });
      });

      console.log(`✅ Mappings groupés par template:`, Object.keys(mappingsGrouped).length);
      return mappingsGrouped;
    } catch (error) {
      console.error('Erreur lors du chargement des mappings:', error);
      return {};
    }
  }

  static async saveMappings(templateId: string, mappings: FieldMapping[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('Sauvegarde des mappings pour le template:', templateId);

      // Supprimer les anciens mappings pour ce template
      const { error: deleteError } = await supabase
        .from('pdf_template_mappings')
        .delete()
        .eq('template_id', templateId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erreur lors de la suppression des anciens mappings:', deleteError);
        throw new Error(`Impossible de supprimer les anciens mappings: ${deleteError.message}`);
      }

      // Insérer les nouveaux mappings
      if (mappings.length > 0) {
        const mappingsToInsert = mappings.map(mapping => ({
          template_id: templateId,
          user_id: user.id,
          field_id: mapping.id,
          placeholder: mapping.placeholder,
          client_field: mapping.clientField,
          description: mapping.description || null,
          x: mapping.x || null,
          y: mapping.y || null,
          font_size: mapping.fontSize || null
        }));

        const { error: insertError } = await supabase
          .from('pdf_template_mappings')
          .insert(mappingsToInsert);

        if (insertError) {
          console.error('Erreur lors de l\'insertion des nouveaux mappings:', insertError);
          throw new Error(`Impossible de sauvegarder les mappings: ${insertError.message}`);
        }
      }

      console.log(`✅ ${mappings.length} mapping(s) sauvegardé(s) pour le template ${templateId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des mappings:', error);
      throw error;
    }
  }
}
