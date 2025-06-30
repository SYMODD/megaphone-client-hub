import { safeStringTrim } from "./stringUtils";

export const convertMainTextNationality = (nationality: string): string => {
  const nationalityUpper = nationality.toUpperCase().trim();
  
  // Mapping étendu pour les nationalités en plusieurs langues
  const mainTextMapping: Record<string, string> = {
    // Anglais/Canadien - EXTENSIONS CRITIQUES
    "CANADIAN": "Canada",
    "CANADIENNE": "Canada",
    "CANADIAN/CANADIENNE": "Canada",
    "CANADIEN/CANADIENNE": "Canada",
    "AMERICAN": "États-Unis",
    "UNITED STATES": "États-Unis",
    "BRITISH": "Royaume-Uni",
    "BRITISH CITIZEN": "Royaume-Uni",        // ← AJOUT CRITIQUE TEST
    "ENGLISH": "Royaume-Uni",
    
    // Irlandais
    "IRISH": "Irlande",
    "IRELAND": "Irlande",
    "ÉIRE": "Irlande",
    "EIRE": "Irlande",
    "ÉIRE/IRELAND/IRLANDE": "Irlande",
    "EIRE/IRELAND/IRLANDE": "Irlande",
    
    // Allemand
    "DEUTSCH": "Allemagne",
    "DEUTSCHE": "Allemagne",
    "GERMAN": "Allemagne",
    "BUNDESREPUBLIK": "Allemagne",
    "DEUTSCHLAND": "Allemagne",
    
    // Français
    "FRENCH": "France",
    "FRANÇAISE": "France",
    "FRANCAISE": "France",
    "REPUBLIQUE FRANCAISE": "France",
    
    // Espagnol
    "SPANISH": "Espagne",
    "ESPAÑOLA": "Espagne",
    "ESPANOLA": "Espagne",
    "REINO DE ESPANA": "Espagne",
    
    // Italien
    "ITALIAN": "Italie",
    "ITALIANA": "Italie",
    "REPUBBLICA ITALIANA": "Italie",
    
    // Portugais
    "PORTUGUESE": "Portugal",
    "PORTUGUESA": "Portugal",
    "REPUBLICA PORTUGUESA": "Portugal",
    "BRAZILIAN": "Brésil",
    "BRASILEIRA": "Brésil",
    
    // Néerlandais
    "DUTCH": "Pays-Bas",
    "NEDERLANDSE": "Pays-Bas",
    "KONINKRIJK DER NEDERLANDEN": "Pays-Bas",
    "BELGIAN": "Belgique",
    "BELGE": "Belgique",
    "BELGIQUE": "Belgique",
    "BEL": "Belgique",                       // ← AJOUT CRITIQUE TEST
    
    // Autres européens
    "SWISS": "Suisse",
    "SCHWEIZ": "Suisse",
    "SUISSE": "Suisse",
    "AUSTRIAN": "Autriche",
    "ÖSTERREICH": "Autriche",
    "OSTERREICH": "Autriche",
    
    // Nordiques
    "NORWEGIAN": "Norvège",
    "NORSK": "Norvège",
    "SWEDISH": "Suède",
    "SVENSK": "Suède",
    "DANISH": "Danemark",
    "DANSK": "Danemark",
    "FINNISH": "Finlande",
    "SUOMI": "Finlande",
    
    // Maghreb
    "MOROCCAN": "Maroc",
    "MAROCAINE": "Maroc",
    "TUNISIAN": "Tunisie",
    "TUNISIENNE": "Tunisie",
    "ALGERIAN": "Algérie",
    "ALGERIENNE": "Algérie",
    
    // Autres
    "TURKISH": "Turquie",
    "TURK": "Turquie",
    "GREEK": "Grèce",
    "ELLINIKI": "Grèce",
    "POLISH": "Pologne",
    "POLSKA": "Pologne",
    "POLSKIE": "Pologne",                    // ← AJOUT CRITIQUE TEST
    "POLONAISE": "Pologne",                  // ← AJOUT CRITIQUE TEST
    "SLOVAK": "Slovaquie",
    "SLOVAKIA": "Slovaquie",
    "SLOVENSKÁ": "Slovaquie",
    "SLOVENSKÁ REPUBLIKA": "Slovaquie",
    "SLOVENSKA REPUBLIKA": "Slovaquie",       // Sans accent
    "SLOVENSKA": "Slovaquie",                  // Court
    "CZECH": "République tchèque",
    "CESKA": "République tchèque",
    "TCHÈQUE": "République tchèque",         // ← AJOUT FORME FRANÇAISE
    "HUNGARIAN": "Hongrie",
    "MAGYAR": "Hongrie",
    "HONGROISE": "Hongrie",                  // ← AJOUT FORME FRANÇAISE
    "ROMANIAN": "Roumanie",
    "ROUMAINE": "Roumanie",
    "RUSSIAN": "Russie",
    "ROSSIYSKAYA": "Russie",
    
    // Amérique Latine - EXTENSIONS CRITIQUES
    "COLOMBIAN": "Colombie",
    "COLOMBIANA": "Colombie",                // ← AJOUT CRITIQUE TEST
    "VENEZUELAN": "Venezuela",
    "VENEZOLANA": "Venezuela",
    "PERUVIAN": "Pérou",
    "PERUANA": "Pérou",
    "ECUADORIAN": "Équateur",
    "ECUATORIANA": "Équateur",
    "CHILEAN": "Chili",
    "CHILENA": "Chili",
    "ARGENTINE": "Argentine",
    "ARGENTINO": "Argentine",
    "MEXICANA": "Mexique",
    "MEXICAN": "Mexique",
    
    // Corrections spécifiques pour les erreurs d'OCR courantes - DÉSACTIVÉES POUR ÉVITER FAUX POSITIFS
    // "NATION": "Canada", // DÉSACTIVÉ - cause confusion avec "NATIONALITY"
    // "NATIONA": "Canada" // DÉSACTIVÉ - cause confusion avec "NATIONALITY"
  };

  return mainTextMapping[nationalityUpper] || nationality;
};

