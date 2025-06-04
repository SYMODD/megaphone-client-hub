
export function isValidNameCandidate(name: string): boolean {
  if (!name || name.length < 2) return false;
  
  // Doit contenir uniquement des lettres et espaces
  if (!/^[A-Z\s]+$/.test(name)) return false;
  
  return true;
}

export function isExcludedWord(word: string): boolean {
  const excludedWords = [
    'ROYAUME', 'MAROC', 'MOROCCO', 'CARTE', 'IDENTITE', 'NATIONALE', 
    'KINGDOM', 'CARD', 'IDENTITY', 'NATIONAL', 'DU', 'DE', 'LA', 'LE',
    'AND', 'ET', 'OU', 'OR', 'THE', 'FOR', 'WITH', 'WITHOUT', 'DATE',
    'SEXE', 'SEX', 'MALE', 'FEMALE', 'LIEU', 'PLACE', 'BORN', 'NAISSANCE'
  ];
  
  return excludedWords.includes(word.trim());
}

export function isValidCINCandidate(cin: string): boolean {
  if (!cin || cin.length < 5) return false;
  
  // Doit contenir au moins quelques chiffres
  const digitCount = (cin.match(/\d/g) || []).length;
  if (digitCount < 4) return false;
  
  return true;
}

export function isValidPlace(place: string): boolean {
  if (!place || place.length < 3 || place.length > 30) return false;
  
  // Exclure les mots génériques
  const excludedWords = [
    'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO', 'MAROC',
    'DATE', 'SEXE', 'MALE', 'FEMALE'
  ];
  
  if (excludedWords.includes(place.trim())) return false;
  
  return true;
}
