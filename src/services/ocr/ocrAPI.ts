
// Service OCR legacy pour compatibilité avec l'ancien code
// Utilise la logique centralisée de useOCRRequest

import { detectKeyType } from "./keyDetection";

interface OCRResponse {
  ParsedResults: Array<{
    TextOverlay: {
      Lines: Array<{
        LineText: string;
      }>;
    };
    ParsedText: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
  ProcessingTimeInMilliseconds?: number;
}

// Fonction pour encoder un fichier en base64 avec le bon format
const encodeFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      resolve(result);
    };
    
    reader.onerror = (error) => {
      reject(new Error("Impossible d'encoder l'image en base64"));
    };
    
    reader.readAsDataURL(file);
  });
};

// Configuration OCR selon le type de clé
const getOCRConfig = (apiKey: string) => {
  const isPro = detectKeyType(apiKey);
  
  if (isPro) {
    return {
      isPro: true,
      endpoints: [
        "https://apipro1.ocr.space/parse/image",
        "https://apipro2.ocr.space/parse/image"
      ],
      language: "fre",
      params: {
        isOverlayRequired: "false",
        detectOrientation: "true",
        scale: "true",
        OCREngine: "2",
        filetype: "Auto"
      }
    };
  } else {
    return {
      isPro: false,
      endpoints: ["https://api.ocr.space/parse/image"],
      language: "eng",
      params: {
        isOverlayRequired: "false",
        detectOrientation: "true",
        scale: "true",
        OCREngine: "2",
        filetype: "Auto"
      }
    };
  }
};

export const performOCRRequest = async (imageFile: File, apiKey: string = "helloworld"): Promise<OCRResponse> => {
  console.log("🔄 Utilisation du service OCR legacy - migration vers useOCRRequest recommandée");
  
  const config = getOCRConfig(apiKey);
  
  try {
    // Encoder l'image en base64
    const base64Image = await encodeFileToBase64(imageFile);
    
    // Préparation FormData
    const formData = new FormData();
    formData.append('base64Image', base64Image);
    formData.append('language', config.language);
    
    // Application des paramètres
    Object.entries(config.params).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Tentative sur le premier endpoint disponible
    const endpoint = config.endpoints[0];
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error("❌ Erreur service OCR legacy:", error);
    throw error;
  }
};