export const checkForNationalityInLine = (line: string): string | null => {
  const lineUpper = line.toUpperCase().trim();
  
  // Vérification spécifique pour le format canadien
  if (lineUpper === "CANADIAN/CANADIENNE") {
    return "Canada";
  }
  
  // Détection spéciale pour "CANADA" dans le texte
  if (lineUpper.includes("CANADA")) {
    return "Canada";
  }
  
  // Liste étendue des nationalités reconnues
  const knownNationalities = [
    // Européennes
    "DEUTSCH", "DEUTSCHE", "GERMAN", "CANADIAN", "CANADIENNE", "FRENCH", "FRANÇAISE", "FRANCAISE",
    "AMERICAN", "BRITISH", "IRISH", "IRELAND", "ÉIRE", "EIRE", "SPANISH", "ESPAÑOLA", "ESPANOLA", 
    "ITALIAN", "ITALIANA", "BELGIAN", "BELGE", "DUTCH", "NEDERLANDSE", "SWISS", "SCHWEIZ", "SUISSE", 
    "AUSTRIAN", "ÖSTERREICH", "OSTERREICH", "PORTUGUESE", "PORTUGUESA", "NORWEGIAN", "NORSK", 
    "SWEDISH", "SVENSK", "DANISH", "DANSK", "FINNISH", "SUOMI", "GREEK", "ELLINIKI", "POLISH", 
    "POLSKA", "RUSSIAN", "ROSSIYSKAYA",
    
    // Maghreb et Moyen-Orient
    "MOROCCAN", "MAROCAINE", "TUNISIAN", "TUNISIENNE", "ALGERIAN", "ALGERIENNE", "TURKISH", "TURK",
    "EGYPTIAN", "EGYPTIENNE", "LEBANESE", "LIBANAISE", "SYRIAN", "SYRIENNE", "JORDANIAN", "JORDANIENNE",
    
    // Autres
    "BRAZILIAN", "BRASILEIRA", "ARGENTINE", "ARGENTINO", "CHINESE", "JAPONAISE", "KOREAN", "INDIEN"
    
    // Corrections pour erreurs OCR - DÉSACTIVÉES POUR ÉVITER FAUX POSITIFS
    // "NATION", "NATIONA" // DÉSACTIVÉ - cause confusion avec "NATIONALITY"
  ];

  for (const nat of knownNationalities) {
    if (lineUpper === nat || lineUpper.includes(nat)) {
      return convertMainTextNationality(nat);
    }
  }

  return null;
};

