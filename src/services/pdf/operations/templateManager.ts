
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateManager {
  static async deleteTemplate(templateId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get template to find file path
    const { data: template, error: getError } = await supabase
      .from('pdf_templates')
      .select('file_path')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (getError || !template) {
      throw new Error('Template not found');
    }

    // Delete file from storage
    await supabase.storage
      .from(BucketManager.getBucketName())
      .remove([template.file_path]);

    // Delete template metadata
    const { error: deleteError } = await supabase
      .from('pdf_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to delete template: ${deleteError.message}`);
    }

    // Delete associated mappings
    await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId)
      .eq('user_id', user.id);
  }

  static async renameTemplate(templateId: string, newName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('pdf_templates')
      .update({ name: newName })
      .eq('id', templateId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to rename template: ${error.message}`);
    }
  }
}
