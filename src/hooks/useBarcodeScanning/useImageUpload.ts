
import { uploadBarcodeImage } from "@/utils/storageUtils";

export const useImageUpload = () => {
  const uploadImage = async (file: File): Promise<string | null> => {
    // Utiliser la fonction centralisée pour l'upload des images de code-barres
    return await uploadBarcodeImage(file);
  };

  return {
    uploadBarcodeImage: uploadImage
  };
};
