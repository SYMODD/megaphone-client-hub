
import { useState } from "react";
import { toast } from "sonner";
import { convertNationalityCode } from "@/data/nationalityMappings";

export const usePassportEtrangerOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for foreign passport...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Foreign Passport OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const passportData = extractPassportEtrangerData(parsedText);

      setExtractedData(passportData);
      setRawText(parsedText);
      toast.success("Données passeport étranger extraites avec succès!");
      console.log("Foreign passport extraction successful:", passportData);
      return passportData;
    } catch (error) {
      console.error("Foreign passport OCR scan error:", error);
      toast.error("Erreur lors du scan OCR du passeport étranger");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setExtractedData(null);
    setRawText("");
  };

  return {
    isScanning,
    extractedData,
    rawText,
    scanImage,
    resetScan
  };
};

// Helper function to safely convert values to strings and trim them
const safeStringTrim = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  return stringValue.trim();
};

// Helper function to validate if a value is a valid string
const isValidString = (value: any): boolean => {
  return typeof value === 'string' && value.length > 0;
};

const extractPassportEtrangerData = (text: string): any => {
  console.log("Extracting foreign passport data from text:", text);
  
  const lines = text.split('\n').map(line => safeStringTrim(line)).filter(line => line.length > 0);
  const passportData: any = {};

  // Analyse du texte principal pour extraire nom, prénom et nationalité
  extractDataFromMainText(lines, passportData);
  
  // Recherche des lignes MRZ pour les autres informations
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("Detected MRZ lines:", mrzLines);

  if (mrzLines.length > 0) {
    // Extraction depuis MRZ comme fallback pour nom/prénom si pas trouvé dans le texte principal
    if (!passportData.nom || !passportData.prenom) {
      extractNamesFromMRZ(mrzLines, passportData);
    }
    
    // Extraction des autres données depuis MRZ
    extractOtherDataFromMRZ(mrzLines, passportData);
  }

  console.log("Final extracted foreign passport data:", passportData);
  return passportData;
};

const extractDataFromMainText = (lines: string[], passportData: any) => {
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

const extractValueFromLine = (line: string, keywords: string[]): string | null => {
  // Enlever les keywords de la ligne pour extraire la valeur
  let cleanLine = safeStringTrim(line);
  keywords.forEach(keyword => {
    cleanLine = cleanLine.replace(new RegExp(keyword, 'gi'), '');
  });
  
  // Nettoyer les caractères spéciaux et espaces
  cleanLine = cleanLine.replace(/[:/\d\.\-\|]/g, '').trim();
  
  return cleanLine.length > 1 ? cleanLine : null;
};

const isValidName = (name: string): boolean => {
  if (!isValidString(name)) {
    return false;
  }
  // Vérifier que c'est un nom valide (lettres seulement, longueur raisonnable)
  return /^[A-Z\s]{2,30}$/.test(name) && 
         !name.match(/^(PASSPORT|REISEPASS|CANADA|GERMAN|DEUTSCH|FEDERAL|REPUBLIC)$/);
};

const isValidNationality = (nationality: string): boolean => {
  if (!isValidString(nationality)) {
    return false;
  }
  // Vérifier que c'est une nationalité valide
  return /^[A-Z\s]{2,30}$/.test(nationality) && 
         !nationality.match(/^(PASSPORT|REISEPASS|TYPE|GIVEN|SURNAME)$/);
};

const convertMainTextNationality = (nationality: string): string => {
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

const checkForNationalityInLine = (line: string): string | null => {
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

const extractNamesFromMRZ = (mrzLines: string[], passportData: any) => {
  // Première ligne MRZ contient les noms
  const firstLine = safeStringTrim(mrzLines[0]);
  
  if (firstLine.startsWith('P<')) {
    const namesPart = firstLine.substring(5);
    const names = namesPart.split('<<');
    if (names.length >= 2) {
      if (!passportData.nom && names[0]) {
        passportData.nom = safeStringTrim(names[0].replace(/</g, ''));
      }
      if (!passportData.prenom && names[1]) {
        passportData.prenom = safeStringTrim(names[1].replace(/</g, ' '));
      }
    }
  }
};

const extractOtherDataFromMRZ = (mrzLines: string[], passportData: any) => {
  // Deuxième ligne MRZ contient les autres informations
  if (mrzLines.length >= 2) {
    const secondLine = safeStringTrim(mrzLines[mrzLines.length - 1]);
    
    if (secondLine.length >= 30) {
      // Numéro de passeport
      const docNumber = safeStringTrim(secondLine.substring(0, 9).replace(/</g, ''));
      if (docNumber) {
        passportData.numero_passeport = docNumber;
      }

      // Nationalité depuis MRZ (seulement si pas déjà trouvée dans le texte principal)
      if (!passportData.nationalite) {
        const nationalityRaw = secondLine.substring(10, 13);
        if (nationalityRaw && nationalityRaw !== '<<<') {
          try {
            const nationalityCode = safeStringTrim(nationalityRaw);
            console.log("Raw nationality code extracted from MRZ:", nationalityCode);
            
            // Ensure we have a valid 3-character nationality code
            if (nationalityCode.length === 3 && /^[A-Z]{3}$/.test(nationalityCode)) {
              const convertedNationality = convertNationalityCode(nationalityCode);
              passportData.nationalite = safeStringTrim(convertedNationality);
              console.log("Converted nationality from MRZ:", convertedNationality);
            } else {
              console.warn("Invalid nationality code format:", nationalityCode);
              passportData.nationalite = nationalityCode; // Keep raw value if conversion fails
            }
          } catch (error) {
            console.error("Error converting nationality code:", error);
            passportData.nationalite = safeStringTrim(nationalityRaw);
          }
        }
      }

      // Date de naissance
      const birthDate = secondLine.substring(13, 19);
      if (birthDate.match(/^\d{6}$/)) {
        const year = parseInt(birthDate.substring(0, 2));
        const month = birthDate.substring(2, 4);
        const day = birthDate.substring(4, 6);
        const fullYear = year <= 30 ? 2000 + year : 1900 + year;
        passportData.date_naissance = `${fullYear}-${month}-${day}`;
      }

      // Date d'expiration
      const expiryDate = secondLine.substring(21, 27);
      if (expiryDate.match(/^\d{6}$/)) {
        const year = parseInt(expiryDate.substring(0, 2));
        const month = expiryDate.substring(2, 4);
        const day = expiryDate.substring(4, 6);
        const fullYear = year <= 50 ? 2000 + year : 1900 + year;
        passportData.date_expiration = `${fullYear}-${month}-${day}`;
      }
    }
  }
};
