
// Service de compatibilité pour l'ancien code utilisant unifiedOCRService
// Redirige vers le hook centralisé useOCRRequest

import { detectKeyType } from "./keyDetection";

// Export de la fonction de détection pour compatibilité
export { detectKeyType };

// Fonction de redirection vers le hook centralisé - OBSOLÈTE
export const performUnifiedOCRRequest = async (imageFile: File, apiKey: string = "helloworld"): Promise<string> => {
  console.log("🔄 REDIRECTION VERS HOOK CENTRALISÉ useOCRRequest");
  
  // Note: Cette approche n'est pas idéale car on ne peut pas utiliser un hook ici
  // Les modules utilisant ce service devraient migrer directement vers useOCRRequest
  throw new Error("Veuillez utiliser directement le hook useOCRRequest() au lieu de ce service");
};
