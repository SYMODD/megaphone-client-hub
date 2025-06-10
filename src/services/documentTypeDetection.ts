
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

  // Indicateurs de passeport étranger
  const passportIndicators = [
    { pattern: /PASSPORT/i, score: 30, reason: "Mot 'PASSPORT' détecté" },
    { pattern: /P</i, score: 25, reason: "Code MRZ 'P<' détecté" },
    { pattern: /^[A-Z0-9<]{44}$/m, score: 20, reason: "Ligne MRZ de passeport détectée" },
    { pattern: /REPUBLIC/i, score: 15, reason: "Mot 'REPUBLIC' détecté" },
    { pattern: /FEDERAL/i, score: 15, reason: "Mot 'FEDERAL' détecté" },
    { pattern: /KINGDOM/i, score: 15, reason: "Mot 'KINGDOM' détecté" },
    { pattern: /NATIONALITY/i, score: 10, reason: "Mot 'NATIONALITY' détecté" },
    { pattern: /DATE OF BIRTH/i, score: 10, reason: "Expression 'DATE OF BIRTH' détectée" },
    { pattern: /PLACE OF BIRTH/i, score: 10, reason: "Expression 'PLACE OF BIRTH' détectée" },
    { pattern: /GIVEN NAMES/i, score: 10, reason: "Expression 'GIVEN NAMES' détectée" },
    { pattern: /SURNAME/i, score: 10, reason: "Mot 'SURNAME' détecté" }
  ];

  // Indicateurs de carte de séjour
  const carteSejourIndicators = [
    { pattern: /CARTE.*SEJOUR/i, score: 35, reason: "Expression 'CARTE DE SÉJOUR' détectée" },
    { pattern: /TITRE.*SEJOUR/i, score: 35, reason: "Expression 'TITRE DE SÉJOUR' détectée" },
    { pattern: /RESIDENCE.*PERMIT/i, score: 30, reason: "Expression 'RESIDENCE PERMIT' détectée" },
    { pattern: /SÉJOUR/i, score: 25, reason: "Mot 'SÉJOUR' détecté" },
    { pattern: /AUTORISATION.*SEJOUR/i, score: 25, reason: "Expression 'AUTORISATION DE SÉJOUR' détectée" },
    { pattern: /VALABLE.*JUSQU/i, score: 20, reason: "Expression 'VALABLE JUSQU'AU' détectée" },
    { pattern: /PRÉFECTURE/i, score: 15, reason: "Mot 'PRÉFECTURE' détecté" },
    { pattern: /AUTORISE.*TRAVAIL/i, score: 15, reason: "Expression liée au travail détectée" },
    { pattern: /NÉE.*LE/i, score: 10, reason: "Expression 'NÉE LE' détectée" },
    { pattern: /NATIONALITÉ/i, score: 10, reason: "Mot 'NATIONALITÉ' détecté" }
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

  // Vérifications spéciales pour les lignes MRZ
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  if (mrzLines.length > 0) {
    passportScore += 20;
    reasons.push("+20 (Passeport): Lignes MRZ détectées");
  }

  // Déterminer le type de document
  let detectedType: 'passeport_etranger' | 'carte_sejour' | 'unknown';
  let confidence: number;

  if (passportScore > carteSejourScore && passportScore >= 25) {
    detectedType = 'passeport_etranger';
    confidence = Math.min(95, (passportScore / (passportScore + carteSejourScore)) * 100);
  } else if (carteSejourScore > passportScore && carteSejourScore >= 25) {
    detectedType = 'carte_sejour';
    confidence = Math.min(95, (carteSejourScore / (passportScore + carteSejourScore)) * 100);
  } else {
    detectedType = 'unknown';
    confidence = 0;
  }

  console.log('Document detection analysis:', {
    passportScore,
    carteSejourScore,
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
