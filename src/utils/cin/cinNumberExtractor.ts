
import { isValidCINCandidate } from './validators';

export function extractCINNumber(text: string): string | undefined {
  console.log("🔢 === DÉBUT RECHERCHE NUMÉRO CIN ===");
  
  const cinPatterns = [
    // Patterns CIN marocains plus flexibles
    /\b([A-Z]{1,3}\d{5,12})\b/g,
    /\b(\d{6,12})\b/g,
    /(?:CIN|N[°O])\s*:?\s*([A-Z0-9]{6,15})/gi,
    // Patterns plus génériques
    /([A-Z]\d{6,11})/g,
    /([A-Z]{2}\d{5,10})/g
  ];

  for (const pattern of cinPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern CIN ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const cleanCIN = match[1].replace(/[^A-Z0-9]/g, '');
        console.log("🔍 Candidat CIN:", cleanCIN);
        if (isValidCINCandidate(cleanCIN)) {
          console.log("✅ Numéro CIN assigné:", cleanCIN);
          return cleanCIN;
        }
      }
    }
  }

  return undefined;
}
