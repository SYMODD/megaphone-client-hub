
import { safeStringTrim } from "../passportEtranger/stringUtils";
import { normalizeNationality } from "../nationalityNormalizer";

export interface PassportMarocainData {
  nom?: string;
  prenom?: string;
  numero_passeport?: string;
  nationalite?: string;
  date_naissance?: string;
  date_expiration?: string;
  code_barre?: string;
  numero_telephone?: string;
}

export const extractPassportMarocainData = (text: string): PassportMarocainData => {
  console.log("🇲🇦 EXTRACTION PASSEPORT MAROCAIN - Analyzing text:", text);
  
  const lines = text.split('\n').map(line => safeStringTrim(line)).filter(line => line.length > 0);
  const passportData: PassportMarocainData = {};

  // Extraire les données depuis le texte principal (pas seulement MRZ)
  extractMainTextData(lines, passportData);
  
  // Extraire depuis MRZ comme complément
  extractMRZData(lines, passportData);

  // Normaliser la nationalité
  if (passportData.nationalite) {
    passportData.nationalite = normalizeNationality(passportData.nationalite);
  }

  console.log("🇲🇦 Final extracted Moroccan passport data:", passportData);
  return passportData;
};

const extractMainTextData = (lines: string[], passportData: PassportMarocainData) => {
  console.log("🇲🇦 Extracting from main text...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    
    // Extraction du nom de famille - patterns spécifiques aux passeports marocains
    if (!passportData.nom) {
      // Chercher après "Sport NO" ou avant "Prenoms"
      if (i > 0 && (lines[i-1].includes("Sport") || lines[i-1].includes("NO"))) {
        if (isValidName(line) && line.length > 2) {
          passportData.nom = safeStringTrim(line);
          console.log("✅ Nom trouvé après Sport NO:", line);
          continue;
        }
      }
      
      // Chercher avant "Prenoms/Given"
      if (nextLine && (nextLine.includes("Prenoms") || nextLine.includes("Given"))) {
        if (isValidName(line) && line.length > 2) {
          passportData.nom = safeStringTrim(line);
          console.log("✅ Nom trouvé avant Prenoms:", line);
          continue;
        }
      }
    }

    // Extraction du prénom - après "Prenoms/Given Named"
    if (!passportData.prenom && (upperLine.includes("PRENOMS") || upperLine.includes("GIVEN"))) {
      if (nextLine && isValidName(nextLine) && nextLine !== passportData.nom) {
        passportData.prenom = safeStringTrim(nextLine);
        console.log("✅ Prénom trouvé après Prenoms:", nextLine);
        continue;
      }
    }

    // Extraction du numéro de passeport - patterns marocains
    if (!passportData.numero_passeport) {
      // Pattern SY suivi de chiffres
      const passportMatch = line.match(/^(SY\d{6,8})$/);
      if (passportMatch) {
        passportData.numero_passeport = passportMatch[1];
        console.log("✅ Numéro passeport trouvé:", passportMatch[1]);
        continue;
      }
    }

    // Extraction de la nationalité
    if (!passportData.nationalite) {
      if (upperLine.includes("MAROCAINE") || upperLine === "MAR") {
        passportData.nationalite = "Marocaine";
        console.log("✅ Nationalité marocaine détectée");
        continue;
      }
    }

    // Extraction de la date de naissance - format DD/MM/YYYY
    if (!passportData.date_naissance) {
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Vérifier que c'est une date de naissance plausible (année entre 1920 et 2010)
        const year = parseInt(dateStr.split('/')[2]);
        if (year >= 1920 && year <= 2010) {
          passportData.date_naissance = dateStr;
          console.log("✅ Date naissance trouvée:", dateStr);
          continue;
        }
      }
    }

    // Extraction de la date d'expiration - généralement après la date de naissance
    if (!passportData.date_expiration && passportData.date_naissance) {
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Vérifier que c'est une date d'expiration plausible (année entre 2020 et 2040)
        const year = parseInt(dateStr.split('/')[2]);
        if (year >= 2020 && year <= 2040 && dateStr !== passportData.date_naissance) {
          passportData.date_expiration = dateStr;
          console.log("✅ Date expiration trouvée:", dateStr);
          continue;
        }
      }
    }
  }
};

const extractMRZData = (lines: string[], passportData: PassportMarocainData) => {
  console.log("🇲🇦 Extracting from MRZ...");
  
  // Chercher les lignes MRZ
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  for (const line of mrzLines) {
    const cleanLine = safeStringTrim(line);
    
    // Extraction depuis la deuxième ligne MRZ
    if (cleanLine.length >= 36 && /^[A-Z0-9<]{36,}$/.test(cleanLine) && !cleanLine.startsWith('P<')) {
      console.log("🇲🇦 Processing MRZ line:", cleanLine);
      
      // Numéro de passeport (premiers 9 caractères)
      if (!passportData.numero_passeport) {
        const numeroPasseport = cleanLine.substring(0, 9).replace(/</g, '');
        if (numeroPasseport && numeroPasseport.length >= 6) {
          passportData.numero_passeport = numeroPasseport;
          console.log("🇲🇦 Numéro passeport MRZ:", numeroPasseport);
        }
      }
      
      // Code nationalité (positions 10-12)
      if (!passportData.nationalite) {
        const nationaliteCode = cleanLine.substring(10, 13).replace(/</g, '');
        if (nationaliteCode === 'MAR') {
          passportData.nationalite = 'MAR';
          console.log("🇲🇦 Nationalité MRZ:", nationaliteCode);
        }
      }
      
      break;
    }
  }
};

const isValidName = (name: string): boolean => {
  if (!name || name.length < 2) return false;
  
  // Exclure les mots qui ne sont pas des noms
  const excludedWords = [
    'ROYAUME', 'MAROC', 'KINGDOM', 'MOROCCO', 'PASSEPORT', 'PASSPORT',
    'PRENOMS', 'GIVEN', 'NAMED', 'NANIONALTON', 'SEXE', 'SEX', 'DATE',
    'NAISSANCE', 'BIRTH', 'AUTORITE', 'AUTHORITY', 'PREFECTURE'
  ];
  
  if (excludedWords.includes(name.toUpperCase())) {
    return false;
  }
  
  // Doit contenir uniquement des lettres et éventuellement des espaces/tirets
  return /^[A-ZÀ-ÿ][A-ZÀ-ÿ\s\-']{1,}$/i.test(name);
};
