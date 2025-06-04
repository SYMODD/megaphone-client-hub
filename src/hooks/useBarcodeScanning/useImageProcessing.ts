
import { useState } from "react";

export const useImageProcessing = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = async (file: File): Promise<string> => {
    try {
      setIsCompressing(true);
      console.log("🔄 Compression de l'image pour aperçu");
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          console.log("✅ Image compressée pour aperçu");
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error("Erreur lors de la lecture du fichier"));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("❌ Erreur compression image:", error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  };

  return {
    compressImage,
    isCompressing
  };
};
