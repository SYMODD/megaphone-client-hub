
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

      // Récupérer le profil utilisateur pour debug
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil utilisateur:', profileError);
        throw new Error(`Impossible de récupérer le profil utilisateur: ${profileError.message}`);
      }

      console.log('🔍 DEBUG: Rôle de l\'utilisateur actuel:', profile?.role);

      // Vérifier l'accès au bucket avant de continuer
      const bucketAccessible = await BucketManager.ensureBucket();
      if (!bucketAccessible) {
        console.error('❌ Le bucket pdf-templates n\'est pas accessible');
        throw new Error('Le bucket de stockage des templates n\'est pas disponible. Vérifiez la configuration Supabase.');
      }

      console.log('✅ Bucket accessible, synchronisation en cours...');

      // Synchroniser le bucket avec la base de données
      try {
        await BucketManager.syncBucketWithDatabase();
      } catch (syncError) {
        console.warn('⚠️ Erreur lors de la synchronisation, mais continuons avec les données en base:', syncError);
      }

      // Test direct de la fonction RLS
      console.log('🔍 DEBUG: Test direct de la fonction get_current_user_role()...');
      const { data: roleTest, error: roleError } = await supabase.rpc('get_current_user_role');
      if (roleError) {
        console.error('❌ Erreur lors du test de la fonction get_current_user_role:', roleError);
      } else {
        console.log('🔍 DEBUG: Fonction get_current_user_role() retourne:', roleTest);
      }

      // Récupérer les templates avec requête simplifiée (sans join)
      console.log('🔍 DEBUG: Requête SELECT sur pdf_templates...');
      const { data: templates, error, count } = await supabase
        .from('pdf_templates')
        .select('*', { count: 'exact' })
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des templates:', error);
        console.error('❌ Code d\'erreur:', error.code);
        console.error('❌ Message d\'erreur:', error.message);
        console.error('❌ Détails:', error.details);
        throw new Error(`Impossible de charger les templates: ${error.message}`);
      }

      console.log('🔍 DEBUG: Nombre total de templates dans la requête:', count);
      console.log('🔍 DEBUG: Templates récupérés (bruts):', templates);

      if (!templates || templates.length === 0) {
        console.log('⚠️ Aucun template accessible pour cet utilisateur selon les politiques RLS');
        return [];
      }

      // Analyser chaque template en détail
      templates.forEach((template, index) => {
        console.log(`🔍 DEBUG: Template ${index + 1}:`, {
          id: template.id,
          name: template.name,
          user_id: template.user_id,
          current_user: user.id,
          is_owner: template.user_id === user.id
        });
      });

      const accessibleTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      }));

      console.log(`✅ ${accessibleTemplates.length} template(s) accessible(s) après traitement`);
      console.log('🔍 DEBUG: Templates finaux retournés:', accessibleTemplates);
      
      return accessibleTemplates;
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
