
export const extractBarcode = (text: string, phoneToExclude?: string): string => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneToExclude);
  
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log("Text lines:", lines);

  // CORRECTION: Chercher d'abord le vrai numéro qui pourrait être un code-barres
  // Dans les logs, on voit "667352333" qui est probablement le vrai code-barres
  const barcodePatterns = [
    // Pattern pour les codes-barres numériques longs (souvent en première ligne)
    /^\d{9,15}$/,
    // Pattern pour codes-barres alphanumériques avec tirets ou égals
    /\b\d{8,12}[A-ZА-Я0-9]\-[A-Z]{1,4}\-?[A-Z]?=?\d{3,6}\b/gi,
    // Pattern P= pour certains documents
    /P=\d{4,8}/gi,
    // Pattern avec tirets multiples
    /\b[A-Z0-9]{3,15}\-[A-Z0-9]{2,10}\-[A-Z0-9]{1,10}\b/gi,
    // Pattern codes longs alphanumériques
    /\b[A-Z0-9]{12,25}\b/g,
    // Pattern numérique long
    /\b\d{10,20}\b/g,
    // Pattern avec égal ou tiret
    /\b[A-Z0-9]{3,15}[=\-][A-Z0-9]{2,10}\b/gi,
    // Pattern général alphanumérique
    /\b[A-Z0-9]{8,15}\b/g
  ];

  for (const pattern of barcodePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      console.log(`Pattern ${pattern} matches:`, matches);
      
      for (const match of matches) {
        console.log("Potential barcode found:", match);
        
        // Exclure les numéros de téléphone
        if (phoneToExclude && match.includes(phoneToExclude)) {
          console.log("Skipping as it contains phone number");
          continue;
        }
        
        // CORRECTION: Exclure aussi les numéros de passeport qui commencent par des lettres
        if (/^[A-Z]{1,3}\d/.test(match)) {
          console.log("Skipping as it looks like passport number (starts with letters)");
          continue;
        }
        
        // Préférer les codes numériques purs en début de texte (souvent les vrais codes-barres)
        if (/^\d{9,15}$/.test(match)) {
          console.log("Valid numeric barcode extracted:", match);
          return match;
        }
        
        // Sinon, prendre le premier code valide qui n'est pas un passeport
        if (match.length >= 8 && !match.includes('PREFECTURE') && !match.includes('KINGDOM')) {
          console.log("Valid barcode extracted:", match);
          return match;
        }
      }
    }
  }

  console.log("No barcode found in text");
  return "";
};
