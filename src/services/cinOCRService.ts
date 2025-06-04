
import { CINOCRResult } from "@/types/cinTypes";

export const performCINOCR = async (file: File, apiKey: string): Promise<CINOCRResult> => {
  console.log("🔍 CIN OCR - Début de la requête avec clé API:", apiKey.substring(0, 5) + "...");
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apikey', apiKey);
  formData.append('language', 'eng+fre+ara'); // Support multiple languages
  formData.append('isOverlayRequired', 'false'); // Réduire la charge
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  formData.append('filetype', 'Auto');

  console.log("📤 Envoi de la requête OCR pour CIN...");
  const startTime = Date.now();

  // Timeout plus court pour éviter les blocages
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("⏰ TIMEOUT OCR - Annulation après 45 secondes");
    controller.abort();
  }, 45000);

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    console.log(`📥 Réponse OCR reçue après ${elapsed}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur HTTP OCR:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log("📋 Réponse OCR complète:", result);
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Timeout: L'analyse OCR a pris trop de temps. Veuillez réessayer avec une image plus petite.");
    }
    throw error;
  }
};
