
import { OCRResponse } from "@/types/ocrTypes";

export const performOCRRequest = async (imageFile: File, apiKey: string = "helloworld"): Promise<OCRResponse> => {
  console.log("Preparing OCR request with API key:", apiKey.substring(0, 5) + "...");
  
  // Vérifier la taille du fichier
  const fileSizeKB = imageFile.size / 1024;
  console.log(`Image size: ${fileSizeKB.toFixed(1)}KB`);
  
  if (fileSizeKB > 1024) {
    console.warn("Image size is large, this might cause issues");
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('apikey', apiKey);
  formData.append('language', 'eng+fre+ara');
  formData.append('isOverlayRequired', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  formData.append('filetype', 'Auto');

  console.log("Sending image to OCR.space API...");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
      }
    });

    clearTimeout(timeoutId);

    console.log("OCR API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OCR API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log("OCR API response received:", result);
    
    return result;
  } catch (error) {
    console.error("OCR API request failed:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("Timeout: La requête OCR a pris trop de temps");
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error("Erreur de connexion: Impossible de joindre le service OCR. Vérifiez votre connexion internet.");
    }
    
    throw error;
  }
};
