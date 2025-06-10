
import { toast } from "sonner";

export const useOCRRequest = () => {
  const performOCR = async (file: File, apiKey: string): Promise<string> => {
    console.log("Starting automatic document type detection...");
    
    // Première étape : OCR pour obtenir le texte
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');  // Changé de 'eng+fre' à 'eng'
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("OCR API Response:", result);

    if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
      const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    return result.ParsedResults[0]?.ParsedText || "";
  };

  return { performOCR };
};
