
// Helper functions for default values
export const getPointOperation = (pointOperation: string | undefined): string => {
  return pointOperation || "agence_centrale";
};

export const getCategorie = (categorie: string | undefined): string => {
  return categorie || "agence";
};
