
export const extractBarcode = (text: string, phoneToExclude?: string): string => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneToExclude);
  
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log("Text lines:", lines);

  // CORRECTION MAJEURE: Concentrer la recherche sur les vrais codes-barres uniquement
  // Exclure totalement les numéros de passeport et téléphones
  const barcodePatterns = [
    // Pattern 1: Codes numériques purs longs (9-15 chiffres) - priorité absolue
    /^\d{9,15}$/,
    
    // Pattern 2: Codes P= spéciaux
    /P=\d{4,8}/gi,
    
    // Pattern 3: Codes avec tirets mais pas de lettres en début
    /\b\d{3,}\-\d{2,}\-\d{1,}\b/gi,
    
    // Pattern 4: Codes alphanumériques très longs (12+ caractères)
    /\b[A-Z0-9]{12,25}\b/g
  ];

  // Liste des patterns à exclure absolument
  const excludePatterns = [
    /^[A-Z]{1,3}\d{5,9}$/, // Numéros de passeport (commence par des lettres)
    /^\+?[0-9\s\-\(\)]{8,15}$/, // Numéros de téléphone
    /PASSPORT|PASSEPORT|KINGDOM|MOROCCO|MAROC/i, // Mots de documents
    /^[0-9]{4}[\-\/][0-9]{2}[\-\/][0-9]{2}$/, // Dates
    /^[0-9]{8}$/ // Codes trop courts (souvent dates sans séparateurs)
  ];

  for (const pattern of barcodePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      console.log(`Pattern ${pattern} matches:`, matches);
      
      for (const match of matches) {
        console.log("Evaluating potential barcode:", match);
        
        // CORRECTION: Vérifications strictes d'exclusion
        let shouldExclude = false;
        
        // 1. Exclure si contient le numéro de téléphone
        if (phoneToExclude && match.includes(phoneToExclude.replace(/\D/g, ''))) {
          console.log("❌ Exclu: contient le numéro de téléphone");
          shouldExclude = true;
        }
        
        // 2. Exclure selon les patterns d'exclusion
        for (const excludePattern of excludePatterns) {
          if (excludePattern.test(match)) {
            console.log(`❌ Exclu: correspond au pattern d'exclusion ${excludePattern}`);
            shouldExclude = true;
            break;
          }
        }
        
        // 3. Exclure si c'est dans une ligne contenant des mots de document
        const matchLine = lines.find(line => line.includes(match));
        if (matchLine && /PASSPORT|PASSEPORT|KINGDOM|MOROCCO|MAROC|EXPIRE|VALID/i.test(matchLine)) {
          console.log("❌ Exclu: dans une ligne de document officiel");
          shouldExclude = true;
        }
        
        if (!shouldExclude) {
          console.log("✅ Code-barres valide trouvé:", match);
          return match;
        }
      }
    }
  }

  console.log("❌ Aucun code-barres valide trouvé");
  return "";
};
