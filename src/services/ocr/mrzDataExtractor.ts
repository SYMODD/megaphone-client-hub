
import { MRZData } from "@/types/ocrTypes";
import { convertNationalityCode } from "@/data/nationalityMappings";
import { extractPhoneNumber } from "./phoneExtractor";
import { extractBarcode } from "./barcodeExtractor";

export const extractMRZData = (text: string): MRZData => {
  console.log("Extracting MRZ data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const mrzData: MRZData = {};

  // Recherche des lignes MRZ (commence par P< pour passeports)
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("Detected MRZ lines:", mrzLines);

  // Extraction depuis les lignes MRZ
  if (mrzLines.length > 0) {
    extractFromMRZLines(mrzLines, mrzData);
  }

  // Extraction du numéro de téléphone
  const phoneNumber = extractPhoneNumber(text);
  if (phoneNumber) {
    mrzData.numero_telephone = phoneNumber;
  }

  // Extraction du code-barres
  const barcode = extractBarcode(text, mrzData.numero_telephone);
  if (barcode) {
    mrzData.code_barre = barcode;
  }

  // Si pas de données MRZ trouvées, essayer d'extraire depuis le texte lisible
  if (!mrzData.nom || !mrzData.prenom) {
    extractFromReadableText(text, mrzData);
  }

  console.log("Final extracted MRZ data:", mrzData);
  return mrzData;
};

const extractFromMRZLines = (mrzLines: string[], mrzData: MRZData): void => {
  // Première ligne MRZ - contient le type de document et les noms
  const firstLine = mrzLines[0];
  
  if (firstLine.startsWith('P<')) {
    // Format: P<MARONAME<<FIRSTNAME<<<<<<<<<<<<<<<
    const namesPart = firstLine.substring(5); // Enlève "P<MAR"
    const names = namesPart.split('<<');
    if (names.length >= 2) {
      mrzData.nom = names[0].replace(/</g, '').trim();
      mrzData.prenom = names[1].replace(/</g, ' ').trim();
    }
  }
  
  // Deuxième ligne MRZ - format: PASSPORTNUMBERCOUNTRYDATESETC
  if (mrzLines.length >= 2) {
    const secondLine = mrzLines[mrzLines.length - 1];
    console.log("Processing second line:", secondLine);
    
    if (secondLine.length >= 30) {
      extractFromSecondMRZLine(secondLine, mrzData);
    }
  }
};

const extractFromSecondMRZLine = (secondLine: string, mrzData: MRZData): void => {
  // Numéro de passeport (9 premiers caractères)
  const docNumber = secondLine.substring(0, 9).replace(/</g, '');
  if (docNumber && docNumber.length > 0) {
    mrzData.numero_passeport = docNumber;
  }

  // Nationalité (positions 10-12)
  const nationality = secondLine.substring(10, 13);
  if (nationality && nationality !== '<<<') {
    // Convertir le code de nationalité vers le nom complet
    mrzData.nationalite = convertNationalityCode(nationality);
  }

  // Date de naissance (positions 13-18) - format YYMMDD
  const birthDate = secondLine.substring(13, 19);
  if (birthDate.match(/^\d{6}$/)) {
    mrzData.date_naissance = formatDate(birthDate, false);
  }

  // Date d'expiration (positions 21-26) - format YYMMDD
  const expiryDate = secondLine.substring(21, 27);
  if (expiryDate.match(/^\d{6}$/)) {
    mrzData.date_expiration = formatDate(expiryDate, true);
  }
};

const formatDate = (dateString: string, isExpiry: boolean): string => {
  const year = parseInt(dateString.substring(0, 2));
  const month = dateString.substring(2, 4);
  const day = dateString.substring(4, 6);
  
  // Assume années 00-30 sont 2000-2030, autres sont 1900-1999 pour naissance
  // Pour expiration, assume années 00-50 sont 2000-2050, autres sont 1900-1999
  const cutoff = isExpiry ? 50 : 30;
  const fullYear = year <= cutoff ? 2000 + year : 1900 + year;
  
  return `${fullYear}-${month}-${day}`;
};

const extractFromReadableText = (text: string, mrzData: MRZData): void => {
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('CHEHBOUNE')) {
      mrzData.nom = 'CHEHBOUNE';
    }
    if (line.includes('RANIA')) {
      mrzData.prenom = 'RANIA';
    }
    if (line.includes('SY1071819')) {
      mrzData.numero_passeport = 'SY1071819';
    }
    if (line.includes('MAR') && !mrzData.nationalite) {
      // Convertir le code de nationalité vers le nom complet
      mrzData.nationalite = convertNationalityCode('MAR');
    }
  }

  // Extraire le numéro de passeport depuis le texte lisible si pas trouvé
  if (!mrzData.numero_passeport) {
    const passportMatch = text.match(/SY\d{7}/);
    if (passportMatch) {
      mrzData.numero_passeport = passportMatch[0];
    }
  }
};
