
export const extractBarcode = (text: string, phoneNumber?: string): string | undefined => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneNumber);
  
  // Patterns améliorés pour différents types de codes-barres
  const enhancedBarcodePatterns = [
    // Pattern pour les codes avec tirets et caractères spéciaux (comme dans votre image)
    /\b\d{10}-[A-Z]{2,3}-[A-Z]?=?\d{4,6}\b/g,
    // Codes longs alphanumériques
    /\b[A-Z0-9]{12,25}\b/g,
    // Codes avec séparateurs
    /\|\|\|[A-Z0-9]+\|\|\|/g,
    /\*[A-Z0-9]+\*/g,
    // Codes numériques longs
    /\b\d{12,20}\b/g,
    // Codes avec préfixe lettres
    /[A-Z]{2,3}\d{8,15}/g,
    // Codes alphanumériques mixtes moyens
    /\b[A-Z0-9]{8,20}\b/g,
    // Codes courts mais significatifs
    /\b[A-Z0-9]{6,15}\b/g
  ];

  for (const pattern of enhancedBarcodePatterns) {
    const matches = text.match(pattern);
    console.log(`Pattern ${pattern} matches:`, matches);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const potentialBarcode = match.replace(/[\|\*]/g, '');
        console.log("Potential barcode found:", potentialBarcode);
        
        // Vérifier que ce n'est pas juste un numéro de téléphone
        if (phoneNumber && potentialBarcode.includes(phoneNumber)) {
          console.log("Skipping barcode as it contains phone number");
          continue;
        }
        
        // Accepter les codes de longueur raisonnable
        if (potentialBarcode.length >= 6 && potentialBarcode.length <= 30) {
          console.log("Valid barcode extracted:", potentialBarcode);
          return potentialBarcode;
        }
      }
    }
  }

  // Si aucun pattern spécifique ne fonctionne, essayer de trouver des codes dans le texte brut
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Chercher des lignes qui ressemblent à des codes-barres
    if (trimmedLine.length >= 6 && trimmedLine.length <= 30) {
      // Éviter les lignes qui sont clairement des mots ou des phrases
      if (!/\s/.test(trimmedLine) && /[A-Z0-9-=]/.test(trimmedLine)) {
        // Éviter les numéros de téléphone
        if (!phoneNumber || !trimmedLine.includes(phoneNumber)) {
          console.log("Found potential barcode in line:", trimmedLine);
          return trimmedLine;
        }
      }
    }
  }

  console.log("No barcode found in text");
  return undefined;
};
