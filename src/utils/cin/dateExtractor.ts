
export function parseDate(match: RegExpMatchArray): string | null {
  if (!match) return null;
  
  let day: string, month: string, year: string;
  
  // Déterminer le format de date
  if (match[3] && match[3].length === 4) {
    // Format dd/mm/yyyy
    day = match[1].padStart(2, '0');
    month = match[2].padStart(2, '0');
    year = match[3];
  } else if (match[1] && match[1].length === 4) {
    // Format yyyy/mm/dd
    year = match[1];
    month = match[2].padStart(2, '0');
    day = match[3].padStart(2, '0');
  } else {
    return null;
  }
  
  // Validation de la date plus permissive
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31 || 
      monthNum < 1 || monthNum > 12 || 
      yearNum < 1940 || yearNum > 2024) {
    return null;
  }
  
  return `${day}/${month}/${year}`;
}

export function extractBirthDate(text: string): string | undefined {
  console.log("📅 === DÉBUT RECHERCHE DATE DE NAISSANCE ===");
  
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/g,
    // Dates en format texte
    /(?:NE|BORN|NAISSANCE)\s*(?:LE)?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern date ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      const dateResult = parseDate(match);
      if (dateResult) {
        console.log("✅ Date de naissance assignée:", dateResult);
        return dateResult;
      }
    }
  }

  return undefined;
}
