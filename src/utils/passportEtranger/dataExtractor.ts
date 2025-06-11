
import { PassportEtrangerData } from "@/types/passportEtrangerTypes";
import { safeStringTrim } from "./stringUtils";
import { extractDataFromMainText } from "./mainTextExtractor";
import { extractNamesFromMRZ, extractOtherDataFromMRZ } from "./mrzExtractor";
import { normalizeNationality } from "../nationalityNormalizer";

export const extractPassportEtrangerData = (text: string): PassportEtrangerData => {
  console.log("🔍 EXTRACTION PASSEPORT ÉTRANGER - Extracting data from text:", text);
  
  const lines = text.split('\n').map(line => safeStringTrim(line)).filter(line => line.length > 0);
  const passportData: PassportEtrangerData = {};

  // Analyse du texte principal pour extraire nom, prénom et nationalité
  extractDataFromMainText(lines, passportData);
  
  // Recherche des lignes MRZ pour les autres informations
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("📄 Detected MRZ lines:", mrzLines);

  if (mrzLines.length > 0) {
    // Extraction depuis MRZ comme fallback pour nom/prénom si pas trouvé dans le texte principal
    if (!passportData.nom || !passportData.prenom) {
      extractNamesFromMRZ(mrzLines, passportData);
    }
    
    // Extraction des autres données depuis MRZ
    extractOtherDataFromMRZ(mrzLines, passportData);
  }

  // Normaliser la nationalité si elle existe
  if (passportData.nationalite) {
    passportData.nationalite = normalizeNationality(passportData.nationalite);
    console.log("✅ Nationalité normalisée:", passportData.nationalite);
  }

  // Nettoyer les données extraites - ne pas inclure de fausses données
  if (passportData.code_barre && !isValidBarcode(passportData.code_barre)) {
    console.log("🚫 Code-barres invalide détecté, suppression:", passportData.code_barre);
    delete passportData.code_barre;
  }

  if (passportData.numero_telephone && !isValidPhoneNumber(passportData.numero_telephone)) {
    console.log("🚫 Numéro de téléphone invalide détecté, suppression:", passportData.numero_telephone);
    delete passportData.numero_telephone;
  }

  // Logs de debug pour les champs extraits
  if (passportData.nom) console.log("✅ Nom extrait:", passportData.nom);
  if (passportData.prenom) console.log("✅ Prénom extrait:", passportData.prenom);
  if (passportData.numero_passeport) console.log("✅ Numéro passeport extrait:", passportData.numero_passeport);
  if (passportData.nationalite) console.log("✅ Nationalité extraite:", passportData.nationalite);

  console.log("📋 Final extracted foreign passport data:", passportData);
  return passportData;
};

// Fonction pour valider si un code-barres est réaliste
function isValidBarcode(barcode: string): boolean {
  if (!barcode || barcode.length < 6) return false;
  
  // Exclure les mots communs qui ne sont pas des codes-barres
  const excludedWords = [
    'BUNDESREPUBLIK', 'JUNDESREPUBLIK', 'DEUTSCHLAND', 'REPUBLIC', 'FEDERAL',
    'PASSPORT', 'PASSEPORT', 'REISEPASS', 'CARTE', 'IDENTITY', 'IDENTITE'
  ];
  
  if (excludedWords.includes(barcode.toUpperCase())) {
    return false;
  }
  
  // Un vrai code-barres devrait avoir un format spécifique (ex: P=1234, ou alphanumerique mixte)
  return /^P=\d+$/i.test(barcode) || /^[A-Z0-9]{6,15}$/.test(barcode);
}

// Fonction pour valider si un numéro de téléphone est réaliste
function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Exclure les séquences de chiffres des données MRZ qui ne sont pas des téléphones
  if (phone.length > 15 || phone.length < 8) return false;
  
  // Les vrais numéros de téléphone ne contiennent que des chiffres et peuvent commencer par +
  return /^(\+?[0-9]{8,15})$/.test(phone) && !phone.startsWith('0000');
}
