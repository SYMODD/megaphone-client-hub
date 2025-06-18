
// Helper function to get document type label
export const getDocumentTypeLabel = (documentType: string | undefined): string => {
  switch (documentType) {
    case 'cin':
      return 'CIN';
    case 'passport_marocain':
      return 'Passeport Marocain';
    case 'passport_etranger':
      return 'Passeport Étranger';
    case 'carte_sejour':
      return 'Carte de Séjour';
    default:
      return 'Document';
  }
};

// Helper function to get document type with icon
export const getDocumentTypeWithIcon = (documentType: string | undefined): string => {
  switch (documentType) {
    case 'cin':
      return '🆔 CIN';
    case 'passport_marocain':
      return '🇲🇦 Passeport Marocain';
    case 'passport_etranger':
      return '🌍 Passeport Étranger';
    case 'carte_sejour':
      return '🏠 Carte de Séjour';
    default:
      return '📄 Document';
  }
};

// Helper functions for default values
export const getPointOperation = (pointOperation: string | undefined): string => {
  return pointOperation || "agence_centrale";
};

export const getCategorie = (categorie: string | undefined, pointOperation?: string): string => {
  // Si on a déjà une catégorie valide, l'utiliser
  if (categorie && categorie !== '') return categorie;
  
  // Sinon, déduire de point_operation
  if (pointOperation) {
    const normalizedPoint = pointOperation.toLowerCase();
    if (normalizedPoint.includes('aeroport')) return 'aeroport';
    if (normalizedPoint.includes('navire') || normalizedPoint.includes('port')) return 'navire';
  }
  
  // Fallback par défaut
  return "agence";
};
