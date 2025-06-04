
export const extractBarcode = (text: string, phoneToExclude?: string): string => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneToExclude);
  
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log("Text lines:", lines);

  // AMÉLIORATION: Patterns spécifiques pour les codes-barres réels
  const barcodePatterns = [
    // Pattern P= qui est très commun sur les documents officiels (priorité 1)
    /P=(\d{3,8})/gi,
    // Pattern pour codes numériques longs isolés (priorité 2)
    /(?:^|\s)(\d{9,15})(?:\s|$)/g,
    // Pattern pour codes avec tirets (priorité 3)
    /\b([A-Z0-9]{3,15}\-[A-Z0-9]{2,10}(?:\-[A-Z0-9]{1,10})?)\b/gi,
    // Pattern pour codes alphanumériques longs (priorité 4)
    /\b([A-Z0-9]{8,20})\b/g,
    // Pattern pour codes avec égal ou autres séparateurs (priorité 5)
    /\b([A-Z0-9]{3,15}[=\-][A-Z0-9]{2,10})\b/gi
  ];

  // Recherche prioritaire du pattern P=
  const pPattern = /P=(\d{3,8})/gi;
  let match = pPattern.exec(text);
  if (match) {
    const pCode = match[1];
    console.log("✅ Code P= trouvé (priorité haute):", pCode);
    return pCode; // Retourner seulement la partie numérique
  }

  // Si pas de P=, chercher avec les autres patterns
  for (const pattern of barcodePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      console.log(`Pattern ${pattern} matches:`, matches);
      
      for (const match of matches) {
        const cleanMatch = match.trim();
        console.log("Potential barcode found:", cleanMatch);
        
        // Exclure les numéros de téléphone
        if (phoneToExclude && cleanMatch.includes(phoneToExclude)) {
          console.log("Skipping as it contains phone number");
          continue;
        }
        
        // Exclure les numéros de passeport qui commencent par des lettres
        if (/^[A-Z]{1,3}\d/.test(cleanMatch)) {
          console.log("Skipping as it looks like passport number (starts with letters)");
          continue;
        }
        
        // Exclure les mots communs
        if (/^(ROYAUME|CARTE|NATIONALE|IDENTITE|PREFECTURE|KINGDOM|MOROCCO)$/i.test(cleanMatch)) {
          console.log("Skipping common document words");
          continue;
        }
        
        // Valider la longueur minimum
        if (cleanMatch.length >= 3) {
          console.log("✅ Code-barres valide trouvé:", cleanMatch);
          return cleanMatch;
        }
      }
    }
  }

  console.log("❌ Aucun code-barres trouvé dans le texte");
  return "";
};
