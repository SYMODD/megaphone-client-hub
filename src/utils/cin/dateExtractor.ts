
export function extractBirthDate(text: string): string | undefined {
  console.log("📅 === DÉBUT RECHERCHE DATE DE NAISSANCE ===");
  
  const datePatterns = [
    // Formats DD/MM/YYYY
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
    // Formats DD-MM-YYYY
    /\b(\d{1,2}-\d{1,2}-\d{4})\b/g,
    // Formats DD.MM.YYYY
    /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/g,
    // Patterns avec contexte
    /(?:NE|NEE|BORN)\s*(?:LE)?\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/gi,
    /(?:DATE.*NAISSANCE|BIRTH.*DATE)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern date ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const dateCandidate = match[1];
        console.log("🔍 Candidat date:", dateCandidate);
        
        // Validation basique de la date
        if (isValidDate(dateCandidate)) {
          console.log("✅ Date de naissance assignée:", dateCandidate);
          return dateCandidate;
        }
      }
    }
  }

  return undefined;
}

function isValidDate(dateString: string): boolean {
  // Normaliser le format avec des /
  const normalizedDate = dateString.replace(/[-\.]/g, '/');
  const parts = normalizedDate.split('/');
  
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  // Validations basiques
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  return true;
}
