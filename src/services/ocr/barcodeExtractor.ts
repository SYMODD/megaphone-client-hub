
export const extractBarcode = (text: string, phoneNumber?: string): string | undefined => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneNumber);
  
  // Nettoyer le texte et diviser en lignes
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("Text lines:", lines);
  
  // Patterns améliorés pour différents types de codes-barres
  const barcodePatterns = [
    // Pattern pour codes avec caractères cyrilliques ou spéciaux: 068887978З-AH-P=8425
    /\b\d{8,12}[A-ZА-Я0-9]-[A-Z]{1,4}-?[A-Z]?=?\d{3,6}\b/gi,
    // Pattern pour les codes P= spécifiques
    /P=\d{4,8}/gi,
    // Codes avec tirets multiples
    /\b[A-Z0-9]{3,15}-[A-Z0-9]{2,10}-[A-Z0-9]{1,10}\b/gi,
    // Codes longs alphanumériques sans espaces
    /\b[A-Z0-9]{12,25}\b/g,
    // Codes numériques longs (plus de 10 chiffres)
    /\b\d{10,20}\b/g,
    // Codes avec caractères spéciaux
    /\b[A-Z0-9]{3,15}[=\-][A-Z0-9]{2,10}\b/gi,
    // Codes alphanumériques moyens
    /\b[A-Z0-9]{8,15}\b/g
  ];

  // Recherche avec patterns spécifiques
  for (const pattern of barcodePatterns) {
    const matches = text.match(pattern);
    console.log(`Pattern ${pattern} matches:`, matches);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const potentialBarcode = match.trim();
        console.log("Potential barcode found:", potentialBarcode);
        
        // Éviter les numéros de téléphone
        if (phoneNumber) {
          const cleanPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
          const cleanBarcode = potentialBarcode.replace(/[\s\+\-\(\)]/g, '');
          if (cleanBarcode.includes(cleanPhone) || cleanPhone.includes(cleanBarcode)) {
            console.log("Skipping as it contains phone number");
            continue;
          }
        }
        
        // Accepter les codes de longueur raisonnable
        if (potentialBarcode.length >= 4 && potentialBarcode.length <= 35) {
          console.log("Valid barcode extracted:", potentialBarcode);
          return potentialBarcode;
        }
      }
    }
  }

  // Recherche ligne par ligne pour des patterns spéciaux
  for (const line of lines) {
    console.log("Checking line:", line);
    
    // Ignorer les lignes trop courtes ou trop longues
    if (line.length < 4 || line.length > 40) continue;
    
    // Chercher des lignes avec des patterns de code-barres
    const hasNumbers = /\d/.test(line);
    const hasLetters = /[A-Za-zА-Я]/.test(line);
    const hasSpecialChars = /[\-=]/.test(line);
    
    if (hasNumbers && (hasLetters || hasSpecialChars)) {
      // Éviter les numéros de téléphone
      if (phoneNumber) {
        const cleanPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
        const cleanLine = line.replace(/[\s\+\-\(\)]/g, '');
        if (cleanLine.includes(cleanPhone) || cleanPhone.includes(cleanLine)) {
          console.log("Skipping line as it contains phone number:", line);
          continue;
        }
      }
      
      // Éviter les dates communes
      if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(line)) {
        console.log("Skipping date pattern:", line);
        continue;
      }
      
      // Éviter les mots communs
      const commonWords = ['PASSPORT', 'PASSEPORT', 'NAME', 'NOM', 'DATE', 'BIRTH', 'NAISSANCE'];
      if (commonWords.some(word => line.toUpperCase().includes(word))) {
        console.log("Skipping common word:", line);
        continue;
      }
      
      console.log("Found potential barcode in line:", line);
      return line;
    }
  }

  console.log("No barcode found in text");
  return undefined;
};
