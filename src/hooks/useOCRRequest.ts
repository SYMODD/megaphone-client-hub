
import { useState } from "react";
import { toast } from "sonner";
import { detectKeyType } from "@/services/ocr/keyDetection";

interface OCRConfig {
  isPro: boolean;
  endpoints: string[];
  language: string;
  params: Record<string, string>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Export de la fonction de détection pour compatibilité
export { detectKeyType };

// Fonction de validation du format base64 image
const isValidBase64Image = (base64String: string): boolean => {
  return base64String.startsWith('data:image/jpeg;base64,') || 
         base64String.startsWith('data:image/png;base64,') ||
         base64String.startsWith('data:image/jpg;base64,') ||
         base64String.startsWith('data:image/webp;base64,');
};

// Fonction pour encoder un fichier en base64 avec le bon format
const encodeFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      console.log("🖼️ Image encodée - Vérification format:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: `${Math.round(file.size / 1024)}KB`,
        encodedPrefix: result.substring(0, 50) + "...",
        startsWithDataImage: result.startsWith('data:image/'),
        isValidFormat: isValidBase64Image(result)
      });
      
      // Contrôle de développement critique
      if (!result.startsWith('data:image/')) {
        console.error("🚨 ALERTE DÉVELOPPEUR - Format base64 invalide:", {
          expected: "data:image/[type];base64,...",
          received: result.substring(0, 50) + "...",
          fileName: file.name,
          action: "ARRÊT DE LA REQUÊTE OCR"
        });
        reject(new Error(`Format d'image invalide. Attendu: data:image/[type];base64,... Reçu: ${result.substring(0, 30)}...`));
        return;
      }
      
      if (!isValidBase64Image(result)) {
        console.warn("⚠️ Format d'image non standard mais acceptable:", result.substring(0, 50));
      }
      
      resolve(result);
    };
    
    reader.onerror = (error) => {
      console.error("❌ Erreur encodage base64:", error);
      reject(new Error("Impossible d'encoder l'image en base64"));
    };
    
    // CORRECTION CRITIQUE : Utiliser readAsDataURL au lieu d'autres méthodes
    reader.readAsDataURL(file);
  });
};

