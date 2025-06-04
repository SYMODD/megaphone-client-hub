
import { CINOCRResult } from "@/types/cinTypes";
import { extractCINData as extractDataFromText } from "@/utils/cinDataExtractor";

export const performCINOCR = async (file: File, apiKey: string): Promise<CINOCRResult> => {
  console.log("🔍 CIN OCR - Début de la requête avec clé API:", apiKey.substring(0, 5) + "...");
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('apikey', apiKey);
  formData.append('language', 'eng'); // Changé de 'eng+fre+ara' à 'eng'
  formData.append('isOverlayRequired', 'false');
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

export const extractCINData = async (file: File, apiKey: string) => {
  console.log("🔍 CIN SERVICE - Début extraction données CIN");
  
  try {
    // 1. Effectuer l'OCR
    const ocrResult = await performCINOCR(file, apiKey);
    
    if (!ocrResult || ocrResult.IsErroredOnProcessing) {
      console.error("❌ Erreur OCR:", ocrResult?.ErrorMessage || "Erreur inconnue");
      return {
        success: false,
        error: ocrResult?.ErrorMessage || "Erreur lors de l'analyse OCR"
      };
    }

    // 2. Extraire le texte de la réponse OCR
    let rawText = "";
    if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
      rawText = ocrResult.ParsedResults[0].ParsedText || "";
    }

    console.log("📄 Texte OCR extrait:", rawText.substring(0, 200) + "...");

    if (!rawText.trim()) {
      console.warn("⚠️ Aucun texte détecté dans l'image");
      return {
        success: false,
        error: "Aucun texte détecté dans l'image"
      };
    }

    // 3. Extraire les données CIN du texte
    const extractedData = extractDataFromText(rawText);
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
      console.warn("⚠️ Aucune donnée CIN identifiée");
      return {
        success: false,
        error: "Aucune donnée CIN identifiée dans le texte",
        rawText
      };
    }

    console.log("✅ Données CIN extraites:", extractedData);
    
    return {
      success: true,
      data: extractedData,
      rawText
    };

  } catch (error) {
    console.error("❌ Erreur extraction CIN:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue lors de l'extraction"
    };
  }
};
