
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
    // Néerlandais/Belge
    'PASPOORT', 'NEDERLAND', 'NEDERLANDS', 'KONINKRIJK',
    // Polonais - AJOUTS CRITIQUES
    'PASZPORT', 'PASZPORTI', 'PASZPOR', 'RZECZPOSPOLITA', 'POLSKA', 'POLSKIE',
    'NAZWISKO', 'IMIE', 'IMIONA', 'OBYWATELSTWO', 'PESEL', 'SERIA', 'NUMER',
    'DATA', 'URODZENIA', 'WAZNY', 'WAŻNY', 'WYDANY', 'MIEJSCE', 'PLEC',
    // Slovaque - AJOUTS CRITIQUES
    'CESTOVNY', 'PAS', 'SLOVENSKÁ', 'REPUBLIKA', 'PRIEZVISKO', 'MENO',
    'ŠTÁTNE', 'OBČIANSTVO', 'RODNÉ', 'ČÍSLO', 'MIESTO', 'NARODENIA',
    // Canadien - AJOUTS CRITIQUES
    'FREDERICTON', 'VANCOUVER', 'TORONTO', 'MONTREAL', 'OTTAWA', 'CALGARY',
    'EDMONTON', 'WINNIPEG', 'HALIFAX', 'QUEBEC', 'CITIZENSHIP', 'CITOYENNETÉ',
    // Colombien - AJOUTS CRITIQUES
    'REPUBLICA', 'COLOMBIA', 'COLOMBIANO', 'CEDULA', 'LUGAR', 'NACIMIENTO',
    'NACIONALIDAD', 'EXPEDICION', 'VENCIMIENTO',
    // Plus de villes problématiques
    'BERLIN', 'MUNICH', 'HAMBURG', 'COLOGNE', 'FRANKFURT', 'STUTTGART',
    'DUSSELDORF', 'DORTMUND', 'LEIPZIG', 'BREMEN', 'DRESDEN', 'HANNOVER',
    // Étiquettes multilingues courantes
    'GIVEN', 'NAMES', 'SURNAME', 'NOM', 'PRENOM', 'PRENOMS', 'VERNAMEN', 'VORNAMEN',
    'FAMILIENNAME', 'NACHNAME', 'GEBURTENAME',
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
  console.log("🔍 Extraction de valeur de la ligne:", line);
  
  // Enlever les keywords de la ligne pour extraire la valeur
  let cleanLine = safeStringTrim(line);
  
  // Pour les formats avec deux points, on prend ce qui vient après
  const colonMatch = cleanLine.match(/^.*?:\s*(.+)$/);
  if (colonMatch) {
    cleanLine = colonMatch[1];
    console.log("📋 Valeur après deux points:", cleanLine);
  } else {
    // Sinon, enlever tous les mots-clés
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      cleanLine = cleanLine.replace(regex, '');
    });
  }
  
  // Nettoyer les caractères spéciaux et espaces, mais préserver les accents
  cleanLine = cleanLine.replace(/[:/\d\.\-\|\/]/g, '').trim();
  
  // Enlever les séquences de mots multilingues courantes
  const multilingualPatterns = [
    /\b(GIVEN\s+NAMES?|VERNAMEN|VORNAMEN|PRENOMS?)\b/gi,
    /\b(SURNAME|FAMILIENNAME|NACHNAME|GEBURTENAME)\b/gi,
    /\b(NOM|PRENOM)\b/gi
  ];
  
  multilingualPatterns.forEach(pattern => {
    cleanLine = cleanLine.replace(pattern, '').trim();
  });
  
  console.log("✨ Valeur nettoyée:", cleanLine);
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

// Nouvelle fonction pour extraire la valeur réelle après identification du champ
export const extractRealValueFromField = (currentLine: string, nextLine: string = ""): string | null => {
  console.log("🎯 Extraction valeur réelle - Ligne courante:", currentLine);
  console.log("🎯 Extraction valeur réelle - Ligne suivante:", nextLine);
  
  // D'abord essayer d'extraire depuis la ligne courante (format avec deux points)
  const colonMatch = currentLine.match(/^.*?:\s*(.+)$/);
  if (colonMatch) {
    const value = colonMatch[1].trim();
    console.log("📍 Valeur trouvée après deux points:", value);
    if (isValidName(value)) {
      return value;
    }
  }
  
  // Ensuite essayer la ligne suivante (format numéroté allemand)
  if (nextLine) {
    const nextValue = nextLine.trim();
    console.log("📍 Valeur candidate ligne suivante:", nextValue);
    if (isValidName(nextValue)) {
      return nextValue;
    }
  }
  
  return null;
};
