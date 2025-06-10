
import { PassportExtractionContext } from "@/types/passportEtrangerTypes";
import { 
  safeStringTrim, 
  isValidName, 
  isValidNationality, 
  extractValueFromLine,
  extractRealValueFromField,
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
    
    console.log(`📝 Ligne ${i}: "${line}"`);
    
    // Logique spécifique pour les champs avec labels séparés (comme passeport canadien)
    // Recherche explicite de "SURNAME/NOM" suivi de la valeur
    if ((line.includes("SURNAME") && line.includes("NOM")) || 
        (line.includes("SURNAME") && !line.includes("GIVEN"))) {
      if (nextLine && isValidName(nextLine)) {
        passportData.nom = safeStringTrim(nextLine);
        console.log("✅ Nom trouvé après label SURNAME:", nextLine);
        continue;
      }
    }
    
    // Recherche explicite de "GIVEN NAMES/PRÉNOMS" suivi de la valeur
    if ((line.includes("GIVEN") && (line.includes("PRENOM") || line.includes("NAMES"))) ||
        (line.includes("GIVEN NAMES") && !passportData.prenom)) {
      if (nextLine && isValidName(nextLine)) {
        passportData.prenom = safeStringTrim(nextLine);
        console.log("✅ Prénom trouvé après label GIVEN NAMES:", nextLine);
        continue;
      }
    }
    
    // Recherche explicite de "NATIONALITY" suivi de la valeur
    if (line.includes("NATIONALITY") && !passportData.nationalite) {
      if (nextLine && isValidNationality(nextLine)) {
        const convertedNationality = convertMainTextNationality(nextLine);
        passportData.nationalite = safeStringTrim(convertedNationality);
        console.log("✅ Nationalité trouvée après label NATIONALITY:", nextLine, "->", convertedNationality);
        continue;
      }
    }

    // Détection spéciale pour passeport canadien
    if (line.includes("CANADA") && !passportData.nationalite) {
      passportData.nationalite = "Canada";
      console.log("✅ Nationalité canadienne détectée");
    }

    // Extraction multilingue du nom de famille (logique de fallback)
    if (containsMultilingualKeywords(line, NAME_KEYWORDS.surname) && !passportData.nom) {
      console.log("🔍 Ligne contient mot-clé nom de famille:", line);
      const nameValue = extractRealValueFromField(line, nextLine);
      if (nameValue) {
        passportData.nom = safeStringTrim(nameValue);
        console.log("✅ Nom de famille trouvé (multilingue):", nameValue);
      }
    }
    
    // Extraction multilingue du prénom (logique de fallback)
    if (containsMultilingualKeywords(line, NAME_KEYWORDS.givenName) && !passportData.prenom) {
      console.log("🔍 Ligne contient mot-clé prénom:", line);
      const prenomValue = extractRealValueFromField(line, nextLine);
      if (prenomValue) {
        passportData.prenom = safeStringTrim(prenomValue);
        console.log("✅ Prénom trouvé (multilingue):", prenomValue);
      }
    }

    // Extraction multilingue de la nationalité (logique de fallback)
    if (containsMultilingualKeywords(line, NATIONALITY_KEYWORDS) && !passportData.nationalite) {
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

    // Traitement spécifique selon le format détecté (seulement si pas encore trouvé)
    if (passportFormat === 'numbered') {
      const match = line.match(PASSPORT_FORMAT_PATTERNS.numberedField);
      if (match) {
        const fieldNumber = match[1];
        const fieldName = match[2].trim();
        
        console.log(`🔢 Champ numéroté ${fieldNumber}: "${fieldName}"`);
        
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.surname) && !passportData.nom) {
          const nameValue = extractRealValueFromField(line, nextLine);
          if (nameValue) {
            passportData.nom = safeStringTrim(nameValue);
            console.log("✅ Nom trouvé (format numéroté):", nameValue);
          }
        }
        if (containsMultilingualKeywords(fieldName, NAME_KEYWORDS.givenName) && !passportData.prenom) {
          const prenomValue = extractRealValueFromField(line, nextLine);
          if (prenomValue) {
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
    
    // Format allemand : amélioration de la détection des noms isolés
    if (passportFormat === 'german' && 
        line.match(PASSPORT_FORMAT_PATTERNS.germanIsolatedName) && 
        !line.match(/^(PASSPORT|REISEPASS|CANADA|DEUTSCH|GERMAN|BUNDESREPUBLIK|PP|CAN|TYPE)$/)) {
      
      if (isValidName(line)) {
        // Logique améliorée : chercher des noms après les champs identifiés
        if (i > 0) {
          const prevLine = lines[i - 1].toUpperCase();
          // Si la ligne précédente contient un mot-clé de nom de famille
          if (containsMultilingualKeywords(prevLine, NAME_KEYWORDS.surname) && !passportData.nom) {
            passportData.nom = safeStringTrim(line);
            console.log("✅ Nom de famille trouvé après champ (format allemand):", line);
          }
          // Si la ligne précédente contient un mot-clé de prénom
          else if (containsMultilingualKeywords(prevLine, NAME_KEYWORDS.givenName) && !passportData.prenom) {
            passportData.prenom = safeStringTrim(line);
            console.log("✅ Prénom trouvé après champ (format allemand):", line);
          }
          // Sinon, ordre par défaut : nom puis prénom
          else if (!passportData.nom) {
            passportData.nom = safeStringTrim(line);
            console.log("✅ Nom de famille potentiel (format allemand):", line);
          } else if (!passportData.prenom) {
            passportData.prenom = safeStringTrim(line);
            console.log("✅ Prénom potentiel (format allemand):", line);
          }
        }
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

  console.log("🎯 Extraction multilingue terminée - Résultats:", {
    nom: passportData.nom,
    prenom: passportData.prenom,
    nationalite: passportData.nationalite,
    format: passportFormat
  });
};
