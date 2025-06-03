
/**
 * Nettoie et formate l'affichage d'un code-barres
 * Extrait la partie numérique pour l'affichage tout en gardant la valeur complète en base
 */
export const formatBarcodeForDisplay = (barcode: string): string => {
  if (!barcode) return "";
  
  // Supprimer les espaces en début et fin
  const cleanBarcode = barcode.trim();
  
  // Pattern pour extraire la partie numérique des codes comme "P=0425"
  const pEqualsPattern = /^P=(\d+)$/i;
  const match = cleanBarcode.match(pEqualsPattern);
  
  if (match) {
    return match[1]; // Retourner seulement la partie numérique
  }
  
  // Pour d'autres formats, retourner le code original nettoyé
  return cleanBarcode;
};

/**
 * Vérifie si un code-barres a un format spécial qui peut être simplifié
 */
export const canSimplifyBarcode = (barcode: string): boolean => {
  if (!barcode) return false;
  return /^P=\d+$/i.test(barcode.trim());
};
