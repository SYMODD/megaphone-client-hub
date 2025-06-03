
import { MRZData, OCRResult } from "@/types/ocrTypes";
import { performOCRRequest } from "./ocrAPI";
import { extractMRZData } from "./mrzDataExtractor";

export const scanPassportWithOCR = async (imageFile: File, apiKey: string = "helloworld"): Promise<OCRResult> => {
  try {
    console.log("Starting OCR scan for passport...");
    
    const result = await performOCRRequest(imageFile, apiKey);
    console.log("OCR API Response:", result);

    if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
      return {
        success: false,
        error: result.ErrorMessage || "Erreur lors du traitement OCR"
      };
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";
    const mrzData = extractMRZData(parsedText);

    return {
      success: true,
      data: mrzData,
      rawText: parsedText
    };
  } catch (error) {
    console.error("OCR Service Error:", error);
    return {
      success: false,
      error: "Erreur de connexion à l'API OCR"
    };
  }
};

// Re-export types for backward compatibility
export type { MRZData, OCRResponse, OCRResult } from "@/types/ocrTypes";
