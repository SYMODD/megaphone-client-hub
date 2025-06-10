
import { PassportExtractionContext } from "@/types/passportEtrangerTypes";
import { 
  safeStringTrim, 
  isValidName, 
  isValidNationality, 
  extractValueFromLine 
} from "./stringUtils";
import { convertMainTextNationality, checkForNationalityInLine } from "./nationalityUtils";

export const extractDataFromMainText = (lines: string[], passportData: any) => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    
    // Recherche du nom (Surname/Name/Nom)
    if (line.includes('SURNAME') || line.includes('NAME') || line.match(/^\d+\.\s*NOM/)) {
      // Le nom peut être sur la même ligne ou la ligne suivante
      let nameValue = extractValueFromLine(line, ['SURNAME', 'NAME', 'NOM']);
      if (!nameValue && nextLine) {
        nameValue = extractValueFromLine(nextLine, []);
      }
      if (nameValue && isValidName(nameValue)) {
        passportData.nom = safeStringTrim(nameValue);
        console.log("Nom trouvé dans le texte principal:", nameValue);
      }
    }
    
    // Recherche du prénom (Given names/Prénoms/Vornamen)
    if (line.includes('GIVEN') || line.includes('PRENOM') || line.includes('VORNAMEN')) {
      let prenomValue = extractValueFromLine(line, ['GIVEN', 'NAMES', 'PRENOM', 'VORNAMEN']);
      if (!prenomValue && nextLine) {
        prenomValue = extractValueFromLine(nextLine, []);
      }
      if (prenomValue && isValidName(prenomValue)) {
        passportData.prenom = safeStringTrim(prenomValue);
        console.log("Prénom trouvé dans le texte principal:", prenomValue);
      }
    }

    // Recherche de la nationalité dans le texte principal
    if (line.includes('NATIONALITY') || line.includes('STAATSANGEHÖRIGKEIT') || line.includes('NATIONALITÉ')) {
      let nationalityValue = extractValueFromLine(line, ['NATIONALITY', 'STAATSANGEHÖRIGKEIT', 'NATIONALITÉ']);
      if (!nationalityValue && nextLine) {
        nationalityValue = extractValueFromLine(nextLine, []);
      }
      if (nationalityValue && isValidNationality(nationalityValue)) {
        // Convertir les nationalités spécifiques
        const convertedNationality = convertMainTextNationality(nationalityValue);
        passportData.nationalite = safeStringTrim(convertedNationality);
        console.log("Nationalité trouvée dans le texte principal:", nationalityValue, "->", convertedNationality);
      }
    }

    // Patterns spécifiques pour différents formats de passeports
    
    // Format allemand : recherche de lignes avec des noms isolés
    if (line.match(/^[A-Z]{2,20}$/) && !line.match(/^(PASSPORT|REISEPASS|CANADA|DEUTSCH|GERMAN)$/)) {
      // Vérifier si c'est potentiellement un nom
      if (isValidName(line) && !passportData.nom) {
        passportData.nom = safeStringTrim(line);
        console.log("Nom potentiel trouvé (format allemand):", line);
      }
    }
    
    // Format canadien : recherche après des patterns spécifiques
    if (line.includes('TYPE') && nextLine) {
      const possibleName = safeStringTrim(nextLine);
      if (isValidName(possibleName) && !passportData.nom) {
        passportData.nom = possibleName;
        console.log("Nom trouvé après TYPE:", possibleName);
      }
    }

    // Recherche spécifique pour les nationalités dans des lignes isolées
    if (!passportData.nationalite) {
      const nationalityCheck = checkForNationalityInLine(line);
      if (nationalityCheck) {
        passportData.nationalite = nationalityCheck;
        console.log("Nationalité trouvée dans ligne isolée:", nationalityCheck);
      }
    }
  }
};
