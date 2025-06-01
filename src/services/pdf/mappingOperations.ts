
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

      // Récupérer tous les mappings avec les informations des templates
      const { data: allMappings, error } = await supabase
        .from('pdf_template_mappings')
        .select(`
          *,
          pdf_templates!fk_template_id (
            user_id
          )
        `);

      if (error) {
        console.error('❌ Erreur lors du chargement des mappings:', error);
        return {};
      }

      console.log('🔍 DEBUG: Tous les mappings récupérés:', allMappings?.length);

      // Récupérer les profils des créateurs de templates
      const creatorIds = [...new Set(allMappings?.map(m => m.pdf_templates?.user_id).filter(Boolean))];
      const { data: creatorProfiles } = await supabase
        .from('profiles')
        .select('id, role')
        .in('id', creatorIds);

      const creatorRoleMap = new Map(creatorProfiles?.map(p => [p.id, p.role]) || []);

      // Filtrer manuellement selon notre logique
      const accessibleMappings = allMappings?.filter(mapping => {
        const templateUserId = mapping.pdf_templates?.user_id;
        
        // L'utilisateur peut voir ses propres mappings
        if (mapping.user_id === user.id) {
          console.log('✅ Mapping accessible (propriétaire):', mapping.template_id);
          return true;
        }

        // Si l'utilisateur est agent, il peut voir les mappings des templates d'admins
        if (profile?.role === 'agent' && templateUserId && creatorRoleMap.get(templateUserId) === 'admin') {
          console.log('✅ Mapping accessible (agent -> admin template):', mapping.template_id);
          return true;
        }

        console.log('❌ Mapping non accessible:', mapping.template_id);
        return false;
      }) || [];

      console.log('🔍 DEBUG: Mappings accessibles après filtrage:', accessibleMappings.length);

      // Grouper les mappings par template_id
      const mappingsByTemplate: Record<string, FieldMapping[]> = {};
      
      accessibleMappings.forEach(mapping => {
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
          field_id: mapping.id,
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
