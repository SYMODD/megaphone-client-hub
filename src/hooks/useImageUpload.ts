
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  // Upload pour les photos de clients (client-photos bucket)
  const uploadClientPhoto = async (imageBase64: string): Promise<string | null> => {
    try {
      console.log("📤 UPLOAD CLIENT PHOTO vers client-photos");
      
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      
      const filename = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('❌ Erreur upload photo client:', error);
        return null;
      }

      const { data: publicURL } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      console.log("✅ Photo client uploadée:", publicURL.publicUrl);
      return publicURL.publicUrl;
    } catch (error) {
      console.error('❌ Erreur upload photo client:', error);
      return null;
    }
  };

  // Upload pour les images de code-barres (barcode-images bucket)
  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 UPLOAD IMAGE BARCODE vers barcode-images");
      console.log("📁 Fichier:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)}KB`
      });
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `barcode_${timestamp}_${randomId}.${fileExtension}`;
      
      console.log("📝 Nom de fichier:", fileName);
      
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload barcode:', error);
        throw new Error(`Erreur upload: ${error.message}`);
      }

      console.log("✅ Upload réussi:", data);

      const { data: publicUrl } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicUrl.publicUrl;
      console.log("🌐 URL finale:", finalUrl);
      
      if (!finalUrl.includes('barcode-images')) {
        console.warn("⚠️ URL ne contient pas barcode-images");
      }
      
      return finalUrl;
    } catch (error) {
      console.error('❌ Erreur upload barcode:', error);
      throw error;
    }
  };

  return {
    uploadClientPhoto,
    uploadBarcodeImage
  };
};
