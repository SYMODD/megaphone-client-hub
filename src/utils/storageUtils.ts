
import { supabase } from "@/integrations/supabase/client";

export const ensureStorageBucket = async (bucketName: string = 'client-photos') => {
  try {
    console.log(`🔍 Tentative d'accès direct au bucket: ${bucketName}`);
    
    // Test d'accès direct au bucket en tentant de lister les fichiers
    const { error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listError) {
      console.warn(`⚠️ Erreur d'accès au bucket ${bucketName}:`, listError);
      return false;
    }
    
    console.log(`✅ Bucket ${bucketName} accessible et fonctionnel`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification du bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 UPLOAD PHOTO CLIENT - Début de l'upload vers client-photos");

    // Convertir base64 en blob
    const response = await fetch(imageBase64);
    const blob = await response.blob();
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${documentType}-${timestamp}-${randomId}.jpg`;
    
    console.log(`📝 Nom du fichier généré: ${filename}`);
    
    // Upload direct vers Supabase Storage (sans vérification préalable)
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

    // Obtenir l'URL publique
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
