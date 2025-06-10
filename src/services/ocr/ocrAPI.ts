
import { OCRResponse } from "@/types/ocrTypes";
import { compressImage } from "@/utils/imageCompression";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const performOCRRequest = async (imageFile: File, apiKey: string = "K87783069388957"): Promise<OCRResponse> => {
  console.log("🚀 DÉBUT REQUÊTE OCR OPTIMISÉE");
  console.log("📁 Fichier original:", {
    name: imageFile.name,
    size: `${(imageFile.size / 1024).toFixed(1)}KB`,
    type: imageFile.type
  });
  
  // Compression intelligente pour optimiser l'OCR
  let processedFile = imageFile;
  const fileSizeKB = imageFile.size / 1024;
  
  if (fileSizeKB > 500) {
    console.log("🔄 Compression nécessaire pour optimiser l'OCR...");
    try {
      processedFile = await compressImage(imageFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        maxSizeKB: 500
      });
      console.log("✅ Image compressée:", `${(processedFile.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      console.warn("⚠️ Échec compression, utilisation fichier original");
      processedFile = imageFile;
    }
  }

  const formData = new FormData();
  formData.append('file', processedFile);
  formData.append('apikey', apiKey);
  formData.append('language', 'fre');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  formData.append('filetype', 'Auto');

  console.log("📋 Configuration OCR:", {
    apikey: apiKey.substring(0, 5) + "...",
    language: "fre",
    engine: "2",
    fileSize: `${(processedFile.size / 1024).toFixed(1)}KB`
  });

  // Système de retry avec timeouts progressifs
  const maxRetries = 3;
  const timeouts = [90000, 120000, 150000]; // 90s, 2min, 2.5min
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentTimeout = timeouts[attempt - 1];
    console.log(`🔄 TENTATIVE ${attempt}/${maxRetries} - Timeout: ${currentTimeout/1000}s`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ TIMEOUT après ${currentTimeout/1000}s - Annulation tentative ${attempt}`);
        controller.abort();
      }, currentTimeout);

      console.log("📡 Envoi requête OCR.space...");
      const startTime = Date.now();
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`✅ Réponse reçue en ${(elapsed/1000).toFixed(1)}s`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        if (response.status === 403) {
          const backoffTime = Math.min(3000 * attempt, 10000);
          if (attempt < maxRetries) {
            console.log(`🔄 Erreur 403, attente ${backoffTime}ms avant retry...`);
            await delay(backoffTime);
            continue;
          }
          throw new Error("Service OCR temporairement indisponible. Réessayez dans quelques minutes.");
        }
        
        if (response.status >= 500 && attempt < maxRetries) {
          console.log(`🔄 Erreur serveur ${response.status}, retry dans 5s...`);
          await delay(5000);
          continue;
        }
        
        throw new Error(`Erreur OCR ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ SUCCÈS OCR - Données reçues");
      return result;
      
    } catch (error) {
      const elapsed = Date.now() - Date.now();
      console.error(`❌ ÉCHEC tentative ${attempt}:`, {
        error: error.message,
        type: error.name,
        attempt: `${attempt}/${maxRetries}`
      });
      
      lastError = error;
      
      if (error.name === 'AbortError') {
        if (attempt < maxRetries) {
          console.log(`🔄 Timeout - Retry avec timeout plus long...`);
          await delay(2000);
          continue;
        }
        throw new Error(`Timeout: L'analyse a pris trop de temps (>${currentTimeout/1000}s). Essayez avec une image plus petite.`);
      }
      
      if (error.message.includes('Failed to fetch')) {
        if (attempt < maxRetries) {
          console.log(`🔄 Erreur réseau - Retry dans 5s...`);
          await delay(5000);
          continue;
        }
        throw new Error("Erreur de connexion. Vérifiez votre connexion internet.");
      }
      
      // Pour autres erreurs, pas de retry
      if (attempt === maxRetries) {
        break;
      }
    }
  }
  
  console.error("🔥 ÉCHEC DÉFINITIF après", maxRetries, "tentatives");
  throw lastError || new Error("Échec OCR après plusieurs tentatives");
};
