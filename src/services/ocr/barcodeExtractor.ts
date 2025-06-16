
export const extractBarcode = (text: string, phoneToExclude?: string): string => {
  console.log("Extracting barcode from text:", text);
  console.log("Phone number to exclude:", phoneToExclude);
  
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  console.log("Text lines:", lines);

  // 🎯 AMÉLIORATION CRITIQUE: Pattern P= en priorité absolue
  console.log("🔍 Recherche prioritaire du pattern P=...");
  
  // Pattern spécifique pour P= avec capture complète
  const pEqualsPattern = /P\s*=\s*(\d+)/gi;
  const pMatch = text.match(pEqualsPattern);
  
  if (pMatch && pMatch.length > 0) {
    const fullPCode = pMatch[0].trim(); // Exemple: "P=0425"
    console.log("✅ Code P= trouvé (priorité absolue):", fullPCode);
    
    // Extraire juste la partie numérique si on veut simplifier l'affichage
    const numericMatch = fullPCode.match(/P\s*=\s*(\d+)/i);
    if (numericMatch) {
      const numericPart = numericMatch[1]; // Exemple: "0425"
      console.log("📊 Partie numérique extraite:", numericPart);
      
      // Retourner le code complet P=0425 pour conserver le format original
      return fullPCode;
    }
  }

  // Si pas de P=, utiliser les autres patterns
  console.log("🔍 Aucun pattern P= trouvé, recherche avec autres patterns...");
  
  const barcodePatterns = [
    // Pattern pour codes numériques longs isolés
    /(?:^|\s)(\d{9,15})(?:\s|$)/g,
    // Pattern pour codes avec tirets
    /\b([A-Z0-9]{3,15}\-[A-Z0-9]{2,10}(?:\-[A-Z0-9]{1,10})?)\b/gi,
    // Pattern pour codes alphanumériques longs
    /\b([A-Z0-9]{8,20})\b/g,
    // Pattern pour codes avec égal ou autres séparateurs
    /\b([A-Z0-9]{3,15}[=\-][A-Z0-9]{2,10})\b/gi
  ];

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
