
export const normalizeNationality = (nationality: string): string => {
  if (!nationality) return "";
  
  const normalizedNationality = nationality.toLowerCase().trim();
  
  console.log("🌍 Normalisation nationalité:", {
    entrée: nationality,
    normalisée: normalizedNationality
  });
  
  // Mapping complet des nationalités vers le format standard
  const nationalityMapping: Record<string, string> = {
    // Maroc
    "maroc": "Maroc",
    "marocain": "Maroc", 
    "marocaine": "Maroc",
    "moroccan": "Maroc",
    "morocco": "Maroc",
    "royaume du maroc": "Maroc",
    
    // France
    "france": "France",
    "français": "France",
    "française": "France", 
    "francais": "France",
    "francaise": "France",
    "french": "France",
    "république française": "France",
    "republique francaise": "France",
    
    // Espagne
    "espagne": "Espagne",
    "español": "Espagne",
    "española": "Espagne",
    "espanol": "Espagne",
    "espanola": "Espagne", 
    "spanish": "Espagne",
    "spain": "Espagne",
    "reino de españa": "Espagne",
    
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
    
    "italie": "Italie",
    "italien": "Italie",
    "italienne": "Italie",
    "italian": "Italie",
    "italy": "Italie",
    "italiana": "Italie",
    
    "portugal": "Portugal",
    "portugais": "Portugal",
    "portugaise": "Portugal",
    "portuguese": "Portugal",
    "portuguesa": "Portugal",
    
    "belgique": "Belgique",
    "belge": "Belgique",
    "belgian": "Belgique",
    "belgium": "Belgique",
    
    "pays-bas": "Pays-Bas",
    "pays bas": "Pays-Bas",
    "néerlandais": "Pays-Bas",
    "neerlandais": "Pays-Bas",
    "dutch": "Pays-Bas",
    "netherlands": "Pays-Bas",
    "nederland": "Pays-Bas",
    
    "suisse": "Suisse",
    "swiss": "Suisse",
    "schweiz": "Suisse",
    "switzerland": "Suisse",
    
    "canada": "Canada",
    "canadien": "Canada",
    "canadienne": "Canada",
    "canadian": "Canada",
    
    "états-unis": "États-Unis",
    "etats-unis": "États-Unis",
    "usa": "États-Unis",
    "american": "États-Unis",
    "américain": "États-Unis",
    "americain": "États-Unis",
    "united states": "États-Unis",
    
    "royaume-uni": "Royaume-Uni",
    "royaume uni": "Royaume-Uni",
    "british": "Royaume-Uni",
    "anglais": "Royaume-Uni",
    "english": "Royaume-Uni",
    "uk": "Royaume-Uni",
    "united kingdom": "Royaume-Uni"
  };

  const result = nationalityMapping[normalizedNationality] || 
                nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
  
  console.log("✅ Nationalité normalisée:", result);
  return result;
};
