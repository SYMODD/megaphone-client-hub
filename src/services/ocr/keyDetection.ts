
// Service pour la détection du type de clé API OCR.space
// Extrait de l'ancien unifiedOCRService.ts

export const detectKeyType = (apiKey: string): boolean => {
  if (apiKey === "helloworld") return false;
  return apiKey.length > 15 || 
         apiKey.includes('-') || 
         apiKey.includes('_') ||
         (apiKey.length > 10 && /[A-Z]/.test(apiKey) && /[0-9]/.test(apiKey));
};
