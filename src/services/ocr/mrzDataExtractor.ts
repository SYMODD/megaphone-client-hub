import { MRZData } from "@/types/ocrTypes";
import { normalizeNationality } from "@/utils/nationalityNormalizer";
import { isValidName } from "@/utils/passportEtranger/stringUtils";
import { convertMainTextNationality } from "@/utils/passportEtranger/nationalityUtils";

export const extractMRZData = (text: string): MRZData => {
  console.log("🔍 === DÉBUT EXTRACTION MRZ ULTRA-OPTIMISÉE ===");
  console.log("📝 Texte analysé:", text.substring(0, 300) + "...");
  
  const lines = text.split('\n').map(line => line.trim());
  const mrzData: MRZData = {};

  // DÉTECTION MRZ RENFORCÉE - Support multi-format avec debug
  const mrzLines = lines.filter(line => {
    const cleanLine = line.replace(/\s/g, '').replace(/[^\w<]/g, ''); // Enlever caractères parasites
    const originalClean = line.replace(/\s/g, '');
    
    console.log("🔍 Ligne analysée:", line);
    console.log("🧹 Ligne nettoyée:", cleanLine);
    
    const isMRZ = (
      // Format standard: P<COUNTRY (minimum 5 caractères)
      (cleanLine.startsWith('P<') && cleanLine.length >= 5) || 
      (originalClean.startsWith('P<') && originalClean.length >= 5) ||
      // CORRECTION CRITIQUE - Erreurs OCR sur le P
      (cleanLine.startsWith("'<") && cleanLine.length >= 5) ||     // P devient '
      (originalClean.startsWith("'<") && originalClean.length >= 5) ||
      (cleanLine.startsWith('I<') && cleanLine.length >= 5) ||     // P devient I
      (originalClean.startsWith('I<') && originalClean.length >= 5) ||
      (cleanLine.startsWith('1<') && cleanLine.length >= 5) ||     // P devient 1
      (originalClean.startsWith('1<') && originalClean.length >= 5) ||
      // Format canadien alternatif: PPCAN (minimum 5 caractères)
      (cleanLine.startsWith('PP') && cleanLine.length >= 5) ||
      (originalClean.startsWith('PP') && originalClean.length >= 5) ||
      // Format suisse: PMCHE (minimum 5 caractères pour éviter "PM" isolé)
      (cleanLine.startsWith('PM') && cleanLine.length >= 5) ||
      (originalClean.startsWith('PM') && originalClean.length >= 5) ||
      // CORRECTION STRICTE - Ligne 2 MRZ : formats multiples
      // Format standard: NUM_PASSPORT + CODE_PAYS + DATES
      (cleanLine.length >= 30 && 
       (/^[A-Z0-9]{6,12}[A-Z0-9]{1,3}<<\d{6}[A-Z]\d{6}/.test(cleanLine) ||     // Format avec <<
        /^[A-Z0-9]{6,12}[A-Z0-9]{3}\d{6,7}[MF]\d{6,7}/.test(cleanLine) ||      // Format polonais/européen
        /^[A-Z0-9]{8,12}[A-Z0-9]{3}\d{6,7}[MF]\d{6,7}/.test(cleanLine) ||      // Format suisse étendu
        /^[A-Z0-9]{8}<\d[A-Z]{3}\d{7}[MF]\d{7}<<</.test(cleanLine)))           // Format suisse XOY28U44<3CHE7306125F3211153<<<
    );
    
    if (isMRZ) {
      console.log("🎯 LIGNE MRZ DÉTECTÉE:", originalClean);
    }
    
    return isMRZ;
  });

  console.log("📋 Lignes MRZ détectées:", mrzLines.length);
  mrzLines.forEach((line, index) => {
    console.log(`📝 Ligne MRZ ${index + 1}:`, line);
  });

  if (mrzLines.length >= 2) {
    console.log("✅ Traitement MRZ double ligne");
    
    // CORRECTION CRITIQUE - Identifier les vraies lignes MRZ
    let nameLine = '';
    let dataLine = '';
    
    for (const line of mrzLines) {
      const cleanLine = line.replace(/\s/g, '');
      // Ligne nom : commence par P<, '<, I<, 1<, PP ou PM
      if (cleanLine.startsWith('P<') || cleanLine.startsWith("'<") || 
          cleanLine.startsWith('I<') || cleanLine.startsWith('1<') || 
          cleanLine.startsWith('PP') || cleanLine.startsWith('PM')) {
        nameLine = line;
        console.log("🎯 LIGNE NOM MRZ identifiée:", line);
      }
      // Ligne données : contient numéro passeport + dates (formats multiples)
      else if (cleanLine.length >= 30 && 
               (/^[A-Z0-9]{6,12}[A-Z0-9]{1,3}<<\d{6}[A-Z]\d{6}/.test(cleanLine) ||     // Format avec <<
                /^[A-Z0-9]{6,12}[A-Z0-9]{3}\d{6,7}[MF]\d{6,7}/.test(cleanLine) ||      // Format polonais/européen
                /^[A-Z0-9]{8,12}[A-Z0-9]{3}\d{6,7}[MF]\d{6,7}/.test(cleanLine) ||      // Format suisse étendu
                /^[A-Z0-9]{8}<\d[A-Z]{3}\d{7}[MF]\d{7}<<</.test(cleanLine))) {          // Format suisse XOY28U44<3CHE7306125F3211153<<<
        dataLine = line;
        console.log("🎯 LIGNE DONNÉES MRZ identifiée:", line);
      }
    }
    
    if (nameLine && dataLine) {
      console.log("✅ Lignes MRZ correctes identifiées");
      processMRZStandard([nameLine, dataLine], mrzData);
    } else {
      console.log("⚠️ Impossible d'identifier les bonnes lignes MRZ, fallback");
      processMRZStandard(mrzLines, mrzData);
    }
  } else if (mrzLines.length === 1) {
    console.log("⚠️ Traitement MRZ ligne unique");
    processSingleMRZLine(mrzLines[0], mrzData);
  } else {
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

  // CORRECTION MAJEURE - Support formats P< et PP + erreurs OCR
  let countryCode = '';
  let restOfFirstLine = '';

  if (firstLine.startsWith('P<')) {
    // Format standard: P<COUNTRY
    countryCode = firstLine.substring(2, 5);
    restOfFirstLine = firstLine.substring(5);
  } else if (firstLine.startsWith('PP')) {
    // Format canadien: PPCAN
    countryCode = firstLine.substring(2, 5);
    restOfFirstLine = firstLine.substring(5);
  } else if (firstLine.startsWith('PM')) {
    // Format suisse: PMCHE
    countryCode = firstLine.substring(2, 5);
    restOfFirstLine = firstLine.substring(5);
    console.log("🇨🇭 Format suisse PM détecté - Code pays:", countryCode, "Reste:", restOfFirstLine);
  } else if (firstLine.startsWith("'<") || firstLine.startsWith('I<') || firstLine.startsWith('1<')) {
    // CORRECTION CRITIQUE - Erreurs OCR sur le P
    console.log("🔧 Correction erreur OCR détectée sur P:", firstLine.substring(0, 3));
    countryCode = firstLine.substring(2, 5);
    restOfFirstLine = firstLine.substring(5);
  }
  
  console.log("🌍 Code pays détecté:", countryCode);
  console.log("📝 Reste de la ligne:", restOfFirstLine);
  
  if (restOfFirstLine) {
    // NOUVELLE LOGIQUE CRITIQUE - Extraction complète nom/prénom
    const doubleSeparatorIndex = restOfFirstLine.indexOf('<<');
    if (doubleSeparatorIndex !== -1) {
      // Format standard: NOM<<PRENOMS
      const surnameSection = restOfFirstLine.substring(0, doubleSeparatorIndex);
      const givenNamesSection = restOfFirstLine.substring(doubleSeparatorIndex + 2);
      
      console.log("👤 Section nom:", surnameSection);
      console.log("👤 Section prénoms:", givenNamesSection);
      
      // Extraction nom (peut contenir des < pour noms composés)
      const surnames = surnameSection.split('<').filter(name => name.length > 0);
      if (surnames.length > 0) {
        mrzData.nom = surnames.join(' '); // Combine noms composés
        console.log("✅ Nom MRZ extrait (corrigé):", mrzData.nom);
      }
      
      // Extraction prénoms (enlever les < de remplissage)
      const givenNames = givenNamesSection.split('<').filter(name => name.length > 0);
      if (givenNames.length > 0) {
        // CORRECTION OCR : J0 → JO, O0 →  OO
        const correctedGivenNames = givenNames.map(name => 
          name.replace(/J0/g, 'JO').replace(/O0/g, 'OO').replace(/0O/g, 'OO')
        );
        mrzData.prenom = correctedGivenNames.join(' ');
        console.log("✅ Prénom MRZ extrait (corrigé):", mrzData.prenom);
      }
    } else {
      // Fallback - pas de double séparateur
      const allNames = restOfFirstLine.split('<').filter(name => name.length > 0);
      if (allNames.length >= 1) {
        mrzData.nom = allNames[0];
        console.log("✅ Nom MRZ extrait (fallback):", mrzData.nom);
      }
      if (allNames.length >= 2) {
        mrzData.prenom = allNames.slice(1).join(' ');
        console.log("✅ Prénom MRZ extrait (fallback):", mrzData.prenom);
      }
    }
  }

  // Conversion nationalité avec support codes manquants
  if (countryCode && countryCode.length >= 1) {
    mrzData.nationalite = normalizeNationality(convertCountryCodeToNationality(countryCode));
    console.log("✅ Nationalité MRZ extraite:", mrzData.nationalite);
  }

  // Deuxième ligne: numéro passeport, dates, etc.
  if (secondLine.length >= 28) {
    // Numéro de passeport (positions 0-8, 0-9 ou 0-10 selon format)
    let passportNumber = '';
    
    // Format suisse: XOY28U44<3CHE... (numéro de passeport de 8 caractères)
    if (/^[A-Z0-9]{8}<\d[A-Z]{3}/.test(secondLine)) {
      passportNumber = secondLine.substring(0, 8).replace(/</g, '');
      console.log("🇨🇭 Format suisse détecté - numéro 8 caractères");
    }
    // Format polonais: EK08079646P0L... (numéro de passeport de 10 caractères)
    else if (/^[A-Z0-9]{10}[A-Z0-9]{3}/.test(secondLine)) {
      passportNumber = secondLine.substring(0, 10).replace(/</g, '');
      console.log("🇵🇱 Format polonais détecté - numéro 10 caractères");
    } else {
      // Format standard: numéro de passeport de 9 caractères
      passportNumber = secondLine.substring(0, 9).replace(/</g, '');
      console.log("🌍 Format standard détecté - numéro 9 caractères");
    }
    
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
  
  // Support formats P< et PP pour ligne unique + erreurs OCR
  let countryCode = '';
  let restOfLine = '';
  
  if (cleanLine.startsWith('P<')) {
    countryCode = cleanLine.substring(2, 5);
    restOfLine = cleanLine.substring(5);
  } else if (cleanLine.startsWith('PP')) {
    countryCode = cleanLine.substring(2, 5);
    restOfLine = cleanLine.substring(5);
  } else if (cleanLine.startsWith('PM')) {
    countryCode = cleanLine.substring(2, 5);
    restOfLine = cleanLine.substring(5);
  } else if (cleanLine.startsWith("'<") || cleanLine.startsWith('I<') || cleanLine.startsWith('1<')) {
    // CORRECTION CRITIQUE - Erreurs OCR sur le P
    console.log("🔧 Correction erreur OCR ligne unique sur P:", cleanLine.substring(0, 3));
    countryCode = cleanLine.substring(2, 5);
    restOfLine = cleanLine.substring(5);
  }
  
  if (restOfLine) {
    const parts = restOfLine.split('<').filter(part => part.length > 0);
    console.log("📝 Parties extraites:", parts);
    
    if (parts.length >= 1) {
      mrzData.nom = parts[0];
      console.log("✅ Nom extrait de ligne unique:", mrzData.nom);
    }
    if (parts.length >= 2) {
      // CORRECTION OCR : J0 → JO, O0 →  OO
      const correctedPrenoms = parts.slice(1).map(name => 
        name.replace(/J0/g, 'JO').replace(/O0/g, 'OO').replace(/0O/g, 'OO')
      );
      mrzData.prenom = correctedPrenoms.join(' ');
      console.log("✅ Prénom extrait de ligne unique:", mrzData.prenom);
    }
    
    // Extraction nationalité
    if (countryCode) {
      mrzData.nationalite = normalizeNationality(convertCountryCodeToNationality(countryCode));
      console.log("✅ Nationalité extraite:", mrzData.nationalite);
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
    'D': 'Allemagne',           // ← FORMAT ALLEMAND
    'ITA': 'Italie',
    'GBR': 'Royaume-Uni',
    'USA': 'États-Unis',
    'CAN': 'Canada',
    'BEL': 'Belgique',          // ← AJOUT CRITIQUE BELGE
    'POL': 'Pologne',           // ← AJOUT CRITIQUE POLONAIS
    'SVK': 'Slovaquie',         // ← AJOUT CRITIQUE SLOVAQUE
    'COL': 'Colombie',          // ← AJOUT CRITIQUE COLOMBIEN
    'NLD': 'Pays-Bas',
    'PRT': 'Portugal',
    'CHE': 'Suisse',
    'AUT': 'Autriche',
    'TUN': 'Tunisie',
    'DZA': 'Algérie',
    'ALG': 'Algérie',
    'EGY': 'Égypte',
    'LBY': 'Libye',
    'SEN': 'Sénégal',
    'CIV': 'Côte d\'Ivoire',
    'MLI': 'Mali',
    'BFA': 'Burkina Faso',
    'NER': 'Niger',
    'TCD': 'Tchad',
    'CMR': 'Cameroun',
    'GAB': 'Gabon',
    'COD': 'République démocratique du Congo',
    'COG': 'République du Congo',
    'CAF': 'République centrafricaine',
    'TGO': 'Togo',
    'BEN': 'Bénin',
    'GHA': 'Ghana',
    'NGA': 'Nigeria',
    'ETH': 'Éthiopie',
    'KEN': 'Kenya',
    'UGA': 'Ouganda',
    'TZA': 'Tanzanie',
    'MDG': 'Madagascar',
    'MUS': 'Maurice',
    'SYC': 'Seychelles',
    'COM': 'Comores',
    'ZAF': 'Afrique du Sud',
    'BWA': 'Botswana',
    'NAM': 'Namibie',
    'LSO': 'Lesotho',
    'SWZ': 'Eswatini',
    'MWI': 'Malawi',
    'ZMB': 'Zambie',
    'ZWE': 'Zimbabwe',
    'MOZ': 'Mozambique',
    'AGO': 'Angola',
    'TUR': 'Turquie',
    'IRN': 'Iran',
    'IRQ': 'Irak',
    'SYR': 'Syrie',
    'LBN': 'Liban',
    'JOR': 'Jordanie',
    'ISR': 'Israël',
    'PSE': 'Palestine',
    'SAU': 'Arabie saoudite',
    'ARE': 'Émirats arabes unis',
    'QAT': 'Qatar',
    'KWT': 'Koweït',
    'BHR': 'Bahreïn',
    'OMN': 'Oman',
    'YEM': 'Yémen'
  };

  // Nettoyage et recherche
  const cleanCode = countryCode.replace(/[<\s]/g, '').toUpperCase();
  console.log(`🌍 Conversion code pays: ${cleanCode} → ${countryMapping[cleanCode] || cleanCode}`);
  
  return countryMapping[cleanCode] || cleanCode;
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
    // SKIP les lignes qui contiennent des mots-clés de passeport
    const lineUpper = line.toUpperCase();
    const skipKeywords = ['REISEPASS', 'PASSEPORT', 'PASSPORT', 'PASZPORT', 'PASZPORTI', 'PASAPORTE', 'PASSAPORTO', 'PASPOORT'];
    const shouldSkipLine = skipKeywords.some(keyword => lineUpper.includes(keyword));
    
    if (shouldSkipLine) {
      console.log("⚠️ Ligne ignorée (contient mot-clé passeport):", line);
      continue;
    }
    
    // Recherche patterns nom/prénom avec plus de flexibilité
    if (!mrzData.nom) {
      const nomPatterns = [
        /(?:SURNAME|NOM|FAMILY\s*NAME)\s*:?\s*([A-Z\s]{2,30})/i,
        /(?:APELLIDO|NACHNAME|COGNOME|NAZWISKO)\s*:?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of nomPatterns) {
        const nomMatch = line.match(pattern);
        if (nomMatch && nomMatch[1] && nomMatch[1].trim().length >= 2) {
          const candidateName = nomMatch[1].trim();
          // Vérification avec validation complète
          if (isValidName(candidateName)) {
            mrzData.nom = candidateName;
            console.log("✅ Nom extrait du texte général:", mrzData.nom);
            break;
          }
        }
      }
    }
    
    if (!mrzData.prenom) {
      const prenomPatterns = [
        /(?:GIVEN\s*NAMES?|PRENOM|FIRST\s*NAME)\s*:?\s*([A-Z\s]{2,30})/i,
        /(?:NOMBRE|VORNAME|NOME|IMIE|IMIONA)\s*:?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of prenomPatterns) {
        const prenomMatch = line.match(pattern);
        if (prenomMatch && prenomMatch[1] && prenomMatch[1].trim().length >= 2) {
          const candidateFirstName = prenomMatch[1].trim();
          // Vérification avec validation complète  
          if (isValidName(candidateFirstName)) {
            mrzData.prenom = candidateFirstName;
            console.log("✅ Prénom extrait du texte général:", mrzData.prenom);
            break;
          }
        }
      }
    }
    
    // Recherche numéro passeport avec patterns étendus
    if (!mrzData.numero_passeport) {
      const passportPatterns = [
        /(?:PASSPORT\s*NO|N°\s*PASSEPORT|PASAPORTE\s*N|REISEPASS\s*NR|PASZPORT\s*NR)\s*:?\s*([A-Z0-9]{6,15})/i,
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
      // Pattern spécial pour détecter directement Canadian/canadienne dans le texte
      if (lineUpper.includes('CANADIAN/CANADIENNE') || lineUpper.includes('CANADIEN/CANADIENNE')) {
        mrzData.nationalite = 'Canada';
        console.log("✅ Nationalité canadienne détectée directement:", mrzData.nationalite);
        continue;
      }
      
      const nationalityPatterns = [
        /(?:NATIONALITY|NATIONALITE|NACIONALIDAD|STAATSANGEHÖRIGKEIT|OBYWATELSTWO)\s*:?\s*([A-Z\s\/]{3,30})/i,
        /(?:CITTADINANZA|NACIONALIDADE|NATIONALITEIT)\s*:?\s*([A-Z\s\/]{3,30})/i,
        // Pattern direct pour les nationalités sans étiquette
        /(CANADIAN\/CANADIENNE|CANADIEN\/CANADIENNE|BRITISH\s+CITIZEN|COLOMBIANA|POLSKIE|SLOVENSKÁ\s+REPUBLIKA)/i
      ];
      
      for (const pattern of nationalityPatterns) {
        const nationalityMatch = line.match(pattern);
        if (nationalityMatch && nationalityMatch[1] && nationalityMatch[1].trim().length >= 3) {
          const candidateNationality = nationalityMatch[1].trim();
          // Conversion et normalisation complète avec debug
          console.log("🔍 Nationalité candidate:", candidateNationality);
          const convertedNationality = convertMainTextNationality(candidateNationality);
          console.log("🔄 Après conversion:", convertedNationality);
          const normalizedNationality = normalizeNationality(convertedNationality);
          console.log("✨ Après normalisation:", normalizedNationality);
          
          if (normalizedNationality.length >= 3) {
            mrzData.nationalite = normalizedNationality;
            console.log("✅ Nationalité extraite et normalisée:", mrzData.nationalite);
            break;
          }
        }
      }
    }
  }
}

// Fonction supprimée - on utilise maintenant isValidName() du module stringUtils qui est plus complète
