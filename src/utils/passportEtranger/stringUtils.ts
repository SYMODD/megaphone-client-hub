
// Helper function to safely convert values to strings and trim them
export const safeStringTrim = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  return stringValue.trim();
};

// Helper function to validate if a value is a valid string
export const isValidString = (value: any): boolean => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidName = (name: string): boolean => {
  if (!isValidString(name)) {
    return false;
  }
  
  // Support pour les caractères accentués et spéciaux européens
  // Inclut les caractères latins étendus pour différentes langues
  const namePattern = /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŠŽČĆĐ\s\-']{2,30}$/;
  
  // Liste étendue des mots à exclure en plusieurs langues
  const excludedWords = [
    // Anglais
    'PASSPORT', 'FEDERAL', 'REPUBLIC', 'STATES', 'UNITED', 'KINGDOM', 'TYPE',
    // Allemand
    'REISEPASS', 'DEUTSCH', 'GERMAN', 'BUNDESREPUBLIK', 'DEUTSCHLAND',
    // Français
    'PASSEPORT', 'REPUBLIQUE', 'FRANCAISE', 'FRANCE',
    // Espagnol
    'PASAPORTE', 'ESPANA', 'ESPANOL', 'REINO',
    // Italien
    'PASSAPORTO', 'ITALIA', 'ITALIANO', 'REPUBBLICA',
    // Portugais
    'PASSAPORTE', 'PORTUGAL', 'PORTUGUESA', 'REPUBLICA',
    // Néerlandais
    'PASPOORT', 'NEDERLAND', 'NEDERLANDS', 'KONINKRIJK',
    // Autres
    'CANADA', 'CANADIAN', 'CANADIEN', 'SCHWEIZ', 'SUISSE', 'OSTERREICH',
    'AUTRICHE', 'BELGIE', 'BELGIQUE', 'NORWAY', 'SVERIGE', 'DANMARK'
  ];
  
  return namePattern.test(name) && !excludedWords.includes(name);
};

export const isValidNationality = (nationality: string): boolean => {
  if (!isValidString(nationality)) {
    return false;
  }
  
  // Pattern pour les nationalités avec support des accents
  const nationalityPattern = /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŠŽČĆĐ\s]{2,30}$/;
  
  // Mots à exclure pour les nationalités
  const excludedWords = [
    'PASSPORT', 'REISEPASS', 'PASSEPORT', 'TYPE', 'GIVEN', 'SURNAME', 
    'NAMES', 'PRENOM', 'VORNAMEN', 'CODE', 'NUMBER', 'NUMERO'
  ];
  
  return nationalityPattern.test(nationality) && !excludedWords.includes(nationality);
};

export const extractValueFromLine = (line: string, keywords: string[]): string | null => {
  // Enlever les keywords de la ligne pour extraire la valeur
  let cleanLine = safeStringTrim(line);
  keywords.forEach(keyword => {
    cleanLine = cleanLine.replace(new RegExp(keyword, 'gi'), '');
  });
  
  // Nettoyer les caractères spéciaux et espaces, mais préserver les accents
  cleanLine = cleanLine.replace(/[:/\d\.\-\|]/g, '').trim();
  
  return cleanLine.length > 1 ? cleanLine : null;
};

// Nouvelle fonction pour normaliser les noms (enlever accents pour comparaison)
export const normalizeForComparison = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

// Fonction pour détecter si un texte contient des mots-clés multilingues
export const containsMultilingualKeywords = (text: string, keywords: string[]): boolean => {
  const normalizedText = normalizeForComparison(text);
  return keywords.some(keyword => normalizedText.includes(normalizeForComparison(keyword)));
};
