
import { isValidPlace } from './validators';

export function extractBirthPlace(text: string): string | undefined {
  console.log("📍 === DÉBUT RECHERCHE LIEU DE NAISSANCE ===");
  
  const lieuPatterns = [
    // Villes marocaines courantes d'abord
    /(AGADIR|CASABLANCA|RABAT|FES|FEZ|MARRAKECH|TANGER|MEKNES|OUJDA|KENITRA|TETOUAN|SALE|MOHAMMEDIA|BENI\s*MELLAL|EL\s*JADIDA|ESSAOUIRA|NADOR|KHOURIBGA|SETTAT|BERKANE)/gi,
    // Patterns génériques
    /(?:NE|BORN)\s*A\s*:?\s*([A-Z][A-Z\s]{2,25})/gi,
    /(?:LIEU|PLACE)\s*:?\s*([A-Z][A-Z\s]{2,25})/gi,
  ];

  for (const pattern of lieuPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern lieu ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const lieu = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (isValidPlace(lieu)) {
          console.log("✅ Lieu de naissance assigné:", lieu);
          return lieu;
        }
      }
    }
  }

  return undefined;
}
