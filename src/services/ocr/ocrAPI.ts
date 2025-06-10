
import { OCRResponse } from "@/types/ocrTypes";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  formData.append('language', 'eng');  // Changé de 'eng+fre+ara' à 'eng'
  formData.append('isOverlayRequired', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  formData.append('filetype', 'Auto');

  console.log("FormData prepared, parameters:");
  console.log("- apikey:", apiKey.substring(0, 5) + "...");
  console.log("- language: eng");  // Mise à jour du log
  console.log("- OCREngine: 2");
  console.log("- file size:", fileSizeKB.toFixed(1), "KB");

  // Système de retry avec backoff exponentiel
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Tentative ${attempt}/${maxRetries} - Sending image to OCR.space API...`);
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ TIMEOUT ATTEINT - Annulation de la requête après 60 secondes");
        controller.abort();
      }, 60000);

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
      console.log(`Réponse reçue après ${elapsed}ms (tentative ${attempt})`);

      console.log("OCR API response status:", response.status);
      console.log("OCR API response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error response:", errorText);
        console.error("Response status:", response.status, response.statusText);
        
        // Gestion spéciale pour l'erreur 403 (limite de connexions)
        if (response.status === 403 && errorText.includes("concurrent connections")) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Backoff exponentiel max 10s
          console.log(`🔄 Limite de connexions atteinte. Attente de ${waitTime}ms avant nouvelle tentative...`);
          
          if (attempt < maxRetries) {
            await delay(waitTime);
            continue; // Retry
          } else {
            throw new Error("La clé API OCR est temporairement surchargée. Veuillez réessayer dans quelques minutes ou utiliser votre propre clé API.");
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      console.log("Parsing JSON response...");
      const result = await response.json();
      console.log("OCR API response received:", result);
      console.log("=== FIN DE LA REQUÊTE OCR (SUCCÈS) ===");
      
      return result;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`=== ERREUR OCR tentative ${attempt} après ${elapsed}ms ===`);
      console.error("OCR API request failed:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.error("⏰ Requête annulée par timeout");
        if (attempt < maxRetries) {
          console.log(`🔄 Timeout - tentative ${attempt + 1} dans 2 secondes...`);
          await delay(2000);
          continue;
        } else {
          throw new Error("Timeout: La requête OCR a pris trop de temps (plus de 60 secondes). Veuillez réessayer avec une image plus petite.");
        }
      }
      
      if (error.message.includes('Failed to fetch')) {
        console.error("🌐 Erreur de connexion réseau");
        if (attempt < maxRetries) {
          console.log(`🔄 Erreur réseau - tentative ${attempt + 1} dans 3 secondes...`);
          await delay(3000);
          continue;
        } else {
          throw new Error("Erreur de connexion: Impossible de joindre le service OCR. Vérifiez votre connexion internet.");
        }
      }
      
      // Pour les autres erreurs, on ne retry pas
      break;
    }
  }
  
  // Si on arrive ici, toutes les tentatives ont échoué
  console.error("🔥 Toutes les tentatives ont échoué");
  throw lastError || new Error("Erreur inconnue lors de la requête OCR");
};
