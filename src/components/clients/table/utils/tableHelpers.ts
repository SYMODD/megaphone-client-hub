
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

// Helper functions for default values
export const getPointOperation = (pointOperation: string | undefined): string => {
  return pointOperation || "agence_centrale";
};

export const getCategorie = (categorie: string | undefined): string => {
  return categorie || "agence";
};
