
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

  // Logs de debug pour les champs extraits
  if (passportData.nom) console.log("✅ Nom extrait:", passportData.nom);
  if (passportData.prenom) console.log("✅ Prénom extrait:", passportData.prenom);
  if (passportData.numero_passeport) console.log("✅ Numéro passeport extrait:", passportData.numero_passeport);
  if (passportData.nationalite) console.log("✅ Nationalité extraite:", passportData.nationalite);

  console.log("📋 Final extracted foreign passport data:", passportData);
  return passportData;
};
