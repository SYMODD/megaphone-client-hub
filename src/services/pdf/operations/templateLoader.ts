
import { PDFTemplate } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateLoader {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🚫 Utilisateur non connecté, aucun template à charger');
        return [];
      }

      console.log('🔍 Chargement des templates pour l\'utilisateur:', user.id);

      // Vérifier l'accès au bucket avant de continuer
      const bucketAccessible = await BucketManager.ensureBucket();
      if (!bucketAccessible) {
        console.error('❌ Le bucket pdf-templates n\'est pas accessible');
        throw new Error('Le bucket de stockage des templates n\'est pas disponible. Vérifiez la configuration Supabase.');
      }

      console.log('✅ Bucket accessible, récupération des templates...');

      // Récupérer les templates avec la nouvelle structure RLS
      const { data: templates, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des templates:', error);
        throw new Error(`Impossible de charger les templates: ${error.message}`);
      }

      console.log('🔍 Templates récupérés:', templates?.length || 0);

      if (!templates || templates.length === 0) {
        console.log('⚠️ Aucun template accessible pour cet utilisateur');
        return [];
      }

      // Convertir les templates au format attendu
      const validTemplates: PDFTemplate[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      }));

      console.log(`✅ ${validTemplates.length} template(s) disponible(s)`);
      return validTemplates;
      
    } catch (error) {
      console.error('❌ Erreur complète lors du chargement des templates:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Erreur inconnue lors du chargement des templates');
      }
    }
  }
}
