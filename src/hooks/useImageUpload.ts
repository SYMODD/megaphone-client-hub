
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
    try {
      console.log("📤 UPLOAD CLIENT PHOTO - Début upload vers client-photos");
      
      // Convertir base64 en blob
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      const filename = `${documentType}-photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      console.log(`📝 Filename généré: ${filename}`);
      
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, { 
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload client-photos:', error);
        toast.error('Erreur lors de l\'upload de la photo client');
        return null;
      }

      console.log('✅ Upload client-photos réussi:', data);

      const { data: publicURL } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log('🌐 URL publique client-photos:', finalUrl);
      
      return finalUrl;
    } catch (error) {
      console.error('❌ Erreur inattendue upload client-photos:', error);
      toast.error('Erreur lors de l\'upload de la photo');
      return null;
    }
  };

  const uploadBarcodeImage = async (imageFile: File): Promise<string | null> => {
    try {
      console.log("📤 UPLOAD BARCODE IMAGE - Début upload vers barcode-images");
      
      const filename = `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      console.log(`📝 Barcode filename généré: ${filename}`);
      
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, imageFile, { 
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload barcode-images:', error);
        toast.error('Erreur lors de l\'upload de l\'image code-barres');
        return null;
      }

      console.log('✅ Upload barcode-images réussi:', data);

      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log('🌐 URL publique barcode-images:', finalUrl);
      
      return finalUrl;
    } catch (error) {
      console.error('❌ Erreur inattendue upload barcode-images:', error);
      toast.error('Erreur lors de l\'upload de l\'image code-barres');
      return null;
    }
  };

  return {
    uploadClientPhoto,
    uploadBarcodeImage
  };
};
