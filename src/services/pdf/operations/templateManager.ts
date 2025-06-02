
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateManager {
  static async deleteTemplate(templateId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent supprimer des templates.');
    }

    console.log('🗑️ DEBUG: Début suppression template:', templateId);

    // Get template to find file path
    const { data: template, error: getError } = await supabase
      .from('pdf_templates')
      .select('file_path')
      .eq('id', templateId)
      .single();

    if (getError || !template) {
      console.error('❌ Template non trouvé pour suppression:', getError);
      throw new Error('Template not found');
    }

    console.log('🔍 DEBUG: Template trouvé, chemin fichier:', template.file_path);

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(BucketManager.getBucketName())
      .remove([template.file_path]);

    if (storageError) {
      console.error('⚠️ Erreur suppression fichier storage (continuons):', storageError);
    } else {
      console.log('✅ Fichier supprimé du storage');
    }

    // Delete template metadata
    const { error: deleteError } = await supabase
      .from('pdf_templates')
      .delete()
      .eq('id', templateId);

    if (deleteError) {
      console.error('❌ Erreur suppression métadonnées:', deleteError);
      throw new Error(`Failed to delete template: ${deleteError.message}`);
    }

    console.log('✅ Métadonnées template supprimées');

    // Delete associated mappings
    const { error: mappingError } = await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId);

    if (mappingError) {
      console.error('⚠️ Erreur suppression mappings (non critique):', mappingError);
    } else {
      console.log('✅ Mappings associés supprimés');
    }

    console.log('🗑️ DEBUG: Suppression template terminée:', templateId);
  }

  static async renameTemplate(templateId: string, newName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent renommer des templates.');
    }

    const { error } = await supabase
      .from('pdf_templates')
      .update({ name: newName })
      .eq('id', templateId);

    if (error) {
      throw new Error(`Failed to rename template: ${error.message}`);
    }
  }
}
