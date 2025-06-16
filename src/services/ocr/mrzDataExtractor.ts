
import { MRZData } from "@/types/ocrTypes";
import { normalizeNationality } from "@/utils/nationalityNormalizer";

export const extractMRZData = (text: string): MRZData => {
  console.log("🔍 === DÉBUT EXTRACTION MRZ AMÉLIORÉE ===");
  console.log("📝 Texte analysé:", text.substring(0, 300) + "...");
  
  const lines = text.split('\n').map(line => line.trim());
  const mrzData: MRZData = {};

  // Recherche des lignes MRZ avec critères assouplis
  const mrzLines = lines.filter(line => {
    const cleanLine = line.replace(/\s/g, '');
    return (
      cleanLine.startsWith('P<') || 
      cleanLine.includes('<<') ||
      (cleanLine.length > 20 && /^[A-Z0-9<]+$/.test(cleanLine)) ||
      (cleanLine.length > 25 && cleanLine.split('<').length > 3)
    );
  });

  console.log("📋 Lignes MRZ potentielles détectées:", mrzLines.length);
  mrzLines.forEach((line, index) => {
    console.log(`MRZ ${index + 1}:`, line);
  });

  if (mrzLines.length >= 2) {
    console.log("✅ Format MRZ standard détecté (2+ lignes)");
    processMRZStandard(mrzLines, mrzData);
  } else if (mrzLines.length === 1) {
    console.log("⚠️ Une seule ligne MRZ détectée, tentative d'extraction");
    processSingleMRZLine(mrzLines[0], mrzData);
  } else {
    console.log("⚠️ Aucune ligne MRZ standard, extraction depuis texte général");
  }

  // Extraction de secours depuis le texte général
  if (!mrzData.nom || !mrzData.prenom) {
    console.log("🔍 Extraction de secours depuis texte général...");
    extractFromGeneralText(text, mrzData);
  }

  console.log("📋 Données MRZ finales extraites:", mrzData);
  console.log("🔍 === FIN EXTRACTION MRZ ===");
  return mrzData;
};

function processMRZStandard(mrzLines: string[], mrzData: MRZData): void {
  const firstLine = mrzLines[0].replace(/\s/g, '');
  const secondLine = mrzLines[1].replace(/\s/g, '');

  console.log("📝 Première ligne MRZ:", firstLine);
  console.log("📝 Deuxième ligne MRZ:", secondLine);

  // Première ligne: P<COUNTRY<SURNAME<<GIVEN_NAMES<<<<<<<<<<
  if (firstLine.startsWith('P<')) {
    const countryCode = firstLine.substring(2, 5);
    const restOfFirstLine = firstLine.substring(5);
    
    console.log("🌍 Code pays détecté:", countryCode);
    
    // Extraction du nom et prénom avec gestion améliorée
    const namesPart = restOfFirstLine.split('<<')[0];
    const names = namesPart.split('<').filter(name => name.length > 0);
    
    console.log("👤 Noms extraits de la MRZ:", names);
    
    if (names.length >= 1) {
      mrzData.nom = names[0];
      console.log("✅ Nom MRZ extrait:", mrzData.nom);
    }
    if (names.length >= 2) {
      mrzData.prenom = names.slice(1).join(' ');
      console.log("✅ Prénom MRZ extrait:", mrzData.prenom);
    }

    // Conversion du code pays vers nationalité
    if (countryCode && countryCode.length === 3) {
      mrzData.nationalite = normalizeNationality(convertCountryCodeToNationality(countryCode));
      console.log("✅ Nationalité MRZ extraite:", mrzData.nationalite);
    }
  }

  // Deuxième ligne: numéro passeport, dates, etc.
  if (secondLine.length >= 28) {
    // Numéro de passeport (positions 0-8)
    const passportNumber = secondLine.substring(0, 9).replace(/</g, '');
    if (passportNumber && passportNumber.length >= 6) {
      mrzData.numero_passeport = passportNumber;
      console.log("✅ Numéro passeport MRZ extrait:", mrzData.numero_passeport);
    }

    // Date de naissance (positions 13-18: YYMMDD)
    const birthDateRaw = secondLine.substring(13, 19);
    if (birthDateRaw && /^\d{6}$/.test(birthDateRaw)) {
      mrzData.date_naissance = formatMRZDate(birthDateRaw);
      console.log("✅ Date naissance MRZ extraite:", mrzData.date_naissance);
    }

    // Date d'expiration (positions 21-26: YYMMDD)
    const expiryDateRaw = secondLine.substring(21, 27);
    if (expiryDateRaw && /^\d{6}$/.test(expiryDateRaw)) {
      mrzData.date_expiration = formatMRZDate(expiryDateRaw);
      console.log("✅ Date expiration MRZ extraite:", mrzData.date_expiration);
    }
  }
}

