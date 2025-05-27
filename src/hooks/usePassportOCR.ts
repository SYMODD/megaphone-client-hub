
import { useState } from "react";
import { scanPassportWithOCR, MRZData } from "@/services/ocrService";
import { toast } from "sonner";

export const usePassportOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<MRZData | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for passport...");
      const result = await scanPassportWithOCR(file, apiKey);
      
      if (result.success && result.data) {
        setExtractedData(result.data);
        setRawText(result.rawText || "");
        toast.success("Données MRZ extraites avec succès!");
        console.log("OCR extraction successful:", result.data);
        return result.data;
      } else {
        toast.error(result.error || "Impossible d'extraire les données MRZ");
        console.error("OCR extraction failed:", result.error);
        return null;
      }
    } catch (error) {
      console.error("OCR scan error:", error);
      toast.error("Erreur lors du scan OCR");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
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
