import { PDFTemplate } from './types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from './bucketManager';

export class TemplateOperations {
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

  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    // Vérifier la disponibilité du bucket et les permissions
    const bucketExists = await BucketManager.ensureBucket();
    if (!bucketExists) {
      throw new Error('Le bucket de stockage n\'est pas disponible. Vérifiez la configuration Supabase.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour uploader des templates.');
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent uploader des templates.');
    }

    const templateId = Date.now().toString();
    const filePath = `${user.id}/${templateId}_${fileName}`;

    console.log('Début du processus d\'upload...');
    console.log('Chemin d\'upload:', filePath);
    console.log('Taille du fichier:', file.size, 'bytes');
    console.log('Type de fichier:', file.type);
    console.log('ID utilisateur:', user.id);

    // Upload du fichier vers Supabase Storage avec gestion d'erreur détaillée
    const { data, error: uploadError } = await supabase.storage
      .from(BucketManager.getBucketName())
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Détails de l\'erreur d\'upload:', uploadError);
      console.error('Message d\'erreur:', uploadError.message);
      
      // Messages d'erreur plus explicites
      if (uploadError.message.toLowerCase().includes('duplicate') || uploadError.message.includes('already exists')) {
        throw new Error('Un fichier avec ce nom existe déjà. Veuillez renommer le fichier et réessayer.');
      } else if (uploadError.message.toLowerCase().includes('permission') || uploadError.message.toLowerCase().includes('policy')) {
        throw new Error('Permission refusée. Seuls les administrateurs peuvent uploader des templates.');
      } else if (uploadError.message.toLowerCase().includes('size') || uploadError.message.toLowerCase().includes('limit')) {
        throw new Error('Le fichier est trop volumineux. Utilisez un fichier plus petit.');
      } else if (uploadError.message.toLowerCase().includes('unauthorized') || uploadError.message.toLowerCase().includes('authentication')) {
        throw new Error('Authentification échouée. Reconnectez-vous et réessayez.');
      } else if (uploadError.message.toLowerCase().includes('forbidden') || uploadError.message.toLowerCase().includes('access')) {
        throw new Error('Accès interdit. Vérifiez les permissions de votre compte.');
      } else {
        throw new Error(`Échec de l'upload: ${uploadError.message}. Essayez à nouveau ou contactez le support.`);
      }
    }

    console.log('✅ Fichier uploadé avec succès vers:', data?.path);

    // Sauvegarde des métadonnées du template en base de données
    const { data: templateData, error: dbError } = await supabase
      .from('pdf_templates')
      .insert({
        id: templateId,
        user_id: user.id,
        name: fileName.replace('.pdf', ''),
        file_name: fileName,
        file_path: filePath,
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erreur lors de l\'insertion en base de données:', dbError);
      // Nettoyer le fichier uploadé si l'insertion en base échoue
      await supabase.storage.from(BucketManager.getBucketName()).remove([filePath]);
      throw new Error(`Échec de la sauvegarde des informations du template: ${dbError.message}`);
    }

    console.log('✅ Template sauvegardé avec succès:', templateData);

    return {
      id: templateData.id,
      name: templateData.name,
      fileName: templateData.file_name,
      uploadDate: templateData.upload_date,
      filePath: templateData.file_path
    };
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    try {
      console.log('Téléchargement du template:', template.filePath);
      
      const { data, error } = await supabase.storage
        .from(BucketManager.getBucketName())
        .download(template.filePath);

      if (error) {
        console.error('Erreur lors du téléchargement du template:', error);
        throw new Error(`Impossible de télécharger le template: ${error.message}`);
      }

      console.log('✅ Template téléchargé avec succès');
      return new File([data], template.fileName, { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier template:', error);
      return null;
    }
  }

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