function processSingleMRZLine(mrzLine: string, mrzData: MRZData): void {
  console.log("🔍 Traitement ligne MRZ unique:", mrzLine);
  
  const cleanLine = mrzLine.replace(/\s/g, '');
  
  // Tentative d'extraction des noms depuis une ligne unique
  if (cleanLine.startsWith('P<')) {
    const parts = cleanLine.split('<').filter(part => part.length > 0);
    console.log("📝 Parties extraites:", parts);
    
    if (parts.length >= 3) {
      // Format probable: P, CODE_PAYS, NOM, PRENOM(S)
      mrzData.nom = parts[2];
      if (parts.length >= 4) {
        mrzData.prenom = parts.slice(3).join(' ');
      }
      console.log("✅ Nom/Prénom extraits de ligne unique:", mrzData.nom, mrzData.prenom);
    }
  }
  
  // Recherche numéro passeport dans la ligne
  const passportMatch = cleanLine.match(/([A-Z0-9]{6,12})/g);
  if (passportMatch && passportMatch.length > 0) {
    // Prendre le premier qui ressemble à un numéro de passeport
    for (const match of passportMatch) {
      if (match.length >= 6 && match.length <= 12 && /[A-Z]/.test(match) && /\d/.test(match)) {
        mrzData.numero_passeport = match;
        console.log("✅ Numéro passeport potentiel extrait:", match);
        break;
      }
    }
  }
}

function convertCountryCodeToNationality(countryCode: string): string {
  const countryMapping: Record<string, string> = {
    'MAR': 'Maroc',
    'FRA': 'France', 
    'ESP': 'Espagne',
    'DEU': 'Allemagne',
    'GER': 'Allemagne',
    'ITA': 'Italie',
    'GBR': 'Royaume-Uni',
    'USA': 'États-Unis',
    'CAN': 'Canada',
    'BEL': 'Belgique',
    'NLD': 'Pays-Bas',
    'CHE': 'Suisse',
    'PRT': 'Portugal',
    'DZA': 'Algérie',
    'TUN': 'Tunisie',
    'TUR': 'Turquie',
    'RUS': 'Russie',
    'CHN': 'Chine',
    'JPN': 'Japon',
    'IND': 'Inde',
    'BRA': 'Brésil',
    'MEX': 'Mexique',
    'ARG': 'Argentine'
  };

  return countryMapping[countryCode] || countryCode;
}

function formatMRZDate(mrzDate: string): string {
  if (mrzDate.length !== 6) return mrzDate;
  
  const year = parseInt(mrzDate.substring(0, 2));
  const month = mrzDate.substring(2, 4);
  const day = mrzDate.substring(4, 6);
  
  // Déterminer le siècle (assumons que 00-30 = 20xx, 31-99 = 19xx)
  const fullYear = year <= 30 ? 2000 + year : 1900 + year;
  
  return `${day}/${month}/${fullYear}`;
}

