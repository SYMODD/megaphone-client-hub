
import { MRZData, OCRResult } from "@/types/ocrTypes";
import { performOCRRequest } from "./ocrAPI";
import { extractMRZData } from "./mrzDataExtractor";

export const scanPassportWithOCR = async (imageFile: File, apiKey: string = "K87783069388957"): Promise<OCRResult> => {
  try {
    console.log("Starting OCR scan for passport...");
    
    const result = await performOCRRequest(imageFile, apiKey);
    console.log("OCR API Response:", result);

    if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
      const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
      console.error("OCR processing failed:", errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";
    console.log("OCR parsed text:", parsedText);
    
    if (!parsedText.trim()) {
      return {
        success: false,
        error: "Aucun texte détecté dans l'image"
      };
    }

    const mrzData = extractMRZData(parsedText);
    console.log("Extracted MRZ data:", mrzData);

    return {
      success: true,
      data: mrzData,
      rawText: parsedText
    };
  } catch (error) {
    console.error("OCR Service Error:", error);
    
    let errorMessage = "Erreur de connexion à l'API OCR";
    
    if (error.message.includes("Timeout")) {
      errorMessage = "Le scan a pris trop de temps, veuillez réessayer";
    } else if (error.message.includes("connexion")) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export type { MRZData, OCRResponse, OCRResult } from "@/types/ocrTypes";
