
/**
 * Nettoie et formate l'affichage d'un code-barres
 * Extrait la partie numérique pour l'affichage tout en gardant la valeur complète en base
 */
export const formatBarcodeForDisplay = (barcode: string | any): string => {
  // Handle case where barcode is not a string (could be an object from passport data)
  if (!barcode) return "";
  
  // If barcode is an object (from passport extraction), extract the relevant field
  if (typeof barcode === 'object') {
    // Try to get the passport number or code_barre field
    const barcodeValue = barcode.numero_passeport || barcode.code_barre || barcode.barcode || "";
    if (typeof barcodeValue === 'string') {
      return formatBarcodeForDisplay(barcodeValue); // Recursive call with string
    }
    return ""; // Return empty string if no valid barcode found in object
  }
  
  // Ensure we have a string
  if (typeof barcode !== 'string') {
    return String(barcode || "");
  }
  
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
export const canSimplifyBarcode = (barcode: string | any): boolean => {
  // Handle non-string inputs
  if (!barcode) return false;
  
  // If barcode is an object, extract the relevant field
  if (typeof barcode === 'object') {
    const barcodeValue = barcode.numero_passeport || barcode.code_barre || barcode.barcode || "";
    if (typeof barcodeValue === 'string') {
      return canSimplifyBarcode(barcodeValue); // Recursive call with string
    }
    return false;
  }
  
  // Ensure we have a string
  if (typeof barcode !== 'string') {
    return false;
  }
  
  return /^P=\d+$/i.test(barcode.trim());
};
