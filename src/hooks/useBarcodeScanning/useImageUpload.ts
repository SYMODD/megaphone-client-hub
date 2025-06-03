
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 DÉBUT UPLOAD IMAGE BARCODE");
      console.log("📁 Fichier à uploader:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)}KB`
      });
      
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

  return {
    uploadBarcodeImage
  };
};
