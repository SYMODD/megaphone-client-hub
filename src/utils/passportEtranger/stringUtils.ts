
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
  // Vérifier que c'est un nom valide (lettres seulement, longueur raisonnable)
  return /^[A-Z\s]{2,30}$/.test(name) && 
         !name.match(/^(PASSPORT|REISEPASS|CANADA|GERMAN|DEUTSCH|FEDERAL|REPUBLIC)$/);
};

export const isValidNationality = (nationality: string): boolean => {
  if (!isValidString(nationality)) {
    return false;
  }
  // Vérifier que c'est une nationalité valide
  return /^[A-Z\s]{2,30}$/.test(nationality) && 
         !nationality.match(/^(PASSPORT|REISEPASS|TYPE|GIVEN|SURNAME)$/);
};

export const extractValueFromLine = (line: string, keywords: string[]): string | null => {
  // Enlever les keywords de la ligne pour extraire la valeur
  let cleanLine = safeStringTrim(line);
  keywords.forEach(keyword => {
    cleanLine = cleanLine.replace(new RegExp(keyword, 'gi'), '');
  });
  
  // Nettoyer les caractères spéciaux et espaces
  cleanLine = cleanLine.replace(/[:/\d\.\-\|]/g, '').trim();
  
  return cleanLine.length > 1 ? cleanLine : null;
};
