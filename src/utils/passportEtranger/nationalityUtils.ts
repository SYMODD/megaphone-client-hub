
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
    "AMERICAN", "BRITISH", "SPANISH", "ESPAÑOLA", "ESPANOLA", "ITALIAN", "ITALIANA", "BELGIAN", "BELGE",
    "DUTCH", "NEDERLANDSE", "SWISS", "SCHWEIZ", "SUISSE", "AUSTRIAN", "ÖSTERREICH", "OSTERREICH",
    "PORTUGUESE", "PORTUGUESA", "NORWEGIAN", "NORSK", "SWEDISH", "SVENSK", "DANISH", "DANSK",
    "FINNISH", "SUOMI", "GREEK", "ELLINIKI", "POLISH", "POLSKA", "RUSSIAN", "ROSSIYSKAYA",
    
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