function extractFromGeneralText(text: string, mrzData: MRZData): void {
  console.log("🔍 Extraction depuis texte général (fallback amélioré)");
  
  const lines = text.split('\n').map(line => line.trim());
  
  for (const line of lines) {
    // Recherche patterns nom/prénom avec plus de flexibilité
    if (!mrzData.nom) {
      const nomPatterns = [
        /(?:SURNAME|NOM|FAMILY\s*NAME)\s*:?\s*([A-Z\s]{2,30})/i,
        /(?:APELLIDO|NACHNAME|COGNOME)\s*:?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of nomPatterns) {
        const nomMatch = line.match(pattern);
        if (nomMatch && nomMatch[1] && nomMatch[1].trim().length >= 2) {
          mrzData.nom = nomMatch[1].trim();
          console.log("✅ Nom extrait du texte général:", mrzData.nom);
          break;
        }
      }
    }
    
    if (!mrzData.prenom) {
      const prenomPatterns = [
        /(?:GIVEN\s*NAMES?|PRENOM|FIRST\s*NAME)\s*:?\s*([A-Z\s]{2,30})/i,
        /(?:NOMBRE|VORNAME|NOME)\s*:?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of prenomPatterns) {
        const prenomMatch = line.match(pattern);
        if (prenomMatch && prenomMatch[1] && prenomMatch[1].trim().length >= 2) {
          mrzData.prenom = prenomMatch[1].trim();
          console.log("✅ Prénom extrait du texte général:", mrzData.prenom);
          break;
        }
      }
    }
    
    // Recherche numéro passeport avec patterns étendus
    if (!mrzData.numero_passeport) {
      const passportPatterns = [
        /(?:PASSPORT\s*NO|N°\s*PASSEPORT|PASAPORTE\s*N|REISEPASS\s*NR)\s*:?\s*([A-Z0-9]{6,15})/i,
        /(?:DOCUMENT\s*NO|DOC\s*NO)\s*:?\s*([A-Z0-9]{6,15})/i
      ];
      
      for (const pattern of passportPatterns) {
        const passportMatch = line.match(pattern);
        if (passportMatch && passportMatch[1] && passportMatch[1].length >= 6) {
          mrzData.numero_passeport = passportMatch[1].trim();
          console.log("✅ Numéro passeport extrait du texte général:", mrzData.numero_passeport);
          break;
        }
      }
    }
    
    // Recherche nationalité avec patterns étendus
    if (!mrzData.nationalite) {
      const nationalityPatterns = [
        /(?:NATIONALITY|NATIONALITE|NACIONALIDAD|STAATSANGEHÖRIGKEIT)\s*:?\s*([A-Z\s]{3,25})/i,
        /(?:CITIZEN\s*OF|CITTADINANZA)\s*:?\s*([A-Z\s]{3,25})/i
      ];
      
      for (const pattern of nationalityPatterns) {
        const nationalityMatch = line.match(pattern);
        if (nationalityMatch && nationalityMatch[1] && nationalityMatch[1].trim().length >= 3) {
          mrzData.nationalite = normalizeNationality(nationalityMatch[1].trim());
          console.log("✅ Nationalité extraite du texte général:", mrzData.nationalite);
          break;
        }
      }
    }

    // Recherche dates avec patterns étendus
    if (!mrzData.date_naissance) {
      const birthDatePatterns = [
        /(?:DATE\s*OF\s*BIRTH|NEE?\s*LE|FECHA\s*DE\s*NACIMIENTO|GEBURTSDATUM)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i
      ];
      
      for (const pattern of birthDatePatterns) {
        const birthMatch = line.match(pattern);
        if (birthMatch && birthMatch[1]) {
          mrzData.date_naissance = birthMatch[1];
          console.log("✅ Date naissance extraite du texte général:", mrzData.date_naissance);
          break;
        }
      }
    }

    if (!mrzData.date_expiration) {
      const expiryDatePatterns = [
        /(?:DATE\s*OF\s*EXPIRY|EXPIRE|VALABLE\s*JUSQU|VÁLIDO\s*HASTA|GÜLTIG\s*BIS)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i
      ];
      
      for (const pattern of expiryDatePatterns) {
        const expiryMatch = line.match(pattern);
        if (expiryMatch && expiryMatch[1]) {
          mrzData.date_expiration = expiryMatch[1];
          console.log("✅ Date expiration extraite du texte général:", mrzData.date_expiration);
          break;
        }
      }
    }
  }
}
