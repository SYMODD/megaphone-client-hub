
import { PassportExtractionContext } from "@/types/passportEtrangerTypes";
import { 
  safeStringTrim, 
  isValidName, 
  isValidNationality, 
  extractValueFromLine,
  containsMultilingualKeywords
} from "./stringUtils";
import { convertMainTextNationality, checkForNationalityInLine } from "./nationalityUtils";
import { 
  NAME_KEYWORDS, 
  NATIONALITY_KEYWORDS, 
  PASSPORT_FORMAT_PATTERNS,
  detectPassportFormat 
} from "./multilingualPatterns";

export const extractDataFromMainText = (lines: string[], passportData: any) => {
  console.log("🌍 Extraction multilingue - Analyse de", lines.length, "lignes");
  
  // Détecter le format du passeport
  const passportFormat = detectPassportFormat(lines);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    
    // Extraction multilingue du nom de famille
    if (containsMultilingualKeywords(line, NAME_KEYWORDS.surname)) {
      let nameValue = extractValueFromLine(line, NAME_KEYWORDS.surname);
      if (!nameValue && nextLine) {
        nameValue = extractValueFromLine(nextLine, []);
      }
      if (nameValue && isValidName(nameValue)) {
        passportData.nom = safeStringTrim(nameValue);
        console.log("✅ Nom de famille trouvé (multilingue):", nameValue);
      }
    }
    
    // Extraction multilingue du prénom
    if (containsMultilingualKeywords(line, NAME_KEYWORDS.givenName)) {
      let prenomValue = extractValueFromLine(line, NAME_KEYWORDS.givenName);
      if (!prenomValue && nextLine) {
        prenomValue = extractValueFromLine(nextLine, []);
      }
      if (prenomValue && isValidName(prenomValue)) {
        passportData.prenom = safeStringTrim(prenomValue);
        console.log("✅ Prénom trouvé (multilingue):", prenomValue);
      }
    }

    // Extraction multilingue de la nationalité
    if (containsMultilingualKeywords(line, NATIONALITY_KEYWORDS)) {
      let nationalityValue = extractValueFromLine(line, NATIONALITY_KEYWORDS);
      if (!nationalityValue && nextLine) {
        nationalityValue = extractValueFromLine(nextLine, []);
      }
      if (nationalityValue && isValidNationality(nationalityValue)) {
        const convertedNationality = convertMainTextNationality(nationalityValue);
        passportData.nationalite = safeStringTrim(convertedNationality);
        console.log("✅ Nationalité trouvée (multilingue):", nationalityValue, "->", convertedNationality);
      }
    }

    // Traitement spécifique selon le format détecté
    if (passportFormat === 'numbered') {
      const match = line.match(PASSPORT_FORMAT_PATTERNS.numberedField);
      if (match) {
        const fieldName = match[2].trim();
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.surname) && !passportData.nom) {
          const nameValue = extractValueFromLine(nextLine || "", []);
          if (nameValue && isValidName(nameValue)) {
            passportData.nom = safeStringTrim(nameValue);
            console.log("✅ Nom trouvé (format numéroté):", nameValue);
          }
        }
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.givenName) && !passportData.prenom) {
          const prenomValue = extractValueFromLine(nextLine || "", []);
          if (prenomValue && isValidName(prenomValue)) {
            passportData.prenom = safeStringTrim(prenomValue);
            console.log("✅ Prénom trouvé (format numéroté):", prenomValue);
          }
        }
      }
    }

    if (passportFormat === 'colon') {
      const match = line.match(PASSPORT_FORMAT_PATTERNS.colonFormat);
      if (match) {
        const fieldName = match[1].trim();
        const fieldValue = match[2].trim();
        
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.surname) && !passportData.nom && isValidName(fieldValue)) {
          passportData.nom = safeStringTrim(fieldValue);
          console.log("✅ Nom trouvé (format deux points):", fieldValue);
        }
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.givenName) && !passportData.prenom && isValidName(fieldValue)) {
          passportData.prenom = safeStringTrim(fieldValue);
          console.log("✅ Prénom trouvé (format deux points):", fieldValue);
        }
      }
    }
    
    // Format allemand amélioré : recherche de lignes avec des noms isolés
    if (passportFormat === 'german' && line.match(PASSPORT_FORMAT_PATTERNS.germanIsolatedName) && 
        !line.match(/^(PASSPORT|REISEPASS|CANADA|DEUTSCH|GERMAN|BUNDESREPUBLIK)$/)) {
      
      if (isValidName(line)) {
        if (!passportData.nom) {
          passportData.nom = safeStringTrim(line);
          console.log("✅ Nom de famille potentiel (format allemand):", line);
        } else if (!passportData.prenom) {
          passportData.prenom = safeStringTrim(line);
          console.log("✅ Prénom potentiel (format allemand):", line);
        }
      }
    }
    
    // Format canadien et autres : recherche après des patterns spécifiques
    if (line.includes('TYPE') && nextLine) {
      const possibleName = safeStringTrim(nextLine);
      if (isValidName(possibleName) && !passportData.nom) {
        passportData.nom = possibleName;
        console.log("✅ Nom trouvé après TYPE:", possibleName);
      }
    }

    // Recherche spécifique pour les nationalités dans des lignes isolées
    if (!passportData.nationalite) {
      const nationalityCheck = checkForNationalityInLine(line);
      if (nationalityCheck) {
        passportData.nationalite = nationalityCheck;
        console.log("✅ Nationalité trouvée dans ligne isolée:", nationalityCheck);
      }
    }
  }

  // Post-traitement intelligent pour corriger l'ordre nom/prénom
  if (passportData.nom && passportData.prenom) {
    // Cas 1: Le "nom" est plus court que le "prénom" et très court (probablement un prénom)
    if (passportData.nom.length < passportData.prenom.length && passportData.nom.length <= 4) {
      console.log("🔄 Inversion détectée (longueur) - échange nom/prénom:", passportData.nom, "<->", passportData.prenom);
      const temp = passportData.nom;
      passportData.nom = passportData.prenom;
      passportData.prenom = temp;
      console.log("✅ Après correction - Nom:", passportData.nom, "Prénom:", passportData.prenom);
    }
    
    // Cas 2: Détection basée sur des patterns courants de prénoms courts
    const commonShortFirstNames = ['RIM', 'ALI', 'ANA', 'EVA', 'LEA', 'MAX', 'TOM', 'JAN', 'KAI'];
    if (commonShortFirstNames.includes(passportData.nom) && passportData.nom.length <= 4) {
      console.log("🔄 Prénom court détecté - échange nom/prénom:", passportData.nom, "<->", passportData.prenom);
      const temp = passportData.nom;
      passportData.nom = passportData.prenom;
      passportData.prenom = temp;
      console.log("✅ Après correction - Nom:", passportData.nom, "Prénom:", passportData.prenom);
    }
  }

  console.log("🎯 Extraction multilingue terminée - Résultats:", {
    nom: passportData.nom,
    prenom: passportData.prenom,
    nationalite: passportData.nationalite,
    format: passportFormat
  });
};
