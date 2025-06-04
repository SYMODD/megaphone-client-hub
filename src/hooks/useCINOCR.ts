
import { useState } from "react";
import { extractCINData } from "@/services/cinOCRService";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");
  const { uploadBarcodeImage } = useImageUpload();

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    console.log("🔍 CIN OCR - Début du scan CIN");
    
    try {
      // Extraction OCR des données CIN uniquement
      console.log("📄 Extraction des données CIN via OCR...");
      const result = await extractCINData(file, apiKey);
      
      if (result.success && result.data) {
        console.log("✅ Données CIN extraites:", result.data);
        setRawText(result.rawText || "");
        setExtractedData(result.data);

        toast.success("✅ Données CIN extraites avec succès !", {
          duration: 4000
        });

        return result.data;
        
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
    console.log("🔄 Reset scan CIN");
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
