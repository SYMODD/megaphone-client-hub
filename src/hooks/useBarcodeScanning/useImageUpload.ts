
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 Upload de l'image du code-barres...");
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `barcode_${timestamp}_${randomId}.${fileExtension}`;
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload image code-barres:', error);
        return null;
      }

      // Obtenir l'URL publique
      const { data: publicUrl } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      console.log("✅ Image code-barres uploadée:", publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image code-barres:', error);
      return null;
    }
  };

  return {
    uploadBarcodeImage
  };
};
