
import { OCRResponse } from "@/types/ocrTypes";

export const performOCRRequest = async (imageFile: File, apiKey: string = "helloworld"): Promise<OCRResponse> => {
  console.log("=== DÉBUT DE LA REQUÊTE OCR ===");
  console.log("Preparing OCR request with API key:", apiKey.substring(0, 5) + "...");
  
  // Vérifier la taille du fichier
  const fileSizeKB = imageFile.size / 1024;
  console.log(`Image size: ${fileSizeKB.toFixed(1)}KB`);
  console.log(`Image type: ${imageFile.type}`);
  console.log(`Image name: ${imageFile.name}`);
  
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

  console.log("FormData prepared, parameters:");
  console.log("- apikey:", apiKey.substring(0, 5) + "...");
  console.log("- language: eng+fre+ara");
  console.log("- OCREngine: 2");
  console.log("- file size:", fileSizeKB.toFixed(1), "KB");

  console.log("Sending image to OCR.space API...");
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ TIMEOUT ATTEINT - Annulation de la requête après 60 secondes");
      controller.abort();
    }, 60000); // Augmenté à 60 secondes

    console.log("Making fetch request to OCR.space API...");
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Ne pas définir Content-Type, le navigateur le fera automatiquement avec boundary
      }
    });

    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    console.log(`Réponse reçue après ${elapsed}ms`);

    console.log("OCR API response status:", response.status);
    console.log("OCR API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OCR API error response:", errorText);
      console.error("Response status:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log("Parsing JSON response...");
    const result = await response.json();
    console.log("OCR API response received:", result);
    console.log("=== FIN DE LA REQUÊTE OCR (SUCCÈS) ===");
    
    return result;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`=== ERREUR OCR après ${elapsed}ms ===`);
    console.error("OCR API request failed:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    
    if (error.name === 'AbortError') {
      console.error("⏰ Requête annulée par timeout");
      throw new Error("Timeout: La requête OCR a pris trop de temps (plus de 60 secondes)");
    }
    
    if (error.message.includes('Failed to fetch')) {
      console.error("🌐 Erreur de connexion réseau");
      throw new Error("Erreur de connexion: Impossible de joindre le service OCR. Vérifiez votre connexion internet.");
    }
    
    console.error("🔥 Erreur inattendue:", error);
    throw error;
  }
};
