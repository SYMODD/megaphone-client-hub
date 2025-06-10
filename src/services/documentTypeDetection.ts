
export interface DocumentDetectionResult {
  detectedType: 'passeport_etranger' | 'carte_sejour' | 'unknown';
  confidence: number;
  reasons: string[];
}

export const detectDocumentType = (text: string): DocumentDetectionResult => {
  const normalizedText = text.toUpperCase();
  const lines = normalizedText.split('\n').map(line => line.trim());
  
  let passportScore = 0;
  let carteSejourScore = 0;
  const reasons: string[] = [];

  // Indicateurs de passeport étranger (améliorés)
  const passportIndicators = [
    { pattern: /PASSPORT|PASAPORTE|PASSEPORT/i, score: 35, reason: "Mot 'PASSPORT' détecté" },
    { pattern: /P</i, score: 30, reason: "Code MRZ 'P<' détecté" },
    { pattern: /^[A-Z0-9<]{44}$/m, score: 25, reason: "Ligne MRZ de passeport détectée" },
    { pattern: /REPUBLIC|REPUBLICA|RÉPUBLIQUE/i, score: 20, reason: "Mot 'REPUBLIC' détecté" },
    { pattern: /FEDERAL|KINGDOM|REINO/i, score: 20, reason: "Mot institutionnel détecté" },
    { pattern: /NATIONALITY|NACIONALIDAD|NATIONALITÉ/i, score: 15, reason: "Champ 'NATIONALITY' détecté" },
    { pattern: /DATE OF BIRTH|FECHA NAC|DATE NAISSANCE/i, score: 15, reason: "Champ date de naissance détecté" },
    { pattern: /PLACE OF BIRTH|LUGAR NAC|LIEU NAISSANCE/i, score: 15, reason: "Champ lieu de naissance détecté" },
    { pattern: /GIVEN NAMES?|NOMBRES|PRENOMS/i, score: 15, reason: "Champ 'GIVEN NAMES' détecté" },
    { pattern: /SURNAME|APELLIDOS|NOM DE FAMILLE/i, score: 15, reason: "Champ 'SURNAME' détecté" },
    { pattern: /ISSUING.*AUTHORITY|AUTORITE|AUTORIDAD/i, score: 10, reason: "Autorité émettrice détectée" },
  ];

  // Indicateurs de carte de séjour (améliorés)
  const carteSejourIndicators = [
    { pattern: /CARTE.*SEJOUR|TITRE.*SEJOUR/i, score: 40, reason: "Expression 'CARTE DE SÉJOUR' détectée" },
    { pattern: /RESIDENCE.*PERMIT|PERMIS.*RESIDENCE/i, score: 35, reason: "Expression 'RESIDENCE PERMIT' détectée" },
    { pattern: /SÉJOUR|SEJOUR/i, score: 30, reason: "Mot 'SÉJOUR' détecté" },
    { pattern: /AUTORISATION.*SEJOUR/i, score: 30, reason: "Expression 'AUTORISATION DE SÉJOUR' détectée" },
    { pattern: /VALABLE.*JUSQU|VALID.*UNTIL/i, score: 25, reason: "Expression de validité détectée" },
    { pattern: /PRÉFECTURE|PREFECTURE/i, score: 20, reason: "Mot 'PRÉFECTURE' détecté" },
    { pattern: /AUTORISE.*TRAVAIL|WORK.*PERMIT/i, score: 20, reason: "Autorisation de travail détectée" },
    { pattern: /CARTE.*IDENTITE.*ETRANGER/i, score: 25, reason: "Carte d'identité étranger détectée" },
    { pattern: /TITRE.*IDENTITE/i, score: 20, reason: "Titre d'identité détecté" },
    { pattern: /NÉE.*LE|NEE.*LE/i, score: 15, reason: "Expression 'NÉE LE' détectée" },
    { pattern: /NATIONALITÉ|NATIONALITE/i, score: 10, reason: "Champ nationalité français détecté" },
    { pattern: /MINISTRE.*INTERIEUR/i, score: 15, reason: "Référence ministère intérieur détectée" },
  ];

  // Calcul du score pour les passeports
  passportIndicators.forEach(indicator => {
    if (indicator.pattern.test(normalizedText)) {
      passportScore += indicator.score;
      reasons.push(`+${indicator.score} (Passeport): ${indicator.reason}`);
    }
  });

  // Calcul du score pour les cartes de séjour
  carteSejourIndicators.forEach(indicator => {
    if (indicator.pattern.test(normalizedText)) {
      carteSejourScore += indicator.score;
      reasons.push(`+${indicator.score} (Carte de séjour): ${indicator.reason}`);
    }
  });

  // Vérifications spéciales pour les lignes MRZ (favorise les passeports)
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  if (mrzLines.length > 0) {
    passportScore += 25;
    reasons.push("+25 (Passeport): Lignes MRZ détectées");
  }

  // Patterns qui excluent certains types
  if (/MINISTERE|PREFECTURE|REPUBLIQUE.*FRANCAISE/i.test(normalizedText)) {
    carteSejourScore += 15;
    reasons.push("+15 (Carte de séjour): Document administratif français détecté");
  }

  // Déterminer le type de document avec seuil minimum
  let detectedType: 'passeport_etranger' | 'carte_sejour' | 'unknown';
  let confidence: number;

  const totalScore = passportScore + carteSejourScore;
  
  if (passportScore > carteSejourScore && passportScore >= 20) {
    detectedType = 'passeport_etranger';
    confidence = Math.min(95, totalScore > 0 ? (passportScore / totalScore) * 100 : 0);
  } else if (carteSejourScore > passportScore && carteSejourScore >= 20) {
    detectedType = 'carte_sejour';
    confidence = Math.min(95, totalScore > 0 ? (carteSejourScore / totalScore) * 100 : 0);
  } else {
    detectedType = 'unknown';
    confidence = 0;
  }

  console.log('Document detection analysis:', {
    passportScore,
    carteSejourScore,
    totalScore,
    detectedType,
    confidence,
    reasons
  });

  return {
    detectedType,
    confidence,
    reasons
  };
};
