
import { supabase } from "@/integrations/supabase/client";

export const ensureStorageBucket = async (bucketName: string = 'client-photos') => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`Error listing buckets:`, error);
      return false;
    }

    const bucket = buckets.find(bucket => bucket.name === bucketName);
    
    if (!bucket) {
      console.warn(`Bucket ${bucketName} not found. Please create it in Supabase.`);
      return false;
    }

    console.log(`✅ Bucket ${bucketName} found and accessible`);
    return true;
  } catch (error) {
    console.error(`Error checking storage bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 DÉBUT UPLOAD IMAGE CLIENT");
    console.log("🎯 Type de document:", documentType);
    
    // Vérifier que le bucket client-photos existe
    const bucketExists = await ensureStorageBucket('client-photos');
    if (!bucketExists) {
      console.error('❌ Storage bucket client-photos does not exist');
      return null;
    }

    const response = await fetch(imageBase64);
    const blob = await response.blob();
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${documentType}-${timestamp}-${randomId}.jpg`;
    
    console.log("📁 Nom de fichier généré:", filename);
    console.log("🎯 Bucket cible: client-photos");
    
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload vers client-photos:', error);
      console.error('Code erreur:', error.message);
      return null;
    }

    console.log("✅ Upload réussi vers client-photos:", data);

    const { data: publicURL } = supabase.storage
      .from('client-photos')
      .getPublicUrl(data.path);

    console.log("🌐 URL publique générée:", publicURL.publicUrl);
    console.log("📤 FIN UPLOAD IMAGE CLIENT (SUCCÈS)");
    
    return publicURL.publicUrl;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de l\'image client:', error);
    return null;
  }
};

// Fonction spécifique pour les images de code-barres
export const uploadBarcodeImage = async (file: File): Promise<string | null> => {
  try {
    console.log("📤 DÉBUT UPLOAD IMAGE BARCODE");
    console.log("📁 Fichier à uploader:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)}KB`
    });
    
    // Vérifier que le bucket barcode-images existe
    const bucketExists = await ensureStorageBucket('barcode-images');
    if (!bucketExists) {
      console.error('❌ Storage bucket barcode-images does not exist');
      return null;
    }
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `barcode_${timestamp}_${randomId}.${fileExtension}`;
    
    console.log("📝 Nom de fichier généré:", fileName);
    console.log("🎯 Bucket cible: barcode-images");
    
    // Upload vers Supabase Storage dans le bucket barcode-images
    const { data, error } = await supabase.storage
      .from('barcode-images')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur upload vers barcode-images:', error);
      console.error('Code erreur:', error.message);
      return null;
    }

    console.log("✅ Upload réussi vers barcode-images:", data);

    // Obtenir l'URL publique
    const { data: publicUrl } = supabase.storage
      .from('barcode-images')
      .getPublicUrl(data.path);

    console.log("🌐 URL publique générée:", publicUrl.publicUrl);
    
    // Vérification finale
    if (publicUrl.publicUrl.includes('barcode-images')) {
      console.log("✅ VALIDATION: URL contient bien 'barcode-images'");
    } else {
      console.warn("⚠️ ATTENTION: URL ne contient pas 'barcode-images'");
    }
    
    console.log("📤 FIN UPLOAD IMAGE BARCODE (SUCCÈS)");
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de l\'image code-barres:', error);
    return null;
  }
};
