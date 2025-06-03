
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const uploadImage = async (imageBase64: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  return {
    uploadImage
  };
};
