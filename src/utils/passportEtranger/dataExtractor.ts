import { PassportEtrangerData } from "@/types/passportEtrangerTypes";
import { extractMRZData } from "@/services/ocr/mrzDataExtractor";
import { extractDataFromMainText } from "./mainTextExtractor";
import { normalizeNationality } from "../nationalityNormalizer";

export const extractPassportEtrangerData = (text: string): PassportEtrangerData => {
  console.log("🌍 === DÉBUT EXTRACTION PASSEPORT ÉTRANGER ===");
  console.log("📏 Longueur du texte:", text.length);
  console.log("📝 TEXTE COMPLET OCR REÇU:", text);
  
  const result: PassportEtrangerData = {};

  // Étape 1: Tentative extraction MRZ (zone machine-readable)
  console.log("🔍 ÉTAPE 1 - Recherche zone MRZ...");
  const mrzData = extractMRZData(text);
  if (mrzData.nom || mrzData.prenom || mrzData.numero_passeport) {
    console.log("✅ Données MRZ trouvées:", mrzData);
    Object.assign(result, mrzData);
  } else {
    console.log("⚠️ Aucune donnée MRZ détectée");
  }

  // Étape 2: Extraction depuis texte principal (complément ou alternative)
  console.log("🔍 ÉTAPE 2 - Extraction texte principal...");
  const lines = text.split('\n').map(line => line.trim());
  
  // Créer un objet temporaire pour les données du texte principal
  const mainTextData: PassportEtrangerData = {};
  extractDataFromMainText(lines, mainTextData);
  
  console.log("📋 Données du texte principal extraites:", mainTextData);
  
  // Étape 2.5: LOGIQUE DE PRIORITÉ - Texte principal prioritaire pour certains champs
  console.log("🔄 ÉTAPE 2.5 - Application de la logique de priorité...");
  
  // PRIORITÉ TEXTE PRINCIPAL pour le numéro de passeport (plus fiable)
  if (mainTextData.numero_passeport && mainTextData.numero_passeport.length >= 6) {
    console.log(`✅ Numéro passeport: TEXTE PRINCIPAL prioritaire "${mainTextData.numero_passeport}" vs MRZ "${result.numero_passeport}"`);
    result.numero_passeport = mainTextData.numero_passeport;
  } else if (!result.numero_passeport && mrzData.numero_passeport) {
    console.log(`✅ Numéro passeport: Utilisation MRZ en fallback "${mrzData.numero_passeport}"`);
    result.numero_passeport = mrzData.numero_passeport;
  }
  
  // PRIORITÉ TEXTE PRINCIPAL pour nom et prénom (plus précis)
  if (mainTextData.nom && mainTextData.nom.length >= 2) {
    console.log(`✅ Nom: TEXTE PRINCIPAL prioritaire "${mainTextData.nom}" vs MRZ "${result.nom}"`);
    result.nom = mainTextData.nom;
  }
  
  if (mainTextData.prenom && mainTextData.prenom.length >= 2) {
    console.log(`✅ Prénom: TEXTE PRINCIPAL prioritaire "${mainTextData.prenom}" vs MRZ "${result.prenom}"`);
    result.prenom = mainTextData.prenom;
  }
  
  // PRIORITÉ TEXTE PRINCIPAL pour nationalité
  if (mainTextData.nationalite) {
    console.log(`✅ Nationalité: TEXTE PRINCIPAL prioritaire "${mainTextData.nationalite}" vs MRZ "${result.nationalite}"`);
    result.nationalite = mainTextData.nationalite;
  }
  
  // PRIORITÉ TEXTE PRINCIPAL pour dates (plus précises)
  if (mainTextData.date_naissance) {
    console.log(`✅ Date naissance: TEXTE PRINCIPAL prioritaire "${mainTextData.date_naissance}"`);
    result.date_naissance = mainTextData.date_naissance;
  }
  
  if (mainTextData.date_expiration) {
    console.log(`✅ Date expiration: TEXTE PRINCIPAL prioritaire "${mainTextData.date_expiration}"`);
    result.date_expiration = mainTextData.date_expiration;
  }

  // Étape 3: Normalisation des données
  console.log("🔧 ÉTAPE 3 - Normalisation des données...");
  if (result.nationalite) {
    result.nationalite = normalizeNationality(result.nationalite);
  }

  // Étape 4: Validation et nettoyage
  console.log("🔍 ÉTAPE 4 - Validation finale...");
  
  // Nettoyage des noms (enlever caractères parasites)
  if (result.nom) {
    result.nom = result.nom.replace(/[^A-Z\s]/g, '').trim();
    if (result.nom.length < 2) result.nom = undefined;
  }
  
  if (result.prenom) {
    result.prenom = result.prenom.replace(/[^A-Z\s]/g, '').trim();
    if (result.prenom.length < 2) result.prenom = undefined;
  }

  // Validation numéro passeport
  if (result.numero_passeport) {
    result.numero_passeport = result.numero_passeport.replace(/[^A-Z0-9]/g, '');
    if (result.numero_passeport.length < 6) result.numero_passeport = undefined;
  }

  // Validation dates (format DD/MM/YYYY ou similaire)
  if (result.date_naissance && !/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/.test(result.date_naissance)) {
    console.warn("⚠️ Format date naissance invalide:", result.date_naissance);
    result.date_naissance = undefined;
  }
  
  if (result.date_expiration && !/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}/.test(result.date_expiration)) {
    console.warn("⚠️ Format date expiration invalide:", result.date_expiration);
    result.date_expiration = undefined;
  }

  // Étape 5: Résultats finaux
  console.log("📋 === RÉSULTAT FINAL EXTRACTION PASSEPORT ÉTRANGER ===");
  const finalData = {
    nom: result.nom || "NON TROUVÉ",
    prenom: result.prenom || "NON TROUVÉ", 
    nationalite: result.nationalite || "NON TROUVÉ",
    numero_passeport: result.numero_passeport || "NON TROUVÉ",
    date_naissance: result.date_naissance || "NON TROUVÉ",
    date_expiration: result.date_expiration || "NON TROUVÉ"
  };
  
  console.log("📋 Données finales extraites:", finalData);
  
  // Calcul du taux de réussite
  const successfulFields = Object.values(finalData).filter(value => 
    value && value !== "NON TROUVÉ"
  ).length;
  
  console.log(`📊 Champs extraits avec succès: ${successfulFields}/6`);
  console.log(`📈 Taux de réussite: ${Math.round((successfulFields/6)*100)}%`);

  if (successfulFields === 0) {
    console.warn("⚠️ AUCUNE DONNÉE EXTRAITE - Vérifiez la qualité de l'image ou le type de document");
  }

  console.log("🌍 === FIN EXTRACTION PASSEPORT ÉTRANGER ===");
  return result;
};