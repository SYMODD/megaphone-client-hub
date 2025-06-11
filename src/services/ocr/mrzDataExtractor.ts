
import { MRZData } from "@/types/ocrTypes";
import { extractPhoneNumber } from "./phoneExtractor";
import { extractBarcode } from "./barcodeExtractor";
import { normalizeNationality } from "@/utils/nationalityNormalizer";

export const extractMRZData = (text: string): MRZData => {
  console.log("🔍 EXTRACTION MRZ - Extracting data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const mrzData: MRZData = {};

  // Recherche des lignes MRZ
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("📄 Detected MRZ lines:", mrzLines);

  // Extraction des noms depuis MRZ
  for (const line of mrzLines) {
    const cleanLine = line.trim();
    
    // Pattern pour la première ligne MRZ des passeports (P<CODE_PAYS<NOM<<PRENOM<<<)
    const namePattern = /P<[A-Z]{1,3}<+([A-Z]+)<<([A-Z]+)</;
    const match = cleanLine.match(namePattern);
    
    if (match) {
      const nom = match[1].replace(/</g, '').trim();
      const prenom = match[2].replace(/</g, '').trim();
      
      if (nom && nom.length > 1) {
        mrzData.nom = nom;
        console.log("✅ Nom extrait:", nom);
      }
      if (prenom && prenom.length > 1) {
        mrzData.prenom = prenom;
        console.log("✅ Prénom extrait:", prenom);
      }
      
      console.log("📄 Noms extraits de la ligne MRZ:", { nom, prenom });
      break;
    }
  }

  // Extraction des autres données depuis la deuxième ligne MRZ
  for (const line of mrzLines) {
    const cleanLine = line.trim();
    
    if (cleanLine.length >= 36 && /^[A-Z0-9<]{36,}$/.test(cleanLine) && !cleanLine.startsWith('P<')) {
      console.log("📄 Processing second line:", cleanLine);
      
      // Extraction du numéro de passeport (premiers 9 caractères)
      const numeroPasseport = cleanLine.substring(0, 9).replace(/</g, '');
      if (numeroPasseport && numeroPasseport.length >= 6) {
        mrzData.numero_passeport = numeroPasseport;
        console.log("📄 Numéro de document extrait:", numeroPasseport);
      }
      
      // Extraction du code nationalité (caractères 10-12)
      const nationaliteCode = cleanLine.substring(10, 13).replace(/</g, '');
      if (nationaliteCode && nationaliteCode.length >= 1) {
        mrzData.nationalite = normalizeNationality(nationaliteCode);
        console.log("📄 Code nationalité extrait:", nationaliteCode);
      }
      
      // Extraction de la date de naissance (AAMMJJ - positions 13-18)
      const dateNaissanceRaw = cleanLine.substring(13, 19);
      if (/^\d{6}$/.test(dateNaissanceRaw)) {
        const annee = "20" + dateNaissanceRaw.substring(0, 2);
        const mois = dateNaissanceRaw.substring(2, 4);
        const jour = dateNaissanceRaw.substring(4, 6);
        
        const anneeNum = parseInt(annee);
        const moisNum = parseInt(mois);
        const jourNum = parseInt(jour);
        
        if (anneeNum >= 1940 && anneeNum <= 2024 && moisNum >= 1 && moisNum <= 12 && jourNum >= 1 && jourNum <= 31) {
          mrzData.date_naissance = `${annee}-${mois}-${jour}`;
          console.log("📄 Date naissance extraite:", mrzData.date_naissance);
        }
      }
      
      // Extraction de la date d'expiration (AAMMJJ - positions 21-26)
      const dateExpirationRaw = cleanLine.substring(21, 27);
      if (/^\d{6}$/.test(dateExpirationRaw)) {
        const annee = "20" + dateExpirationRaw.substring(0, 2);
        const mois = dateExpirationRaw.substring(2, 4);
        const jour = dateExpirationRaw.substring(4, 6);
        
        const anneeNum = parseInt(annee);
        const moisNum = parseInt(mois);
        const jourNum = parseInt(jour);
        
        if (anneeNum >= 2024 && anneeNum <= 2040 && moisNum >= 1 && moisNum <= 12 && jourNum >= 1 && jourNum <= 31) {
          mrzData.date_expiration = `${annee}-${mois}-${jour}`;
          console.log("📄 Date expiration extraite:", mrzData.date_expiration);
        }
      }
      
      break;
    }
  }

  // Extraction du téléphone - seulement si c'est un vrai numéro
  const phoneNumber = extractPhoneNumber(text);
  if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
    mrzData.numero_telephone = phoneNumber;
    console.log("✅ Téléphone extrait:", phoneNumber);
  }

  // Extraction du code-barres - seulement si c'est un vrai code-barres
  const barcode = extractBarcode(text, phoneNumber);
  if (barcode && isValidBarcode(barcode)) {
    mrzData.code_barre = barcode;
    console.log("✅ Code-barres extrait:", barcode);
  }

  console.log("📋 Final extracted MRZ data:", mrzData);
  return mrzData;
};

// Fonction pour valider les numéros de téléphone
function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  if (phone.length > 15 || phone.length < 8) return false;
  return /^(\+?[0-9]{8,15})$/.test(phone) && !phone.startsWith('0000');
}

// Fonction pour valider les codes-barres
function isValidBarcode(barcode: string): boolean {
  if (!barcode || barcode.length < 6) return false;
  
  const excludedWords = [
    'BUNDESREPUBLIK', 'JUNDESREPUBLIK', 'DEUTSCHLAND', 'REPUBLIC', 'FEDERAL',
    'PASSPORT', 'PASSEPORT', 'REISEPASS', 'CARTE', 'IDENTITY', 'IDENTITE'
  ];
  
  if (excludedWords.includes(barcode.toUpperCase())) {
    return false;
  }
  
  return /^P=\d+$/i.test(barcode) || /^[A-Z0-9]{6,15}$/.test(barcode);
}
