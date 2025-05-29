
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
    try {
      console.log("Starting OCR scan for CIN...");
      
      const result = await performCINOCR(file, apiKey);
      console.log("CIN OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const cinData = extractCINData(parsedText);

      setExtractedData(cinData);
      setRawText(parsedText);
      toast.success("Données CIN extraites avec succès!");
      console.log("CIN extraction successful:", cinData);
      return cinData;
    } catch (error) {
      console.error("CIN OCR scan error:", error);
      toast.error("Erreur lors du scan OCR de la CIN");
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
