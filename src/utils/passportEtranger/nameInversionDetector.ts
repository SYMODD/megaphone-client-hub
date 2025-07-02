import { PassportEtrangerData } from "@/types/passportEtrangerTypes";

export interface NameInversionAnalysis {
  isInverted: boolean;
  confidence: number;
  reasons: string[];
  correctedData?: {
    nom: string;
    prenom: string;
  };
}

/**
 * Détecte et corrige les inversions nom/prénom dans les données extraites
 */
export const detectAndCorrectNameInversion = (
  mrzData: PassportEtrangerData,
  textData: PassportEtrangerData
): NameInversionAnalysis => {
  
  console.log("🔍 === DÉTECTION INVERSION NOM/PRÉNOM ===");
  console.log("📝 Données MRZ:", { nom: mrzData.nom, prenom: mrzData.prenom });
  console.log("📝 Données texte:", { nom: textData.nom, prenom: textData.prenom });
  
  const analysis: NameInversionAnalysis = {
    isInverted: false,
    confidence: 0,
    reasons: []
  };
  
  // Si on n'a pas les deux sources, on ne peut pas détecter l'inversion
  if (!mrzData.nom || !mrzData.prenom || !textData.nom || !textData.prenom) {
    console.log("⚠️ Données insuffisantes pour détecter l'inversion");
    return analysis;
  }
  
  // CRITÈRE 1: MRZ et texte principal sont inversés l'un par rapport à l'autre
  const mrzInversedVsText = (
    mrzData.nom === textData.prenom && 
    mrzData.prenom === textData.nom
  );
  
  if (mrzInversedVsText) {
    analysis.confidence += 80;
    analysis.reasons.push("MRZ et texte principal ont nom/prénom inversés");
    console.log("🚨 CRITÈRE 1: MRZ et texte inversés détectés");
  }
  
  // CRITÈRE 2: Le "nom" MRZ ressemble à un prénom commun
  const commonFirstNames = [
    'AHMED', 'MOHAMED', 'FATIMA', 'AISHA', 'OMAR', 'YOUSSEF', 'LEILA', 'SARA', 'HASSAN', 'NADIA',
    'PIERRE', 'MARIE', 'JEAN', 'ANNE', 'PAUL', 'CLAIRE', 'LUC', 'SOPHIE', 'MICHEL', 'ISABELLE',
    'ANTONIO', 'MARIA', 'JOSE', 'CARMEN', 'CARLOS', 'ANA', 'JUAN', 'ELENA', 'LUIS', 'ROSA',
    'GIOVANNI', 'FRANCESCA', 'MARCO', 'GIULIA', 'ANDREA', 'ELENA', 'STEFANO', 'CHIARA', 'LUCA', 'SARA',
    'HANS', 'ANNA', 'FRITZ', 'GRETA', 'KLAUS', 'PETRA', 'WOLFGANG', 'URSULA', 'HEINZ', 'INGRID',
    'JOHN', 'MARY', 'JAMES', 'PATRICIA', 'ROBERT', 'JENNIFER', 'MICHAEL', 'LINDA', 'WILLIAM', 'ELIZABETH',
    'DAVID', 'BARBARA', 'RICHARD', 'SUSAN', 'JOSEPH', 'JESSICA', 'THOMAS', 'SARAH', 'CHARLES', 'KAREN',
    // Prénoms courts spécifiques au cas
    'AKEF', 'LISA', 'ALEX', 'MARK', 'PAUL', 'ANNA', 'EMMA', 'NOAH', 'LIAM', 'MILO'
  ];
  
  if (commonFirstNames.includes(mrzData.nom?.toUpperCase() || '')) {
    analysis.confidence += 30;
    analysis.reasons.push(`"${mrzData.nom}" ressemble à un prénom, pas un nom`);
    console.log(`🔍 CRITÈRE 2: "${mrzData.nom}" détecté comme prénom probable`);
  }
  
  // CRITÈRE 3: Le "prénom" MRZ ressemble à un nom de famille
  const commonSurnames = [
    'SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MILLER', 'DAVIS', 'RODRIGUEZ', 'MARTINEZ',
    'MARTIN', 'BERNARD', 'DUBOIS', 'THOMAS', 'ROBERT', 'PETIT', 'DURAND', 'LEROY', 'MOREAU', 'SIMON',
    'GONZALEZ', 'FERNANDEZ', 'LOPEZ', 'MARTINEZ', 'SANCHEZ', 'PEREZ', 'GOMEZ', 'MARTIN', 'JIMENEZ', 'RUIZ',
    'ROSSI', 'RUSSO', 'FERRARI', 'ESPOSITO', 'BIANCHI', 'ROMANO', 'COLOMBO', 'RICCI', 'MARINO', 'GRECO',
    'MÜLLER', 'SCHMIDT', 'SCHNEIDER', 'FISCHER', 'WEBER', 'MEYER', 'WAGNER', 'BECKER', 'SCHULZ', 'HOFFMANN'
  ];
  
  if (commonSurnames.includes(mrzData.prenom?.toUpperCase() || '')) {
    analysis.confidence += 25;
    analysis.reasons.push(`"${mrzData.prenom}" ressemble à un nom de famille, pas un prénom`);
    console.log(`🔍 CRITÈRE 3: "${mrzData.prenom}" détecté comme nom probable`);
  }
  
  // CRITÈRE 4: Longueur suspecte (prénoms généralement plus courts que noms)
  if (mrzData.nom && mrzData.prenom && mrzData.nom.length < mrzData.prenom.length - 3) {
    analysis.confidence += 15;
    analysis.reasons.push("Le 'nom' MRZ est beaucoup plus court que le 'prénom' (suspect)");
    console.log(`🔍 CRITÈRE 4: Longueurs suspectes - nom:${mrzData.nom.length}, prénom:${mrzData.prenom.length}`);
  }
  
  // CRITÈRE 5: Format texte principal standard = référence fiable
  const textDataSeemsCobsistent = (
    textData.nom && textData.prenom &&
    textData.nom.length >= 2 && textData.prenom.length >= 2 &&
    !commonFirstNames.includes(textData.nom.toUpperCase()) &&
    commonFirstNames.includes(textData.prenom.toUpperCase())
  );
  
  if (textDataSeemsCobsistent && mrzInversedVsText) {
    analysis.confidence += 20;
    analysis.reasons.push("Texte principal semble cohérent, MRZ probablement inversée");
    console.log("🔍 CRITÈRE 5: Texte principal plus fiable que MRZ");
  }
  
  // DÉCISION FINALE
  analysis.isInverted = analysis.confidence >= 50;
  
  if (analysis.isInverted) {
    analysis.correctedData = {
      nom: mrzData.prenom || textData.nom || '',
      prenom: mrzData.nom || textData.prenom || ''
    };
    
    console.log("🔄 INVERSION DÉTECTÉE! Correction appliquée:");
    console.log(`   Avant: nom="${mrzData.nom}", prénom="${mrzData.prenom}"`);
    console.log(`   Après: nom="${analysis.correctedData.nom}", prénom="${analysis.correctedData.prenom}"`);
  } else {
    console.log("✅ Pas d'inversion détectée");
  }
  
  console.log(`📊 Confiance: ${analysis.confidence}%`);
  console.log(`📋 Raisons: ${analysis.reasons.join(', ')}`);
  console.log("🔍 === FIN DÉTECTION INVERSION ===");
  
  return analysis;
};

/**
 * Variante simplifiée pour détecter l'inversion sur une seule source de données
 */
export const detectNameInversionSingle = (data: PassportEtrangerData): boolean => {
  if (!data.nom || !data.prenom) return false;
  
  const commonFirstNames = ['AHMED', 'MOHAMED', 'MARIE', 'JEAN', 'ANTONIO', 'MARIA', 'AKEF', 'LISA'];
  const commonSurnames = ['SMITH', 'MARTIN', 'GARCIA', 'ROSSI', 'MÜLLER'];
  
  // Si le "nom" ressemble à un prénom ET le "prénom" à un nom
  const nomIsFirstName = commonFirstNames.includes(data.nom.toUpperCase());
  const prenomIsSurname = commonSurnames.includes(data.prenom.toUpperCase());
  
  return nomIsFirstName && prenomIsSurname;
}; 