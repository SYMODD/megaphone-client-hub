export const normalizeNationality = (nationality: string): string => {
  if (!nationality) return "";
  
  const normalizedNationality = nationality.toLowerCase().trim();

  

  
  // Mapping complet des nationalités vers le format standard
  const nationalityMapping: Record<string, string> = {
    // Maroc
    "maroc": "Maroc",
    "marocain": "Maroc", 
    "marocaine": "Maroc",
    "moroccan": "Maroc",
    "morocco": "Maroc",
    "royaume du maroc": "Maroc",
    "mar": "Maroc",
    "ma": "Maroc",
    
    // France
    "france": "France",
    "français": "France",
    "française": "France", 
    "francais": "France",
    "francaise": "France",
    "french": "France",
    "république française": "France",
    "republique francaise": "France",
    "fra": "France",
    "fr": "France",
    
    // Espagne
    "espagne": "Espagne",
    "español": "Espagne",
    "española": "Espagne",
    "espanol": "Espagne",
    "espanola": "Espagne", 
    "spanish": "Espagne",
    "spain": "Espagne",
    "reino de españa": "Espagne",
    "esp": "Espagne",
    "es": "Espagne",
    
    // Algérie
    "algérie": "Algérie",
    "algerie": "Algérie",
    "algérien": "Algérie",
    "algérienne": "Algérie",
    "algerien": "Algérie",
    "algerienne": "Algérie",
    "algerian": "Algérie",
    "algeria": "Algérie",
    
    // Tunisie
    "tunisie": "Tunisie",
    "tunisien": "Tunisie",
    "tunisienne": "Tunisie",
    "tunisian": "Tunisie",
    "tunisia": "Tunisie",
    
    // Autres pays fréquents
    "allemagne": "Allemagne",
    "german": "Allemagne", 
    "deutsch": "Allemagne",
    "deutsche": "Allemagne",
    "germany": "Allemagne",
    "deu": "Allemagne",
    "de": "Allemagne",
    "ger": "Allemagne",
    
    "italie": "Italie",
    "italien": "Italie",
    "italienne": "Italie",
    "italian": "Italie",
    "italy": "Italie",
    "italiana": "Italie",
    "ita": "Italie",
    "it": "Italie",
    
    "portugal": "Portugal",
    "portugais": "Portugal",
    "portugaise": "Portugal",
    "portuguese": "Portugal",
    "portuguesa": "Portugal",
    
    "belgique": "Belgique",
    "belge": "Belgique",
    "belgian": "Belgique",
    "belgium": "Belgique",
    "bel": "Belgique",
    "be": "Belgique",
    
    "pays-bas": "Pays-Bas",
    "pays bas": "Pays-Bas",
    "néerlandais": "Pays-Bas",
    "neerlandais": "Pays-Bas",
    "dutch": "Pays-Bas",
    "netherlands": "Pays-Bas",
    "nederland": "Pays-Bas",
    "nld": "Pays-Bas",
    "nl": "Pays-Bas",
    
    "suisse": "Suisse",
    "swiss": "Suisse",
    "schweiz": "Suisse",
    "switzerland": "Suisse",
    "che": "Suisse",
    "ch": "Suisse",
    
    "canada": "Canada",
    "canadien": "Canada",
    "canadienne": "Canada",
    "canadian": "Canada",
    "canadian/ canadienne": "Canada",
    "canadian/canadienne": "Canada",
    
    "états-unis": "États-Unis",
    "etats-unis": "États-Unis",
    "usa": "États-Unis",
    "american": "États-Unis",
    "américain": "États-Unis",
    "americain": "États-Unis",
    "united states": "États-Unis",
    "us": "États-Unis",
    
    "royaume-uni": "Royaume-Uni",
    "royaume uni": "Royaume-Uni",
    "british": "Royaume-Uni",
    "anglais": "Royaume-Uni",
    "english": "Royaume-Uni",
    "uk": "Royaume-Uni",
    "united kingdom": "Royaume-Uni",
    "gbr": "Royaume-Uni",
    "gb": "Royaume-Uni",
    
    // Irlande
    "irlande": "Irlande",
    "ireland": "Irlande",
    "irish": "Irlande",
    "irlandais": "Irlande",
    "irlandaise": "Irlande",
    "éire": "Irlande",
    "eire": "Irlande",
    "éire/ireland/irlande": "Irlande",
    "eire/ireland/irlande": "Irlande",
    "irl": "Irlande",

    // Pays d'Europe de l'Est
    "slovaquie": "Slovaquie",
    "slovak": "Slovaquie",
    "slovakia": "Slovaquie",
    "slovenská republika": "Slovaquie",
    "slovenska republika": "Slovaquie",
    
    "république tchèque": "République tchèque",
    "republique tcheque": "République tchèque",
    "czech": "République tchèque",
    "czech republic": "République tchèque",
    "ceska": "République tchèque",
    "ceska republika": "République tchèque",
    "česká republika": "République tchèque",
    "ceska republika / czech republic": "République tchèque",
    "česká republika / czech republic": "République tchèque",
    "tchèque": "République tchèque",
    
    "pologne": "Pologne",
    "polish": "Pologne",
    "polska": "Pologne",
    "polonaise": "Pologne",
    
    "hongrie": "Hongrie",
    "hungarian": "Hongrie",
    "magyar": "Hongrie",
    "hongroise": "Hongrie",
    
    // Colombie
    "colombie": "Colombie",
    "colombia": "Colombie",
    "colombian": "Colombie",
    "colombiana": "Colombie",
    "colombiano": "Colombie",
    
    // 🆕 Mappings supplémentaires sécurisés basés sur l'audit
    "thai": "Thaïlande",
    "thailand": "Thaïlande",
    "united states of america": "États-Unis",
    "british citizen": "Royaume-Uni"
  };

  return nationalityMapping[normalizedNationality] || 
         nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
};
