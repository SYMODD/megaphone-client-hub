
import { useState } from "react";
import { toast } from "sonner";
import { CINData } from "@/types/cinTypes";
import { extractCINData } from "@/utils/cinDataExtractor";
import { performCINOCR } from "@/services/cinOCRService";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<CINData | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string): Promise<CINData | null> => {
    setIsScanning(true);
    setExtractedData(null); // Reset previous data
    setRawText("");
    
    try {
      console.log("🔍 Starting OCR scan for CIN...");
      
      const result = await performCINOCR(file, apiKey);
      console.log("📄 CIN OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("❌ OCR Error:", errorMsg);
        toast.error(errorMsg);
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📝 Texte OCR brut:", parsedText);
      
      if (!parsedText.trim()) {
        console.warn("⚠️ Aucun texte détecté dans l'image");
        toast.warning("Aucun texte détecté dans l'image CIN");
        return null;
      }

      setRawText(parsedText);
      
      // Extraction des données CIN
      console.log("🔍 Extraction des données CIN...");
      const cinData = extractCINData(parsedText);
      console.log("📋 Données CIN extraites:", cinData);

      if (cinData && (cinData.nom || cinData.prenom || cinData.numero_cin)) {
        setExtractedData(cinData);
        console.log("✅ CIN extraction successful:", cinData);
        toast.success("Données CIN extraites avec succès!");
        return cinData;
      } else {
        console.warn("⚠️ Aucune donnée CIN valide extraite");
        toast.warning("Image scannée mais aucune donnée CIN détectée");
        return null;
      }
    } catch (error) {
      console.error("❌ CIN OCR scan error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Erreur lors du scan OCR de la CIN: ${errorMessage}`);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset CIN OCR scan data");
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
