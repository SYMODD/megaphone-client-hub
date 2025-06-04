
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
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification du bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 UPLOAD PHOTO CLIENT - Début de l'upload vers client-photos");
    
    // Vérifier que le bucket client-photos existe
    const bucketExists = await ensureStorageBucket('client-photos');
    if (!bucketExists) {
      console.error('❌ Le bucket client-photos n\'existe pas ou n\'est pas accessible');
      return null;
    }

    // Convertir l'image base64 en blob
    const response = await fetch(imageBase64);
    const blob = await response.blob();
    const filename = `${documentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    console.log(`📝 Upload vers client-photos avec nom: ${filename}`);
    
    // Upload vers le bucket client-photos
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

    // Générer l'URL publique pour client-photos
    const { data: publicURL } = supabase.storage
      .from('client-photos')
      .getPublicUrl(data.path);

    const finalUrl = publicURL.publicUrl;
    console.log('🌐 URL publique générée pour client-photos:', finalUrl);
    
    // Vérifier que l'URL contient bien client-photos
    if (!finalUrl.includes('client-photos')) {
      console.warn('⚠️ URL ne contient pas client-photos, problème potentiel');
    }

    return finalUrl;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'upload photo client vers client-photos:', error);
    return null;
  }
};
