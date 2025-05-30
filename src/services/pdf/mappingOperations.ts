
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

      // Récupérer le profil de l'utilisateur pour déterminer son rôle
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('pdf_template_mappings')
        .select('*');

      // Si l'utilisateur n'est pas admin, filtrer par ses propres mappings
      if (profile?.role !== 'admin' && profile?.role !== 'superviseur') {
        console.log('Utilisateur agent - chargement des mappings personnels uniquement');
        query = query.eq('user_id', user.id);
      } else {
        console.log('Utilisateur admin/superviseur - chargement de tous les mappings');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des mappings:', error);
        return {};
      }

      console.log('Mappings chargés depuis la base de données:', data);

      // Grouper les mappings par template_id
      const mappingsByTemplate: Record<string, FieldMapping[]> = {};
      
      data?.forEach(mapping => {
        if (!mappingsByTemplate[mapping.template_id]) {
          mappingsByTemplate[mapping.template_id] = [];
        }
        
        mappingsByTemplate[mapping.template_id].push({
          fieldId: mapping.field_id,
          placeholder: mapping.placeholder,
          clientField: mapping.client_field,
          x: mapping.x || 0,
          y: mapping.y || 0,
          fontSize: mapping.font_size || 12,
          description: mapping.description || ''
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

      // Supprimer les anciens mappings
      await supabase
        .from('pdf_template_mappings')
        .delete()
        .eq('template_id', templateId)
        .eq('user_id', user.id);

      // Insérer les nouveaux mappings
      if (mappings.length > 0) {
        const mappingsToInsert = mappings.map(mapping => ({
          template_id: templateId,
          user_id: user.id,
          field_id: mapping.fieldId,
          placeholder: mapping.placeholder,
          client_field: mapping.clientField,
          x: mapping.x,
          y: mapping.y,
          font_size: mapping.fontSize,
          description: mapping.description
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
