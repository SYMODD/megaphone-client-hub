
import { supabase } from '@/integrations/supabase/client';
import { FieldMapping } from './types';

export class MappingOperations {
  static async loadMappings(): Promise<Record<string, FieldMapping[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from('pdf_template_mappings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading mappings:', error);
        return {};
      }

      const mappings: Record<string, FieldMapping[]> = {};
      data?.forEach(mapping => {
        if (!mappings[mapping.template_id]) {
          mappings[mapping.template_id] = [];
        }
        mappings[mapping.template_id].push({
          id: mapping.field_id,
          placeholder: mapping.placeholder,
          clientField: mapping.client_field,
          description: mapping.description,
          x: mapping.x,
          y: mapping.y,
          fontSize: mapping.font_size
        });
      });

      return mappings;
    } catch (error) {
      console.error('Error loading mappings:', error);
      return {};
    }
  }

  static async saveMappings(templateId: string, mappings: FieldMapping[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete existing mappings for this template
    await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId)
      .eq('user_id', user.id);

    // Insert new mappings
    if (mappings.length > 0) {
      const mappingData = mappings.map(mapping => ({
        template_id: templateId,
        user_id: user.id,
        field_id: mapping.id,
        placeholder: mapping.placeholder,
        client_field: mapping.clientField,
        description: mapping.description,
        x: mapping.x,
        y: mapping.y,
        font_size: mapping.fontSize
      }));

      const { error } = await supabase
        .from('pdf_template_mappings')
        .insert(mappingData);

      if (error) {
        throw new Error(`Failed to save mappings: ${error.message}`);
      }
    }
  }
}
