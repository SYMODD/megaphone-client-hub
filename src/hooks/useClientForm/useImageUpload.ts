
import { uploadClientPhoto } from "@/utils/storageUtils";
import { toast } from "sonner";

export const useImageUpload = () => {
  const uploadImage = async (imageBase64: string): Promise<string | null> => {
    try {
      console.log("📤 Upload d'image client en cours...");
      
      // Utiliser la fonction centralisée pour l'upload des photos clients
      const photoUrl = await uploadClientPhoto(imageBase64, 'document_scan');
      
      if (!photoUrl) {
        console.error('❌ Échec de l\'upload de l\'image');
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      console.log("✅ Image client uploadée avec succès:", photoUrl);
      return photoUrl;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  return {
    uploadImage
  };
};
