
import { useState } from "react";
import { extractCINData } from "@/services/cinOCRService";
import { toast } from "sonner";
import { uploadClientPhoto } from "@/utils/storageUtils";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    console.log("🔍 CIN OCR - Début du scan CIN UNIFIÉ");
    
    try {
      // 🎯 UPLOAD UNIQUE - SUPPRESSION DE LA DUPLICATION
      console.log("📤 CIN OCR - Upload unique de l'image CIN...");
      
      // Convertir le fichier en base64 pour l'upload
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Upload unique vers client-photos
      const uploadedUrl = await uploadClientPhoto(imageBase64, 'cin');
      
      if (!uploadedUrl) {
        console.error("❌ CIN OCR - Échec upload");
        toast.error("❌ Impossible d'uploader l'image CIN");
        return null;
      }

      console.log("✅ CIN OCR - Image uploadée une seule fois:", uploadedUrl);

      // Extraction OCR des données CIN
      console.log("📄 CIN OCR - Extraction des données via OCR...");
      const result = await extractCINData(file, apiKey);
      
      if (result.success && result.data) {
        console.log("✅ CIN OCR - Données extraites:", result.data);
        setRawText(result.rawText || "");
        
        // 🔑 AJOUT DE L'URL À L'OBJET DE DONNÉES
        const dataWithUrl = {
          ...result.data,
          photo_url: uploadedUrl // Assignation de l'URL uploadée
        };
        
        setExtractedData(dataWithUrl);

        toast.success("✅ Données CIN et image uploadées avec succès !", {
          duration: 4000
        });

        console.log("🔥 CIN OCR - Données finales avec URL:", dataWithUrl);
        return dataWithUrl;
        
      } else {
        console.error("❌ CIN OCR - Échec extraction:", result.error);
        toast.error(result.error || "❌ Impossible d'extraire les données CIN");
        return null;
      }
    } catch (error) {
      console.error("❌ CIN OCR - Erreur générale:", error);
      toast.error("❌ Erreur lors du scan CIN");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 CIN OCR - Reset scan");
    setExtractedData(null);
    setRawText("");
  };

  return {
    isScanning,
    extractedData,
    rawText,
    scanImage,
    resetScan
  };
};
