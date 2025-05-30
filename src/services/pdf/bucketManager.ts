
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'pdf-templates';

export class BucketManager {
  static async ensureBucket(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return false;
      }

      const templatesBucket = buckets.find(bucket => bucket.name === BUCKET_NAME);
      
      if (!templatesBucket) {
        console.error(`Bucket ${BUCKET_NAME} not found. Please verify Supabase configuration.`);
        return false;
      }

      console.log(`Bucket ${BUCKET_NAME} found and ready`);
      return true;
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      return false;
    }
  }

  static async syncBucketWithDatabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Lister tous les fichiers du bucket pour cet utilisateur
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id);

      if (listError) {
        console.error('Error listing files from bucket:', listError);
        return;
      }

      console.log('Files found in bucket:', files);

      if (!files || files.length === 0) {
        console.log('No files found in bucket for user:', user.id);
        return;
      }

      // Récupérer les templates existants en base
      const { data: existingTemplates } = await supabase
        .from('pdf_templates')
        .select('file_path')
        .eq('user_id', user.id);

      const existingPaths = new Set(existingTemplates?.map(t => t.file_path) || []);

      // Créer les entrées manquantes en base de données
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const filePath = `${user.id}/${file.name}`;
          
          if (!existingPaths.has(filePath)) {
            console.log('Adding missing template to database:', file.name);
            
            // Extraire un ID unique du nom de fichier ou générer un nouveau
            const templateId = file.name.includes('_') 
              ? file.name.split('_')[0] 
              : Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
            
            const fileName = file.name;
            const templateName = fileName.replace('.pdf', '').replace(/^\d+_/, '');

            await supabase
              .from('pdf_templates')
              .insert({
                id: templateId,
                user_id: user.id,
                name: templateName,
                file_name: fileName,
                file_path: filePath,
                upload_date: file.created_at || new Date().toISOString()
              });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing bucket with database:', error);
    }
  }

  static getBucketName(): string {
    return BUCKET_NAME;
  }
}