// Configuration centralisée selon les spécifications OCR.space PRO
const getOCRConfig = (apiKey: string): OCRConfig => {
  const isPro = detectKeyType(apiKey);
  
  if (isPro) {
    console.log("🔑 CONFIGURATION PRO OCR.space - Headers + Base64");
    return {
      isPro: true,
      endpoints: [
        "https://apipro1.ocr.space/parse/image",
        "https://apipro2.ocr.space/parse/image"
      ],
      language: "fre", // Langue unique pour PRO
      params: {
        isOverlayRequired: "false",
        detectOrientation: "true",
        scale: "true",
        OCREngine: "2",
        filetype: "Auto"
      }
    };
  } else {
    console.log("🔑 CONFIGURATION FREE OCR.space - Base64 + Fallback");
    return {
      isPro: false,
      endpoints: ["https://api.ocr.space/parse/image"],
      language: "eng", // Anglais pour FREE
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

export const useOCRRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const performOCR = async (file: File, apiKey: string = "helloworld"): Promise<string> => {
    console.log("🚀 === DÉBUT REQUÊTE OCR CENTRALISÉE AVEC BASE64 ===");
    
    if (!apiKey || apiKey.length < 3) {
      throw new Error("Clé API OCR invalide ou manquante");
    }

    const config = getOCRConfig(apiKey);
    setIsLoading(true);

    console.log("📊 Configuration OCR centralisée:", {
      apiKey: apiKey.substring(0, 8) + "...",
      keyType: config.isPro ? "PRO" : "FREE",
      endpoints: config.endpoints,
      language: config.language,
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)}KB`
    });

    try {
      // CORRECTION CRITIQUE : Encoder l'image en base64 avec le bon format
      console.log("🔄 Encodage image en base64...");
      const base64Image = await encodeFileToBase64(file);
      
      console.log("✅ Image encodée avec succès:", {
        format: base64Image.substring(0, 30) + "...",
        length: base64Image.length,
        isValid: isValidBase64Image(base64Image)
      });

      // Préparation FormData avec base64Image au lieu du fichier
      const formData = new FormData();
      formData.append('base64Image', base64Image); // CORRECTION : Utiliser base64Image
      formData.append('language', config.language);
      
      // Application des paramètres
      Object.entries(config.params).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log("📋 Paramètres appliqués:", {
        base64ImagePrefix: base64Image.substring(0, 50) + "...",
        language: config.language,
        ...config.params
      });

      let lastError: Error | null = null;

      // Tentative sur chaque endpoint
      for (let endpointIndex = 0; endpointIndex < config.endpoints.length; endpointIndex++) {
        const endpoint = config.endpoints[endpointIndex];
        const maxRetries = config.isPro ? 2 : 3;

        console.log(`🌐 TENTATIVE ENDPOINT ${endpointIndex + 1}/${config.endpoints.length}: ${endpoint}`);

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          console.log(`🔄 Tentative ${attempt}/${maxRetries} sur ${endpoint}`);
          const startTime = Date.now();

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log("⏰ TIMEOUT - Annulation après 30 secondes");
              controller.abort();
            }, 30000);

            console.log("📡 Headers d'authentification:", { apikey: apiKey.substring(0, 8) + "..." });
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'apikey': apiKey // CLÉ UNIQUEMENT DANS LES HEADERS selon spécifications
              },
              body: formData,
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            const elapsed = Date.now() - startTime;
            console.log(`📥 Réponse reçue après ${elapsed}ms - Status: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Erreur HTTP:", {
                status: response.status,
                endpoint,
                keyType: config.isPro ? 'PRO' : 'FREE',
                body: errorText.substring(0, 200),
                imageFormat: base64Image.substring(0, 30) + "..."
              });
              
              // Gestion d'erreurs spécifique
              if (response.status === 403) {
                if (errorText.includes("Not a valid base64 image")) {
                  throw new Error(`Format d'image base64 invalide. Vérifiez l'encodage: ${base64Image.substring(0, 50)}...`);
                }
                if (config.isPro) {
                  if (errorText.includes("API key") || errorText.includes("apikey")) {
                    throw new Error(`Clé API PRO invalide sur ${endpoint}. Vérifiez votre clé OCR.space`);
                  }
                }
                throw new Error(`Accès refusé sur ${endpoint}. Limite atteinte ou clé invalide.`);
              }
              
              if (response.status === 402) {
                throw new Error("Crédit OCR.space épuisé. Rechargez votre compte");
              }
              
              if (response.status === 401) {
                throw new Error("Clé API OCR.space invalide");
              }
              
              throw new Error(`Erreur HTTP ${response.status} sur ${endpoint}: ${errorText.substring(0, 100)}`);
            }

            const result = await response.json();
            
            console.log("📊 Analyse réponse:", {
              OCRExitCode: result.OCRExitCode,
              IsErroredOnProcessing: result.IsErroredOnProcessing,
              ProcessingTime: result.ProcessingTimeInMilliseconds + "ms",
              endpoint,
              keyType: config.isPro ? 'PRO' : 'FREE'
            });

            if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
              const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
              console.error("❌ Erreur OCR:", errorMessage);
              throw new Error(errorMessage);
            }

            const parsedText = result.ParsedResults[0]?.ParsedText || "";
            
            if (!parsedText.trim()) {
              console.warn("⚠️ Aucun texte détecté");
              throw new Error("Aucun texte détecté dans l'image");
            }

            console.log("✅ OCR RÉUSSI:", {
              textLength: parsedText.length,
              endpoint,
              keyType: config.isPro ? 'PRO' : 'FREE',
              processingTime: result.ProcessingTimeInMilliseconds + "ms"
            });
            
            setIsLoading(false);
            return parsedText;
            
          } catch (error) {
            const elapsed = Date.now() - startTime;
            console.error(`❌ Erreur tentative ${attempt} après ${elapsed}ms:`, error.message);
            lastError = error;
            
            if (error.name === 'AbortError') {
              if (attempt < maxRetries) {
                await delay(2000);
                continue;
              }
            }
            
            if (error.message.includes('Failed to fetch')) {
              if (attempt < maxRetries) {
                const waitTime = config.isPro ? 2000 * attempt : 3000 * attempt;
                console.log(`🔄 Erreur réseau - retry dans ${waitTime}ms...`);
                await delay(waitTime);
                continue;
              }
            }
            
            // Ne pas retry sur les erreurs d'authentification
            if (error.message.includes("invalide") || 
                error.message.includes("épuisé") || 
                error.message.includes("403") ||
                error.message.includes("401") ||
                error.message.includes("base64 image")) {
              break;
            }
            
            if (attempt < maxRetries) {
              const waitTime = config.isPro ? 1000 * attempt : 2000 * attempt;
              console.log(`🔄 Retry dans ${waitTime}ms...`);
              await delay(waitTime);
              continue;
            }
          }
        }
        
        // Si ce n'est pas le dernier endpoint, on continue avec le suivant
        if (endpointIndex < config.endpoints.length - 1) {
          console.log(`🔄 FALLBACK vers endpoint suivant...`);
          await delay(1000);
          continue;
        }
      }
      
      setIsLoading(false);
      console.error("🔥 TOUS LES ENDPOINTS ONT ÉCHOUÉ");
      throw lastError || new Error("Erreur inconnue lors de la requête OCR");
      
    } catch (error) {
      setIsLoading(false);
      if (error.message.includes("Format d'image invalide")) {
        console.error("🚨 ERREUR CRITIQUE DE FORMAT:", error.message);
        throw new Error("Format d'image invalide. L'image doit être au format JPEG, PNG ou WebP.");
      }
      throw error;
    }
  };

  return { 
    performOCR, 
    isLoading,
    detectKeyType,
    isValidBase64Image 
  };
};
