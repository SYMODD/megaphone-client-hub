
import { PDFTemplate } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateSaver {
  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
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
      throw new Error('Seuls les administrateurs peuvent téléverser des templates.');
    }

    const bucketName = BucketManager.getBucketName();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    console.log('📤 Téléversement du template:', { fileName, filePath, bucketName });

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Erreur téléversement:', uploadError);
      throw new Error(`Échec du téléversement: ${uploadError.message}`);
    }

    console.log('✅ Fichier téléversé:', uploadData.path);

    // Save template metadata to database
    const templateData = {
      name: fileName.replace('.pdf', ''),
      file_name: fileName,
      file_path: filePath,
      user_id: user.id
    };

    const { data: template, error: dbError } = await supabase
      .from('pdf_templates')
      .insert(templateData)
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erreur base de données:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from(bucketName).remove([filePath]);
      throw new Error(`Échec de sauvegarde: ${dbError.message}`);
    }

    console.log('✅ Template sauvegardé:', template);

    // Return the PDFTemplate with all required properties
    return {
      id: template.id,
      name: template.name,
      fileName: template.file_name,
      uploadDate: template.upload_date,
      filePath: template.file_path,
      userId: template.user_id
    };
  }
}
