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
    
    // Nations Unies - Passeports officiels ONU
    "UNITED NATIONS": "Nations Unies",
    "NATIONS UNIES": "Nations Unies",
    "UNITED NATIONS - NATIONS UNIES": "Nations Unies",
    "NATIONS UNIES - UNITED NATIONS": "Nations Unies",
    "UN": "Nations Unies",
    "ONU": "Nations Unies",
    
    // Irlandais
    "IRISH": "Irlande",
    "IRELAND": "Irlande",
    "ÉIRE": "Irlande",
    "EIRE": "Irlande",
    "ÉIREANNACH": "Irlande",              // ← AJOUT CRITIQUE terme gaélique
    "EIREANNACH": "Irlande",              // ← AJOUT CRITIQUE sans accent
    "ÉIREANNACH/IRISH": "Irlande",        // ← AJOUT CRITIQUE format mixte
    "EIREANNACH/IRISH": "Irlande",        // ← AJOUT CRITIQUE format mixte sans accent
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
    "NEDERLAND": "Pays-Bas",                 // ← AJOUT CRITIQUE NÉERLANDAIS
    "NEDERLANDS": "Pays-Bas",                // ← AJOUT VARIANTE
    "HOLLAND": "Pays-Bas",                   // ← AJOUT TERME COURANT
    "HOLLANDE": "Pays-Bas",                  // ← AJOUT FRANÇAIS
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
    "MOROCAIN": "Maroc",                     // ← AJOUT CRITIQUE FRANÇAIS MASCULIN
    "MAROCAINE": "Maroc",
    "MAROC": "Maroc",                        // ← AJOUT CRITIQUE FORME DIRECTE
    "MOROCCO": "Maroc",                      // ← AJOUT FORME ANGLAISE
    "ROYAUME DU MAROC": "Maroc",            // ← AJOUT FORME OFFICIELLE
    "KINGDOM OF MOROCCO": "Maroc",          // ← AJOUT FORME ANGLAISE OFFICIELLE
    "TUNISIAN": "Tunisie",
    "TUNISIENNE": "Tunisie",
    "ALGERIAN": "Algérie",
    "ALGERIENNE": "Algérie",
    
    // Afrique subsaharienne
    "SENEGALESE": "Sénégal",
    "SÉNÉGALAISE": "Sénégal",                // ← AJOUT CRITIQUE SÉNÉGAL
    "SENEGALAISE": "Sénégal",                // ← AJOUT SANS ACCENT
    "SÉNÉGAL": "Sénégal",                    // ← AJOUT DIRECT
    "SENEGAL": "Sénégal",                    // ← AJOUT SANS ACCENT
    "RÉPUBLIQUE DU SÉNÉGAL": "Sénégal",     // ← AJOUT FORME OFFICIELLE
    "REPUBLIQUE DU SENEGAL": "Sénégal",     // ← AJOUT SANS ACCENTS
    
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
    "ROMÂNĂ": "Roumanie",                    // ← AJOUT CRITIQUE pour cartes d'identité roumaines
    "ROMANA": "Roumanie",                    // ← AJOUT CRITIQUE pour cartes d'identité roumaines
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
  
  // 🆕 DÉTECTION PRIORITAIRE ESPAÑOLA/ESPANOLA pour passeports espagnols
  if (lineUpper.includes("ESPAÑOLA") || lineUpper.includes("ESPANOLA")) {
    console.log("🇪🇸 ESPAÑOLA détecté dans:", line);
    return "Espagne";
  }
  
  // 🆕 DÉTECTION AUTRES NATIONALITÉS FRÉQUENTES AVEC ET SANS ACCENTS
  const priorityNationalities = [
    { patterns: ["UNITED NATIONS", "NATIONS UNIES", "UNITED NATIONS - NATIONS UNIES"], nationality: "Nations Unies" },
    { patterns: ["ÉIREANNACH", "EIREANNACH", "ÉIREANNACH/IRISH", "EIREANNACH/IRISH"], nationality: "Irlande" },
    { patterns: ["FRANÇAISE", "FRANCAISE"], nationality: "France" },
    { patterns: ["ITALIANA"], nationality: "Italie" },
    { patterns: ["DEUTSCHE"], nationality: "Allemagne" },
    { patterns: ["PORTUGUESA"], nationality: "Portugal" },
    { patterns: ["CANADIENNE"], nationality: "Canada" },
    { patterns: ["BRITISH CITIZEN"], nationality: "Royaume-Uni" },
    { patterns: ["COLOMBIANA"], nationality: "Colombie" },
    { patterns: ["BRASILEIRA"], nationality: "Brésil" },
    { patterns: ["ROMÂNĂ", "ROMANA"], nationality: "Roumanie" },
    { patterns: ["SÉNÉGALAISE", "SENEGALAISE", "RÉPUBLIQUE DU SÉNÉGAL", "REPUBLIQUE DU SENEGAL"], nationality: "Sénégal" },
    { patterns: ["MAROCAINE", "MOROCAIN", "MAROC", "ROYAUME DU MAROC", "KINGDOM OF MOROCCO"], nationality: "Maroc" }
  ];
  
  for (const {patterns, nationality} of priorityNationalities) {
    for (const pattern of patterns) {
      if (lineUpper.includes(pattern)) {
        console.log(`🌍 ${pattern} détecté dans:`, line);
        return nationality;
      }
    }
  }
  
  // Liste étendue des nationalités reconnues (fallback)
  const knownNationalities = [
    // Européennes
    "DEUTSCH", "DEUTSCHE", "GERMAN", "CANADIAN", "CANADIENNE", "FRENCH", "FRANÇAISE", "FRANCAISE",
    "AMERICAN", "BRITISH", "IRISH", "IRELAND", "ÉIRE", "EIRE", "ÉIREANNACH", "EIREANNACH", "SPANISH", "ESPAÑOLA", "ESPANOLA", 
    "ITALIAN", "ITALIANA", "BELGIAN", "BELGE", "DUTCH", "NEDERLANDSE", "NEDERLAND", "NEDERLANDS", "HOLLAND", "HOLLANDE", "SWISS", "SCHWEIZ", "SUISSE", 
    "AUSTRIAN", "ÖSTERREICH", "OSTERREICH", "PORTUGUESE", "PORTUGUESA", "NORWEGIAN", "NORSK", 
    "SWEDISH", "SVENSK", "DANISH", "DANSK", "FINNISH", "SUOMI", "GREEK", "ELLINIKI", "POLISH", 
    "POLSKA", "RUSSIAN", "ROSSIYSKAYA", "ROMANIAN", "ROMÂNĂ", "ROMANA",
    
    // Maghreb et Moyen-Orient
    "MOROCCAN", "MOROCAIN", "MAROCAINE", "MAROC", "MOROCCO", "ROYAUME DU MAROC", "KINGDOM OF MOROCCO",
    "TUNISIAN", "TUNISIENNE", "ALGERIAN", "ALGERIENNE", "TURKISH", "TURK",
    "EGYPTIAN", "EGYPTIENNE", "LEBANESE", "LIBANAISE", "SYRIAN", "SYRIENNE", "JORDANIAN", "JORDANIENNE",
    
    // Afrique subsaharienne
    "SENEGALESE", "SÉNÉGALAISE", "SENEGALAISE", "SÉNÉGAL", "SENEGAL", "RÉPUBLIQUE DU SÉNÉGAL", "REPUBLIQUE DU SENEGAL",
    
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
    'DZ': 'Algérie',   // Version courte du code algérien
    'TUN': 'Tunisie',
    'SEN': 'Sénégal',   // ← AJOUT CRITIQUE SÉNÉGAL
    'IND': 'Inde',      // ← AJOUT CRITIQUE INDE
    'CHN': 'Chine',
    'JPN': 'Japon',
    'KOR': 'Corée du Sud',
    'THA': 'Thaïlande',
    'VNM': 'Vietnam',
    'PHL': 'Philippines',
    'IDN': 'Indonésie',
    'MYS': 'Malaisie',
    'SGP': 'Singapour',
    'AUS': 'Australie',
    'NZL': 'Nouvelle-Zélande',
    'ZAF': 'Afrique du Sud',
    'NGA': 'Nigeria',
    'KEN': 'Kenya',
    'ETH': 'Éthiopie',
    'GHA': 'Ghana',
    'CIV': 'Côte d\'Ivoire',
    'EGY': 'Égypte',
    'SAU': 'Arabie saoudite',
    'ARE': 'Émirats arabes unis',
    'JOR': 'Jordanie',
    'LBN': 'Liban',
    'SYR': 'Syrie',
    'IRQ': 'Irak',
    'IRN': 'Iran',
    'AFG': 'Afghanistan',
    'PAK': 'Pakistan',
    'CYP': 'Chypre',
    'ARM': 'Arménie',
    'GEO': 'Géorgie',
    'AZE': 'Azerbaïdjan'
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
    'NL': 'Pays-Bas',
    'IN': 'Inde',      // ← AJOUT CRITIQUE INDE 2 lettres
    'BR': 'Brésil',   // ← AJOUT CRITIQUE BRÉSIL 2 lettres
    'CN': 'Chine',
    'JP': 'Japon'
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
  
  // Vérifier d'abord si c'est un code pays pur
  const codeDetection = detectCountryCodeInName(name);
  if (codeDetection.isCountryCode && name.length <= 3) {
    console.log(`🔧 Nom "${name}" détecté comme code pays pur, suppression`);
    return '';  // Retourner chaîne vide si c'est juste un code pays
  }
  
  // Corrections spécifiques des codes pays intégrés
  corrected = corrected
    .replace(/^IRL\s*/i, '')  // Supprimer "IRL" au début
    .replace(/\s*IRL$/i, '')  // Supprimer "IRL" à la fin
    .replace(/\bIRL\b/gi, '') // Supprimer "IRL" au milieu
    .replace(/^IND\s*/i, '')  // Supprimer "IND" au début
    .replace(/\s*IND$/i, '')  // Supprimer "IND" à la fin
    .replace(/\bIND\b/gi, '') // Supprimer "IND" au milieu
    .replace(/^BRA\s*/i, '')  // Supprimer "BRA" au début
    .replace(/\s*BRA$/i, '')  // Supprimer "BRA" à la fin
    .replace(/\bBRA\b/gi, '') // Supprimer "BRA" au milieu
    .replace(/^CYP\s*/i, '')  // Supprimer "CYP" au début
    .replace(/\s*CYP$/i, '')  // Supprimer "CYP" à la fin
    .replace(/\bCYP\b/gi, '') // Supprimer "CYP" au milieu
    .replace(/^POL\s*/i, '')  // Supprimer "POL" au début
    .replace(/\s*POL$/i, '')  // Supprimer "POL" à la fin
    .replace(/\bPOL\b/gi, '') // Supprimer "POL" au milieu
    .replace(/^GBR\s*/i, '')  // Supprimer "GBR" au début
    .replace(/\s*GBR$/i, '')  // Supprimer "GBR" à la fin
    .replace(/\bGBR\b/gi, '') // Supprimer "GBR" au milieu
    .trim();
  
  // Corrections OCR communes
  corrected = corrected
    .replace(/0/g, 'O')    // 0 → O
    .replace(/1/g, 'I')    // 1 → I  
    .replace(/5/g, 'S')    // 5 → S
    .replace(/8/g, 'B')    // 8 → B
    .trim();
  
  // Si après nettoyage il ne reste rien ou presque rien, retourner chaîne vide
  if (corrected.length < 2) {
    console.log(`🔧 Nom "${name}" devient "${corrected}" après nettoyage, suppression`);
    return '';
  }
  
  return corrected;
};
