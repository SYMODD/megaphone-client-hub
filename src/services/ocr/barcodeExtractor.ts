
export const extractBarcode = (text: string, phoneNumber?: string): string | undefined => {
  const enhancedBarcodePatterns = [
    /\b[A-Z0-9]{8,20}\b/g,
    /\|\|\|[A-Z0-9]+\|\|\|/g,
    /\*[A-Z0-9]+\*/g,
    /\b\d{10,15}\b/g,
    /[A-Z]{2,3}\d{6,10}/g, // Codes avec préfixe lettres
    /\b[A-Z0-9]{6,15}\b/g // Codes alphanumériques mixtes
  ];

  for (const pattern of enhancedBarcodePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const potentialBarcode = matches[0].replace(/[\|\*]/g, '');
      if (potentialBarcode.length >= 6 && potentialBarcode.length <= 20) {
        // Éviter de confondre avec un numéro de téléphone
        if (!phoneNumber || potentialBarcode !== phoneNumber) {
          return potentialBarcode;
        }
      }
    }
  }

  return undefined;
};
