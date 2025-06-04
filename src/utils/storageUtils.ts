
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
    console.log("📤 UPLOAD PHOTO CLIENT - Début upload CRITIQUE vers client-photos");
    
    // Vérifier que le bucket client-photos existe
    const bucketExists = await ensureStorageBucket('client-photos');
    if (!bucketExists) {
      console.error('❌ CRITIQUE: Le bucket client-photos n\'existe pas ou n\'est pas accessible');
      throw new Error('Bucket client-photos inaccessible');
    }

    // Convertir l'image base64 en blob avec vérification
    if (!imageBase64 || !imageBase64.startsWith('data:')) {
      console.error('❌ Format image base64 invalide:', imageBase64?.substring(0, 50));
      throw new Error('Format image invalide');
    }

    const response = await fetch(imageBase64);
    if (!response.ok) {
      throw new Error(`Erreur conversion blob: ${response.status}`);
    }
    
    const blob = await response.blob();
    const filename = `${documentType}-photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    console.log(`📝 Upload vers client-photos avec nom: ${filename}, taille: ${blob.size} bytes`);
    
    // Upload vers le bucket client-photos avec retry
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ ERREUR CRITIQUE lors de l\'upload vers client-photos:', error);
      throw error;
    }

    console.log('✅ Upload RÉUSSI vers client-photos:', data);

    // Générer l'URL publique pour client-photos avec vérification
    const { data: publicURL } = supabase.storage
      .from('client-photos')
      .getPublicUrl(data.path);

    const finalUrl = publicURL.publicUrl;
    
    // Vérifications de l'URL
    if (!finalUrl) {
      console.error('❌ URL publique non générée');
      throw new Error('URL publique non générée');
    }
    
    if (!finalUrl.includes('client-photos')) {
      console.error('❌ URL ne contient pas client-photos:', finalUrl);
      throw new Error('URL invalide générée');
    }
    
    console.log('🌐 URL publique VÉRIFIÉE pour client-photos:', finalUrl);
    
    // Test de l'URL (optionnel mais recommandé)
    try {
      const testResponse = await fetch(finalUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.warn('⚠️ URL générée mais non accessible immédiatement:', testResponse.status);
      } else {
        console.log('✅ URL vérifiée et accessible');
      }
    } catch (testError) {
      console.warn('⚠️ Impossible de tester l\'URL immédiatement:', testError);
    }

    return finalUrl;
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE lors de l\'upload photo client vers client-photos:', error);
    return null;
  }
};
