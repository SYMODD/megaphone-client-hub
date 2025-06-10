
import { safeStringTrim } from "./stringUtils";

export const convertMainTextNationality = (nationality: string): string => {
  const nationalityUpper = nationality.toUpperCase().trim();
  
  // Mapping spécifique pour les nationalités trouvées dans le texte principal
  const mainTextMapping: Record<string, string> = {
    "DEUTSCH": "Allemagne",
    "GERMAN": "Allemagne", 
    "CANADIAN": "Canada",
    "CANADIENNE": "Canada",
    "FRENCH": "France",
    "FRANÇAISE": "France",
    "AMERICAN": "États-Unis",
    "BRITISH": "Royaume-Uni",
    "SPANISH": "Espagne",
    "ITALIAN": "Italie",
    "BELGIAN": "Belgique",
    "DUTCH": "Pays-Bas",
    "SWISS": "Suisse",
    "AUSTRIAN": "Autriche",
    "PORTUGUESE": "Portugal"
  };

  return mainTextMapping[nationalityUpper] || nationality;
};

export const checkForNationalityInLine = (line: string): string | null => {
  const lineUpper = line.toUpperCase().trim();
  
  // Vérifier si la ligne contient uniquement une nationalité connue
  const knownNationalities = [
    "DEUTSCH", "GERMAN", "CANADIAN", "CANADIENNE", "FRENCH", "FRANÇAISE",
    "AMERICAN", "BRITISH", "SPANISH", "ITALIAN", "BELGIAN", "DUTCH",
    "SWISS", "AUSTRIAN", "PORTUGUESE", "MOROCCAN", "TUNISIAN", "ALGERIAN"
  ];

  for (const nat of knownNationalities) {
    if (lineUpper === nat) {
      return convertMainTextNationality(nat);
    }
  }

  return null;
};
