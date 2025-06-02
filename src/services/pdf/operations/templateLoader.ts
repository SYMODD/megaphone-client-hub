
import { PDFTemplate } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateLoader {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🚫 DEBUG: Utilisateur non connecté, aucun template à charger');
        return [];
      }

      console.log('🔍 DEBUG: Chargement des templates pour l\'utilisateur:', user.id);

      // Vérifier l'accès au bucket avant de continuer
      const bucketAccessible = await BucketManager.ensureBucket();
      if (!bucketAccessible) {
        console.error('❌ Le bucket pdf-templates n\'est pas accessible');
        throw new Error('Le bucket de stockage des templates n\'est pas disponible. Vérifiez la configuration Supabase.');
      }

      console.log('✅ Bucket accessible, vérification des fichiers...');

      // Lister les fichiers dans le bucket pour vérifier leur existence
      const { data: files, error: listError } = await supabase.storage
        .from(BucketManager.getBucketName())
        .list(user.id);

      if (listError) {
        console.error('❌ Erreur listage fichiers:', listError);
      } else {
        console.log('📁 Fichiers dans le bucket:', files?.length || 0);
      }

      // Récupérer les templates avec requête simplifiée
      console.log('🔍 DEBUG: Requête SELECT sur pdf_templates...');
      const { data: templates, error, count } = await supabase
        .from('pdf_templates')
        .select('*', { count: 'exact' })
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des templates:', error);
        throw new Error(`Impossible de charger les templates: ${error.message}`);
      }

      console.log('🔍 DEBUG: Nombre total de templates dans la requête:', count);
      console.log('🔍 DEBUG: Templates récupérés (bruts):', templates);

      if (!templates || templates.length === 0) {
        console.log('⚠️ Aucun template accessible pour cet utilisateur');
        return [];
      }

      // Filtrer les templates qui ont des fichiers correspondants
      const validTemplates: PDFTemplate[] = [];
      
      for (const template of templates) {
        // Vérifier si le fichier existe vraiment dans le storage
        const { data: fileExists, error: checkError } = await supabase.storage
          .from(BucketManager.getBucketName())
          .download(template.file_path);

        if (!checkError && fileExists) {
          validTemplates.push({
            id: template.id,
            name: template.name,
            fileName: template.file_name,
            uploadDate: template.upload_date,
            filePath: template.file_path
          });
          console.log(`✅ Template valide: ${template.name}`);
        } else {
          console.log(`🗑️ Template orphelin détecté: ${template.name} (fichier inexistant)`);
          
          // Supprimer le template orphelin de la base de données
          await supabase
            .from('pdf_templates')
            .delete()
            .eq('id', template.id);
          
          // Supprimer les mappings associés
          await supabase
            .from('pdf_template_mappings')
            .delete()
            .eq('template_id', template.id);
          
          console.log(`🗑️ Template orphelin supprimé: ${template.name}`);
        }
      }

      console.log(`✅ ${validTemplates.length} template(s) valide(s) après vérification`);
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
