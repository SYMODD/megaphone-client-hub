
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto as uploadToClientPhotos } from "@/utils/storageUtils";

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - Upload vers client-photos");
      return await uploadToClientPhotos(imageBase64, documentType);
    } catch (error) {
      console.error("❌ Erreur upload photo client:", error);
      return null;
    }
  };

  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - Upload image code-barres vers barcode-images");
      
      setUploadProgress(0);

      // Vérifier que le bucket existe et est accessible
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error("❌ Erreur vérification buckets:", bucketsError);
        throw bucketsError;
      }

      const barcodeImagesBucket = buckets.find(bucket => bucket.name === 'barcode-images');
      if (!barcodeImagesBucket) {
        console.error("❌ Bucket 'barcode-images' non trouvé");
        toast.error("Configuration de stockage manquante");
        return null;
      }

      console.log("✅ Bucket 'barcode-images' trouvé et accessible");

      // Générer un nom de fichier unique
      const filename = `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      console.log("📝 Nom de fichier généré pour code-barres:", filename);

      // Upload du fichier
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("❌ Erreur upload code-barres:", error);
        throw error;
      }

      console.log("✅ Upload code-barres réussi:", data);

      // Obtenir l'URL publique
      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log("🌐 URL publique code-barres générée:", finalUrl);

      // Vérifier que l'URL est accessible
      try {
        const testResponse = await fetch(finalUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log("✅ URL code-barres vérifiée et accessible");
        } else {
          console.warn("⚠️ URL générée mais non accessible immédiatement");
        }
      } catch (testError) {
        console.warn("⚠️ Test d'accessibilité URL échoué:", testError);
      }

      setUploadProgress(100);
      return finalUrl;
    } catch (error) {
      console.error("❌ Erreur inattendue upload code-barres:", error);
      toast.error("Erreur lors de l'upload de l'image");
      setUploadProgress(0);
      return null;
    }
  };

  return {
    uploadClientPhoto,
    uploadBarcodeImage,
    uploadProgress
  };
};