/**
 * 🔧 DÉTECTION ERREURS CODES PAYS DANS NOMS
 * Détecte quand un code pays ISO se retrouve dans un champ nom/prénom
 * et suggère la nationalité correspondante
 */
export const detectCountryCodeInName = (name: string): { isCountryCode: boolean; suggestedNationality?: string } => {
  const nameUpper = name.toUpperCase().trim();
  
  // Codes pays ISO 3 lettres les plus courants
  const countryCodeMapping: Record<string, string> = {
    'IRL': 'Irlande',
    'GBR': 'Royaume-Uni',
    'USA': 'États-Unis',
    'CAN': 'Canada',
    'FRA': 'France',
    'DEU': 'Allemagne',
    'ESP': 'Espagne',
    'ITA': 'Italie',
    'BEL': 'Belgique',
    'CHE': 'Suisse',
    'AUT': 'Autriche',
    'NLD': 'Pays-Bas',
    'COL': 'Colombie',
    'BRA': 'Brésil',
    'PRT': 'Portugal',
    'POL': 'Pologne',
    'CZE': 'République tchèque',
    'SVK': 'Slovaquie',
    'RUS': 'Russie',
    'TUR': 'Turquie',
    'GRC': 'Grèce',
    'MAR': 'Maroc',
    'DZA': 'Algérie',
    'TUN': 'Tunisie'
  };
  
  // Vérifier si le nom est exactement un code pays
  if (countryCodeMapping[nameUpper]) {
    return {
      isCountryCode: true,
      suggestedNationality: countryCodeMapping[nameUpper]
    };
  }
  
  // Vérifier les codes pays de 2 lettres courants
  const countryCode2Mapping: Record<string, string> = {
    'IE': 'Irlande',
    'GB': 'Royaume-Uni', 
    'US': 'États-Unis',
    'CA': 'Canada',
    'FR': 'France',
    'DE': 'Allemagne',
    'ES': 'Espagne',
    'IT': 'Italie',
    'BE': 'Belgique',
    'CH': 'Suisse',
    'AT': 'Autriche',
    'NL': 'Pays-Bas'
  };
  
  if (countryCode2Mapping[nameUpper]) {
    return {
      isCountryCode: true,
      suggestedNationality: countryCode2Mapping[nameUpper]
    };
  }
  
  return { isCountryCode: false };
};

/**
 * 🔧 CORRECTION INTELLIGENTE DES ERREURS DE SAISIE OCR
 * Corrige les erreurs communes d'OCR dans les noms irlandais et autres
 */
export const correctOCRNameErrors = (name: string): string => {
  if (!name) return name;
  
  let corrected = name;
  
  // Corrections spécifiques irlandaises
  corrected = corrected
    .replace(/^IRL\s*/i, '')  // Supprimer "IRL" au début
    .replace(/\s*IRL$/i, '')  // Supprimer "IRL" à la fin
    .replace(/\bIRL\b/gi, '') // Supprimer "IRL" au milieu
    .trim();
  
  // Corrections OCR communes
  corrected = corrected
    .replace(/0/g, 'O')    // 0 → O
    .replace(/1/g, 'I')    // 1 → I  
    .replace(/5/g, 'S')    // 5 → S
    .replace(/8/g, 'B')    // 8 → B
    .trim();
  
  return corrected;
};
