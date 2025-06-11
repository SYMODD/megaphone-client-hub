
// Utilitaire pour normaliser les nationalités extraites par OCR
export const normalizeNationality = (nationality: string | undefined): string => {
  if (!nationality) return "";
  
  const nat = nationality.toLowerCase().trim();
  
  // Mapping des codes et variations vers les noms complets
  const nationalityMap: Record<string, string> = {
    // Maroc
    'mar': 'Maroc',
    'morocco': 'Maroc',
    'maroc': 'Maroc',
    'marocain': 'Maroc',
    'marocaine': 'Maroc',
    'moroccan': 'Maroc',
    
    // France
    'fra': 'France',
    'france': 'France',
    'français': 'France',
    'française': 'France',
    'french': 'France',
    
    // Allemagne
    'deu': 'Allemagne',
    'germany': 'Allemagne',
    'allemagne': 'Allemagne',
    'allemand': 'Allemagne',
    'allemande': 'Allemagne',
    'german': 'Allemagne',
    'deutsch': 'Allemagne',
    'd': 'Allemagne',
    'd<<': 'Allemagne',
    
    // Algérie
    'dza': 'Algérie',
    'algeria': 'Algérie',
    'algérie': 'Algérie',
    'algérien': 'Algérie',
    'algérienne': 'Algérie',
    'algerian': 'Algérie',
    
    // Tunisie
    'tun': 'Tunisie',
    'tunisia': 'Tunisie',
    'tunisie': 'Tunisie',
    'tunisien': 'Tunisie',
    'tunisienne': 'Tunisie',
    'tunisian': 'Tunisie',
    
    // Espagne
    'esp': 'Espagne',
    'spain': 'Espagne',
    'espagne': 'Espagne',
    'espagnol': 'Espagne',
    'espagnole': 'Espagne',
    'spanish': 'Espagne',
    
    // Italie
    'ita': 'Italie',
    'italy': 'Italie',
    'italie': 'Italie',
    'italien': 'Italie',
    'italienne': 'Italie',
    'italian': 'Italie',
    
    // Royaume-Uni
    'gbr': 'Royaume-Uni',
    'uk': 'Royaume-Uni',
    'united kingdom': 'Royaume-Uni',
    'royaume-uni': 'Royaume-Uni',
    'britannique': 'Royaume-Uni',
    'british': 'Royaume-Uni',
    
    // États-Unis
    'usa': 'États-Unis',
    'united states': 'États-Unis',
    'états-unis': 'États-Unis',
    'américain': 'États-Unis',
    'américaine': 'États-Unis',
    'american': 'États-Unis',
    
    // Sénégal
    'sen': 'Sénégal',
    'senegal': 'Sénégal',
    'sénégal': 'Sénégal',
    'sénégalais': 'Sénégal',
    'sénégalaise': 'Sénégal',
    'senegalese': 'Sénégal',
    
    // Mali
    'mli': 'Mali',
    'mali': 'Mali',
    'malien': 'Mali',
    'malienne': 'Mali',
    'malian': 'Mali',
    
    // Côte d'Ivoire
    'civ': 'Côte d\'Ivoire',
    'ivory coast': 'Côte d\'Ivoire',
    'côte d\'ivoire': 'Côte d\'Ivoire',
    'ivoirien': 'Côte d\'Ivoire',
    'ivoirienne': 'Côte d\'Ivoire',
    'ivorian': 'Côte d\'Ivoire',
    
    // Belgique
    'bel': 'Belgique',
    'belgium': 'Belgique',
    'belgique': 'Belgique',
    'belge': 'Belgique',
    'belgian': 'Belgique',
    
    // Pays-Bas
    'nld': 'Pays-Bas',
    'netherlands': 'Pays-Bas',
    'pays-bas': 'Pays-Bas',
    'néerlandais': 'Pays-Bas',
    'néerlandaise': 'Pays-Bas',
    'dutch': 'Pays-Bas',
    
    // Suisse
    'che': 'Suisse',
    'switzerland': 'Suisse',
    'suisse': 'Suisse',
    'suisse': 'Suisse',
    'swiss': 'Suisse'
  };
  
  // Chercher une correspondance exacte
  const normalized = nationalityMap[nat];
  if (normalized) {
    console.log(`🌍 Nationalité normalisée: "${nationality}" → "${normalized}"`);
    return normalized;
  }
  
  // Si pas de correspondance, retourner la valeur originale en format propre
  const cleaned = nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
  console.log(`🌍 Nationalité conservée: "${nationality}" → "${cleaned}"`);
  return cleaned;
};
