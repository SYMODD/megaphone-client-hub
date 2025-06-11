
import { PassportEtrangerData } from "@/types/passportEtrangerTypes";
import { safeStringTrim } from "./stringUtils";
import { normalizeNationality } from "../nationalityNormalizer";

export const extractNamesFromMRZ = (mrzLines: string[], passportData: PassportEtrangerData) => {
  console.log("📄 Extraction des noms depuis MRZ...");
  
  for (const line of mrzLines) {
    const cleanLine = safeStringTrim(line);
    
    // Pattern pour la première ligne MRZ des passeports (P<CODE_PAYS<NOM<<PRENOM<<<)
    const namePattern = /P<[A-Z]{1,3}<+([A-Z]+)<<([A-Z]+)</;
    const match = cleanLine.match(namePattern);
    
    if (match) {
      const nom = match[1].replace(/</g, '').trim();
      const prenom = match[2].replace(/</g, '').trim();
      
      if (nom && nom.length > 1) {
        passportData.nom = nom;
        console.log("📄 Nom extrait de la MRZ:", nom);
      }
      if (prenom && prenom.length > 1) {
        passportData.prenom = prenom;
        console.log("📄 Prénom extrait de la MRZ:", prenom);
      }
      
      console.log("📄 Noms extraits de la ligne MRZ:", { nom, prenom });
      break;
    }
  }
};

export const extractOtherDataFromMRZ = (mrzLines: string[], passportData: PassportEtrangerData) => {
  console.log("📄 Extraction des autres données depuis MRZ...");
  
  for (const line of mrzLines) {
    const cleanLine = safeStringTrim(line);
    
    // Pattern pour la deuxième ligne MRZ (numéro de passeport, nationalité, dates, etc.)
    if (cleanLine.length >= 36 && /^[A-Z0-9<]{36,}$/.test(cleanLine)) {
      console.log("📄 Processing second line:", cleanLine);
      
      // Extraction du numéro de passeport (premiers 9 caractères)
      const numeroPasseport = cleanLine.substring(0, 9).replace(/</g, '');
      if (numeroPasseport && numeroPasseport.length >= 6) {
        passportData.numero_passeport = numeroPasseport;
        console.log("📄 Numéro de document extrait:", numeroPasseport);
      }
      
      // Extraction du code nationalité (caractères 10-12)
      const nationaliteCode = cleanLine.substring(10, 13).replace(/</g, '');
      if (nationaliteCode && nationaliteCode.length >= 1) {
        // Normaliser le code de nationalité
        const nationaliteNormalisee = normalizeNationality(nationaliteCode);
        if (nationaliteNormalisee) {
          passportData.nationalite = nationaliteNormalisee;
          console.log("📄 Code nationalité extrait et normalisé:", nationaliteCode, "→", nationaliteNormalisee);
        }
      }
      
      // Extraction de la date de naissance (AAMMJJ - positions 13-18)
      const dateNaissanceRaw = cleanLine.substring(13, 19);
      if (/^\d{6}$/.test(dateNaissanceRaw)) {
        const annee = "20" + dateNaissanceRaw.substring(0, 2);
        const mois = dateNaissanceRaw.substring(2, 4);
        const jour = dateNaissanceRaw.substring(4, 6);
        
        // Validation basique de la date
        const anneeNum = parseInt(annee);
        const moisNum = parseInt(mois);
        const jourNum = parseInt(jour);
        
        if (anneeNum >= 1940 && anneeNum <= 2024 && moisNum >= 1 && moisNum <= 12 && jourNum >= 1 && jourNum <= 31) {
          passportData.date_naissance = `${annee}-${mois}-${jour}`;
          console.log("📄 Date naissance extraite:", passportData.date_naissance);
        }
      }
      
      // Extraction de la date d'expiration (AAMMJJ - positions 21-26)
      const dateExpirationRaw = cleanLine.substring(21, 27);
      if (/^\d{6}$/.test(dateExpirationRaw)) {
        const annee = "20" + dateExpirationRaw.substring(0, 2);
        const mois = dateExpirationRaw.substring(2, 4);
        const jour = dateExpirationRaw.substring(4, 6);
        
        // Validation basique de la date
        const anneeNum = parseInt(annee);
        const moisNum = parseInt(mois);
        const jourNum = parseInt(jour);
        
        if (anneeNum >= 2024 && anneeNum <= 2040 && moisNum >= 1 && moisNum <= 12 && jourNum >= 1 && jourNum <= 31) {
          passportData.date_expiration = `${annee}-${mois}-${jour}`;
          console.log("📄 Date expiration extraite:", passportData.date_expiration);
        }
      }
      
      break;
    }
  }
};
