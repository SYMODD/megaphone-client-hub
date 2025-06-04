
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

      // Vérifier si le bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error("❌ Erreur vérification buckets:", bucketsError);
        throw bucketsError;
      }

      const barcodeImagesBucket = buckets.find(bucket => bucket.name === 'barcode-images');
      if (!barcodeImagesBucket) {
        console.error("❌ Bucket 'barcode-images' non trouvé");
        toast.error("Bucket de stockage non trouvé");
        return null;
      }

      const filename = `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      console.log("📝 Nom de fichier généré pour code-barres:", filename);

      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, file, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("❌ Erreur upload code-barres:", error);
        throw error;
      }

      console.log("✅ Upload code-barres réussi:", data);

      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log("🌐 URL publique code-barres générée:", finalUrl);

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
