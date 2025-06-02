
import { PDFTemplate } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateSaver {
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
}
