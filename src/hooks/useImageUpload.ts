
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto as uploadToClientPhotos } from "@/utils/storageUtils";

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const ensureBucketExists = async (bucketName: string) => {
    try {
      console.log(`🔍 Vérification existence bucket: ${bucketName}`);
      
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("❌ Erreur lors de la liste des buckets:", listError);
        throw listError;
      }

      console.log("📋 Buckets trouvés:", buckets?.map(b => b.name) || []);
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        console.log(`✅ Bucket ${bucketName} existe`);
        return true;
      }

      console.log(`⚠️ Bucket ${bucketName} n'existe pas, tentative d'upload quand même`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur gestion bucket ${bucketName}:`, error);
      return false;
    }
  };

  const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
    try {
      console.log("📤 Upload photo client vers client-photos");
      return await uploadToClientPhotos(imageBase64, documentType);
    } catch (error) {
      console.error("❌ Erreur upload photo client:", error);
      return null;
    }
  };

  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 DÉBUT Upload image code-barres vers barcode-images");
      console.log("📄 Fichier:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      setUploadProgress(10);

      // S'assurer que le bucket existe
      const bucketReady = await ensureBucketExists('barcode-images');
      if (!bucketReady) {
        console.error("❌ Bucket barcode-images non disponible");
        return null;
      }

      setUploadProgress(30);

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.type.includes('png') ? 'png' : 'jpg';
      const filename = `barcode-${timestamp}-${randomId}.${fileExtension}`;
      
      console.log("📝 Nom de fichier généré:", filename);

      setUploadProgress(50);

      // Upload du fichier
      console.log("📤 Upload en cours...");
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("❌ Erreur upload:", error);
        setUploadProgress(0);
        return null;
      }

      setUploadProgress(80);
      console.log("✅ Upload réussi:", data);

      // Obtenir l'URL publique
      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log("🌐 URL publique générée:", finalUrl);

      // Vérification de l'URL
      if (!finalUrl || !finalUrl.includes('barcode-images')) {
        console.warn("⚠️ URL générée suspecte:", finalUrl);
        setUploadProgress(0);
        return null;
      }

      setUploadProgress(100);
      console.log("✅ SUCCÈS Upload image code-barres:", finalUrl);
      return finalUrl;
      
    } catch (error: any) {
      console.error("❌ Erreur inattendue upload:", error);
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
