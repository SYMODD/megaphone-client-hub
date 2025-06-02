
import { PDFTemplate } from './types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from './bucketManager';

export class TemplateOperations {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté, aucun template à charger');
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
        console.warn('Erreur lors de la synchronisation, mais continuons avec les données en base:', syncError);
      }

      // Récupérer les templates avec les nouvelles politiques RLS
      // Les politiques RLS s'occupent maintenant du filtrage automatiquement
      const { data: templates, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des templates:', error);
        throw new Error(`Impossible de charger les templates: ${error.message}`);
      }

      console.log('🔍 DEBUG: Templates récupérés:', templates?.length);
      console.log('🔍 DEBUG: Détails des templates:', templates);

      if (!templates || templates.length === 0) {
        console.log('⚠️ Aucun template accessible pour cet utilisateur');
        return [];
      }

      const accessibleTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      }));

      console.log(`✅ ${accessibleTemplates.length} template(s) accessible(s)`);
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

    // Get template to find file path
    const { data: template, error: getError } = await supabase
      .from('pdf_templates')
      .select('file_path')
      .eq('id', templateId)
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
      .eq('id', templateId);

    if (deleteError) {
      throw new Error(`Failed to delete template: ${deleteError.message}`);
    }

    // Delete associated mappings
    await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId);
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
