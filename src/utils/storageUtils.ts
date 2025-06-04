
import { supabase } from "@/integrations/supabase/client";

export const ensureStorageBucket = async (bucketName: string = 'client-photos') => {
  try {
    console.log(`🔍 Vérification du bucket: ${bucketName}`);
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`❌ Erreur lors de la vérification des buckets:`, error);
      return false;
    }

    const bucket = buckets.find(bucket => bucket.name === bucketName);
    
    if (!bucket) {
      console.warn(`⚠️ Bucket ${bucketName} non trouvé.`);
      return false;
    }

    console.log(`✅ Bucket ${bucketName} trouvé et accessible`);
    
    // Test d'accès au bucket en tentant de lister les fichiers
    try {
      const { error: listError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });
      
      if (listError) {
        console.warn(`⚠️ Bucket ${bucketName} trouvé mais pas accessible:`, listError);
        return false;
      }
      
      console.log(`✅ Bucket ${bucketName} accessible et fonctionnel`);
      return true;
    } catch (accessError) {
      console.warn(`⚠️ Test d'accès au bucket ${bucketName} échoué:`, accessError);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification du bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 UPLOAD PHOTO CLIENT - Début de l'upload vers client-photos");
    
    // Vérifier que le bucket existe
    const bucketExists = await ensureStorageBucket('client-photos');
    if (!bucketExists) {
      console.error('❌ Le bucket client-photos n\'existe pas ou n\'est pas accessible');
      return null;
    }

    const response = await fetch(imageBase64);
    const blob = await response.blob();
    const filename = `${documentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    console.log(`📝 Nom du fichier généré: ${filename}`);
    
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur lors de l\'upload vers client-photos:', error);
      return null;
    }

    console.log('✅ Upload réussi vers client-photos:', data);

    const { data: publicURL } = supabase.storage
      .from('client-photos')
      .getPublicUrl(data.path);

    const finalUrl = publicURL.publicUrl;
    console.log('🌐 URL publique générée pour client-photos:', finalUrl);
    
    if (!finalUrl.includes('client-photos')) {
      console.warn('⚠️ URL ne contient pas client-photos');
    }

    return finalUrl;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'upload photo client:', error);
    return null;
  }
};
