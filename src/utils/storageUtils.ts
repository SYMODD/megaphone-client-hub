import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

// Fonction utilitaire pour convertir base64 en Blob directement
const base64ToBlob = (base64Data: string, contentType: string = 'image/jpeg'): Blob => {
  // Extraire seulement les données base64 (enlever le préfixe data:image/jpeg;base64,)
  const base64WithoutPrefix = base64Data.split(',')[1] || base64Data;
  
  // Convertir base64 en bytes
  const bytes = atob(base64WithoutPrefix);
  const arrayBuffer = new ArrayBuffer(bytes.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < bytes.length; i++) {
    uint8Array[i] = bytes.charCodeAt(i);
  }
  
  return new Blob([arrayBuffer], { type: contentType });
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 UPLOAD PHOTO CLIENT - Début de l'upload vers client-photos");

    // ✨ FIX CSP : Convertir base64 en blob directement (sans fetch)
    console.log("🔄 Conversion base64 vers Blob...");
    const blob = base64ToBlob(imageBase64, 'image/jpeg');
    console.log("✅ Conversion réussie - Taille du blob:", blob.size, "bytes");
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${documentType}-${timestamp}-${randomId}.jpg`;
    
    console.log(`📝 Nom du fichier généré: ${filename}`);
    
    // Affichage du toast de progression
    toast.loading("📤 Upload de l'image du document...", { id: 'client-photo-upload' });
    
    // Upload direct vers Supabase Storage (sans vérification préalable)
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur lors de l\'upload vers client-photos:', error);
      toast.dismiss('client-photo-upload');
      toast.error('❌ Erreur lors de l\'upload de l\'image du document');
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

    toast.dismiss('client-photo-upload');
    
    // 🎉 MESSAGE DE SUCCÈS
    toast.success("📸 Image du document uploadée avec succès vers client-photos", {
      duration: 4000
    });

    return finalUrl;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'upload photo client:', error);
    toast.dismiss('client-photo-upload');
    toast.error('❌ Erreur lors de l\'upload de l\'image du document');
    return null;
  }
};