
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'pdf-templates';

export class BucketManager {
  static async ensureBucket(): Promise<boolean> {
    try {
      console.log(`Vérification du bucket: ${BUCKET_NAME}`);
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Erreur lors de la récupération des buckets:', error);
        console.error('Message d\'erreur détaillé:', error.message);
        return false;
      }

      console.log('Buckets disponibles:', buckets?.map(b => b.name));

      const templatesBucket = buckets?.find(bucket => bucket.name === BUCKET_NAME);
      
      if (!templatesBucket) {
        console.error(`❌ Le bucket "${BUCKET_NAME}" n'a pas été trouvé dans la liste des buckets disponibles`);
        console.error(`Buckets existants: ${buckets?.map(b => b.name).join(', ') || 'aucun'}`);
        return false;
      }

      console.log(`✅ Bucket "${BUCKET_NAME}" trouvé et accessible`);
      console.log('Détails du bucket:', templatesBucket);
      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de la vérification du bucket:', error);
      return false;
    }
  }

  static async testBucketAccess(): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Test d'accès au bucket: ${BUCKET_NAME}`);

      // Test de listage des fichiers
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });

      if (listError) {
        console.error('Erreur lors du test de listage:', listError);
        return {
          success: false,
          message: `Erreur d'accès au bucket "${BUCKET_NAME}": ${listError.message}`
        };
      }

      console.log(`✅ Test d'accès au bucket réussi. Fichiers trouvés:`, files?.length || 0);
      return {
        success: true,
        message: `Bucket "${BUCKET_NAME}" accessible. ${files?.length || 0} fichier(s) dans le répertoire racine.`
      };
    } catch (error) {
      console.error('Erreur lors du test d\'accès:', error);
      return {
        success: false,
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  static async syncBucketWithDatabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté, synchronisation ignorée');
        return;
      }

      console.log(`Synchronisation du bucket "${BUCKET_NAME}" avec la base de données pour l'utilisateur:`, user.id);

      // Test d'accès avant synchronisation
      const accessTest = await this.testBucketAccess();
      if (!accessTest.success) {
        console.error('Échec du test d\'accès au bucket:', accessTest.message);
        throw new Error(accessTest.message);
      }

      // Lister tous les fichiers du bucket pour cet utilisateur
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id);

      if (listError) {
        console.error('Erreur lors du listage des fichiers du bucket:', listError);
        console.error('Détails de l\'erreur:', listError.message);
        throw new Error(`Impossible de lister les fichiers: ${listError.message}`);
      }

      console.log(`Fichiers trouvés dans le bucket pour l'utilisateur ${user.id}:`, files);

      if (!files || files.length === 0) {
        console.log('Aucun fichier trouvé dans le bucket pour cet utilisateur');
        return;
      }

      // Récupérer les templates existants en base
      const { data: existingTemplates } = await supabase
        .from('pdf_templates')
        .select('file_path')
        .eq('user_id', user.id);

      const existingPaths = new Set(existingTemplates?.map(t => t.file_path) || []);
      console.log('Templates existants en base:', existingPaths);

      // Créer les entrées manquantes en base de données
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const filePath = `${user.id}/${file.name}`;
          
          if (!existingPaths.has(filePath)) {
            console.log('Ajout du template manquant en base de données:', file.name);
            
            // Extraire un ID unique du nom de fichier ou générer un nouveau
            const templateId = file.name.includes('_') 
              ? file.name.split('_')[0] 
              : Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
            
            const fileName = file.name;
            const templateName = fileName.replace('.pdf', '').replace(/^\d+_/, '');

            const { error: insertError } = await supabase
              .from('pdf_templates')
              .insert({
                id: templateId,
                user_id: user.id,
                name: templateName,
                file_name: fileName,
                file_path: filePath,
                upload_date: file.created_at || new Date().toISOString()
              });

            if (insertError) {
              console.error('Erreur lors de l\'insertion du template:', insertError);
            } else {
              console.log(`✅ Template "${templateName}" ajouté en base de données`);
            }
          }
        }
      }

      console.log('Synchronisation terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de la synchronisation bucket/base de données:', error);
      throw error;
    }
  }

  static getBucketName(): string {
    return BUCKET_NAME;
  }
}
