
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
    
    // Recherche du nom (Surname/Name/Nom) - c'est le nom de famille
    if (line.includes('SURNAME') || line.includes('NAME') || line.match(/^\d+\.\s*NOM/)) {
      // Le nom peut être sur la même ligne ou la ligne suivante
      let nameValue = extractValueFromLine(line, ['SURNAME', 'NAME', 'NOM']);
      if (!nameValue && nextLine) {
        nameValue = extractValueFromLine(nextLine, []);
      }
      if (nameValue && isValidName(nameValue)) {
        passportData.nom = safeStringTrim(nameValue); // Nom de famille
        console.log("Nom de famille trouvé dans le texte principal:", nameValue);
      }
    }
    
    // Recherche du prénom (Given names/Prénoms/Vornamen) - c'est le prénom
    if (line.includes('GIVEN') || line.includes('PRENOM') || line.includes('VORNAMEN')) {
      let prenomValue = extractValueFromLine(line, ['GIVEN', 'NAMES', 'PRENOM', 'VORNAMEN']);
      if (!prenomValue && nextLine) {
        prenomValue = extractValueFromLine(nextLine, []);
      }
      if (prenomValue && isValidName(prenomValue)) {
        passportData.prenom = safeStringTrim(prenomValue); // Prénom
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
    // Pour ce format, on doit identifier correctement le nom et le prénom
    if (line.match(/^[A-Z]{2,20}$/) && !line.match(/^(PASSPORT|REISEPASS|CANADA|DEUTSCH|GERMAN)$/)) {
      // Vérifier si c'est potentiellement un nom
      if (isValidName(line)) {
        // Si on n'a pas encore de nom de famille, on l'assigne
        if (!passportData.nom) {
          passportData.nom = safeStringTrim(line);
          console.log("Nom de famille potentiel trouvé (format allemand):", line);
        } 
        // Si on a déjà un nom mais pas de prénom, on l'assigne comme prénom
        else if (!passportData.prenom) {
          passportData.prenom = safeStringTrim(line);
          console.log("Prénom potentiel trouvé (format allemand):", line);
        }
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

  // Post-traitement : Si on a détecté les noms dans le mauvais ordre (via format allemand)
  // On vérifie si le "nom" détecté est plus court que le "prénom", ce qui indiquerait une inversion
  if (passportData.nom && passportData.prenom) {
    // Dans le cas allemand RIM/BAHRANI, RIM est plus court et devrait être le prénom
    if (passportData.nom.length < passportData.prenom.length && passportData.nom.length <= 4) {
      console.log("Inversion détectée - échange nom/prénom:", passportData.nom, "<->", passportData.prenom);
      const temp = passportData.nom;
      passportData.nom = passportData.prenom;   // BAHRANI devient le nom
      passportData.prenom = temp;               // RIM devient le prénom
      console.log("Après correction - Nom:", passportData.nom, "Prénom:", passportData.prenom);
    }
  }
};
