
import { supabase } from '@/integrations/supabase/client';

export interface SharedTemplate {
  id: string;
  template_id: string;
  shared_by: string;
  shared_with_role: string | null;
  created_at: string;
}

export class SharedTemplateOperations {
  static async shareTemplate(templateId: string, role: string | null = null): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('shared_pdf_templates')
      .insert({
        template_id: templateId,
        shared_by: user.id,
        shared_with_role: role
      });

    if (error) {
      throw new Error(`Failed to share template: ${error.message}`);
    }
  }

  static async unshareTemplate(templateId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('shared_pdf_templates')
      .delete()
      .eq('template_id', templateId);

    if (error) {
      throw new Error(`Failed to unshare template: ${error.message}`);
    }
  }

  static async getSharedTemplateIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // Récupérer le profil de l'utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return [];
    }

    // Récupérer les templates partagés avec ce rôle ou partagés globalement
    const { data, error } = await supabase
      .from('shared_pdf_templates')
      .select('template_id')
      .or(`shared_with_role.is.null,shared_with_role.eq.${profile.role}`);

    if (error) {
      console.error('Error fetching shared templates:', error);
      return [];
    }

    return data?.map(item => item.template_id) || [];
  }

  static async getTemplateShareInfo(templateId: string): Promise<SharedTemplate | null> {
    const { data, error } = await supabase
      .from('shared_pdf_templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
