
export const extractBarcode = (text: string, phoneNumber?: string): string | undefined => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneNumber);
  
  // Nettoyer le texte et diviser en lignes
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("Text lines:", lines);
  
  // Patterns pour différents types de codes-barres
  const barcodePatterns = [
    // Pattern spécifique pour le format visible dans l'image: 068887978З-AH-P=8425
    /\b\d{9}[A-ZА-Я]-[A-Z]{2,3}-?[A-Z]?=?\d{4,6}\b/g,
    // Codes longs alphanumériques
    /\b[A-Z0-9]{15,25}\b/g,
    // Codes numériques longs (plus de 10 chiffres)
    /\b\d{12,20}\b/g,
    // Codes avec tirets
    /\b[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+\b/g,
    // Codes alphanumériques moyens
    /\b[A-Z0-9]{10,20}\b/g,
    // Pattern pour P= suivi de chiffres
    /P=\d{4,6}/g
  ];

  // Chercher avec les patterns
  for (const pattern of barcodePatterns) {
    const matches = text.match(pattern);
    console.log(`Pattern ${pattern} matches:`, matches);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const potentialBarcode = match.trim();
        console.log("Potential barcode found:", potentialBarcode);
        
        // Éviter les numéros de téléphone
        if (phoneNumber && potentialBarcode.includes(phoneNumber.replace(/[\s\+\-]/g, ''))) {
          console.log("Skipping as it contains phone number");
          continue;
        }
        
        // Accepter les codes de longueur raisonnable
        if (potentialBarcode.length >= 4 && potentialBarcode.length <= 30) {
          console.log("Valid barcode extracted:", potentialBarcode);
          return potentialBarcode;
        }
      }
    }
  }

  // Recherche ligne par ligne pour des patterns spéciaux
  for (const line of lines) {
    // Chercher des lignes qui contiennent des caractères comme З, -, = 
    if (line.includes('-') && line.length >= 6 && line.length <= 30) {
      // Éviter les numéros de téléphone
      if (!phoneNumber || !line.includes(phoneNumber.replace(/[\s\+\-]/g, ''))) {
        // Vérifier si c'est probablement un code-barres (contient des chiffres et lettres)
        if (/[0-9]/.test(line) && (/[A-Z]/.test(line) || /[А-Я]/.test(line))) {
          console.log("Found barcode in line:", line);
          return line;
        }
      }
    }
    
    // Chercher spécifiquement le pattern P=
    if (line.includes('P=')) {
      const pMatch = line.match(/P=\d+/);
      if (pMatch) {
        console.log("Found P= pattern:", pMatch[0]);
        return pMatch[0];
      }
    }
  }

  console.log("No barcode found in text");
  return undefined;
};
