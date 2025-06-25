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
  
  // DÉTECTION MRZ CORROMPUE - caractères invalides ou codes pays invalides
  const isMRZCorrupted = (
    (result.nom && (result.nom.includes('+') || result.nom.includes('*') || result.nom.length < 2)) ||
    (result.prenom && (result.prenom.includes('*') || result.prenom === '**' || result.prenom.length < 2)) ||
    (result.nationalite && !['Canada', 'Allemagne', 'France', 'Espagne', 'Italie', 'Pologne', 'Slovaquie', 'Belgique', 'États-Unis', 'Royaume-Uni', 'Suisse', 'République tchèque', 'Colombie'].includes(result.nationalite))
  );
  
  if (isMRZCorrupted) {
    console.log("⚠️ MRZ CORROMPUE DÉTECTÉE - Priorité au texte principal");
  }
  
  // PRIORITÉ INTELLIGENTE pour le numéro de passeport
  // Si MRZ corrompue, privilégier ABSOLUMENT le texte principal
  if (isMRZCorrupted && mainTextData.numero_passeport && mainTextData.numero_passeport.length >= 6) {
    console.log(`✅ Numéro passeport: TEXTE PRINCIPAL prioritaire (MRZ corrompue) "${mainTextData.numero_passeport}" vs MRZ "${result.numero_passeport}"`);
    result.numero_passeport = mainTextData.numero_passeport;
  } else if (result.numero_passeport && result.numero_passeport.length >= 6) {
    console.log(`✅ Numéro passeport: MRZ PRIORITAIRE "${result.numero_passeport}" vs TEXTE "${mainTextData.numero_passeport}"`);
    // Garder MRZ
  } else if (mainTextData.numero_passeport && mainTextData.numero_passeport.length >= 6) {
    console.log(`✅ Numéro passeport: TEXTE PRINCIPAL en fallback "${mainTextData.numero_passeport}"`);
    result.numero_passeport = mainTextData.numero_passeport;
  }

    // PRIORITÉ INTELLIGENTE pour nom et prénom
  // DÉTECTION DE MÉLANGE NOM/PRÉNOM DANS LA MRZ
  const isMRZMixedUpNames = (
    result.nom && result.prenom && mainTextData.nom && mainTextData.prenom &&
    (
      // Le prénom MRZ contient le nom du texte principal (ex: "GALVIS LEYDI GRACIELA" contient "GALVIS")
      result.prenom.toUpperCase().includes(mainTextData.nom.split(' ')[mainTextData.nom.split(' ').length - 1]?.toUpperCase()) ||
      // Le nom MRZ est incomplet par rapport au texte principal (ex: "MALDONADO" vs "MALDONADO GALVIS")
      (mainTextData.nom.split(' ').length > 1 && result.nom === mainTextData.nom.split(' ')[0])
    )
  );
  
  if (isMRZMixedUpNames) {
    console.log("🔄 MRZ a mélangé nom/prénom : privilégier texte principal plus précis");
    console.log(`   MRZ: "${result.nom}" / "${result.prenom}"`);
    console.log(`   TEXTE: "${mainTextData.nom}" / "${mainTextData.prenom}"`);
    result.nom = mainTextData.nom;
    result.prenom = mainTextData.prenom;
    console.log(`✅ Nom/Prénom: TEXTE PRINCIPAL prioritaire (MRZ mélangée) - "${result.nom}" / "${result.prenom}"`);
  }
  // Si MRZ corrompue, privilégier ABSOLUMENT le texte principal
  else if (isMRZCorrupted) {
    console.log("🔄 MRZ corrompue : privilégier texte principal pour nom/prénom");
    if (mainTextData.nom && mainTextData.nom.length >= 2) {
      result.nom = mainTextData.nom;
      console.log(`✅ Nom: TEXTE PRINCIPAL prioritaire (MRZ corrompue) "${mainTextData.nom}"`);
    }
    if (mainTextData.prenom && mainTextData.prenom.length >= 2) {
      result.prenom = mainTextData.prenom;
      console.log(`✅ Prénom: TEXTE PRINCIPAL prioritaire (MRZ corrompue) "${mainTextData.prenom}"`);
    }
  }
  // Si MRZ disponible ET fiable ET non corrompue ET non mélangée, elle est prioritaire (plus précise)
  else if (result.nom && result.prenom && result.nom.length >= 2 && result.prenom.length >= 2 && !isMRZCorrupted) {
    console.log(`✅ Nom/Prénom: MRZ PRIORITAIRE - "${result.nom}" / "${result.prenom}"`);
    // Garder les données MRZ, ne pas écraser
  } else {
    // Sinon utiliser texte principal en fallback
    if (mainTextData.nom && mainTextData.nom.length >= 2 && !result.nom) {
      console.log(`✅ Nom: TEXTE PRINCIPAL en fallback "${mainTextData.nom}"`);
      result.nom = mainTextData.nom;
    }
    
    if (mainTextData.prenom && mainTextData.prenom.length >= 2 && !result.prenom) {
      console.log(`✅ Prénom: TEXTE PRINCIPAL en fallback "${mainTextData.prenom}"`);
      result.prenom = mainTextData.prenom;
    }
  }
  
  // Compléter avec texte principal si MRZ manque quelque chose
  if (!result.nom && mainTextData.nom && mainTextData.nom.length >= 2) {
    console.log(`✅ Nom: TEXTE PRINCIPAL pour compléter MRZ "${mainTextData.nom}"`);
    result.nom = mainTextData.nom;
  }
  
  if (!result.prenom && mainTextData.prenom && mainTextData.prenom.length >= 2) {
    console.log(`✅ Prénom: TEXTE PRINCIPAL pour compléter MRZ "${mainTextData.prenom}"`);
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
  
  // Nettoyage des noms (enlever caractères parasites mais garder les accents)
  if (result.nom) {
    result.nom = result.nom.replace(/[®©™\+\•\*]/g, '').trim();  // Enlever seulement les caractères parasites spécifiques
    if (result.nom.length < 2) result.nom = undefined;
  }
  
  if (result.prenom) {
    result.prenom = result.prenom.replace(/[®©™\+\•\*]/g, '').trim();  // Enlever seulement les caractères parasites spécifiques
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