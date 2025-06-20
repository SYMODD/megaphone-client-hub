
export const handlePDFError = (error: unknown): never => {
  console.error('❌ Erreur lors de la génération du PDF:', error);
  
  // Messages d'erreur plus détaillés
  if (error instanceof Error) {
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Le fichier template n\'est pas un PDF valide');
    } else if (error.message.includes('Encrypted')) {
      throw new Error('Le PDF template est protégé par mot de passe');
    }
  }
  
  throw new Error(`Impossible de générer le contrat PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
};

export const validateInputs = (templateFile: File, client: any, fieldMappings: any[]): void => {
  if (!templateFile) {
    throw new Error('Aucun fichier template fourni');
  }
  
  if (!client) {
    throw new Error('Aucun client sélectionné');
  }
  
  if (!fieldMappings || fieldMappings.length === 0) {
    // Mapping optionnel, génération du PDF sans remplacement
  }
};
