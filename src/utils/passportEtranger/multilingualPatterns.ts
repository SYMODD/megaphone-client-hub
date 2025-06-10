
// Patterns multilingues pour l'extraction des noms et prénoms
export const NAME_KEYWORDS = {
  surname: [
    // Anglais
    'SURNAME', 'FAMILY NAME', 'LAST NAME',
    // Allemand
    'FAMILIENNAME', 'NACHNAME', 'NAME',
    // Français
    'NOM', 'NOM DE FAMILLE',
    // Espagnol
    'APELLIDOS', 'APELLIDO',
    // Italien
    'COGNOME',
    // Portugais
    'APELIDO', 'SOBRENOME',
    // Néerlandais
    'ACHTERNAAM', 'FAMILIENAAM'
  ],
  givenName: [
    // Anglais
    'GIVEN NAMES', 'GIVEN NAME', 'FIRST NAME', 'FORENAME',
    // Allemand
    'VORNAME', 'VORNAMEN', 'RUFNAME',
    // Français
    'PRENOM', 'PRENOMS',
    // Espagnol
    'NOMBRE', 'NOMBRES',
    // Italien
    'NOME', 'NOMI',
    // Portugais
    'NOME PROPRIO', 'PRIMEIRO NOME',
    // Néerlandais
    'VOORNAAM', 'VOORNAMEN'
  ]
};

export const NATIONALITY_KEYWORDS = [
  // Anglais
  'NATIONALITY', 'CITIZEN OF',
  // Allemand
  'STAATSANGEHÖRIGKEIT', 'STAATSANGEHORIGKEIT', 'NATIONALITÄT',
  // Français
  'NATIONALITÉ', 'NATIONALITE',
  // Espagnol
  'NACIONALIDAD',
  // Italien
  'NAZIONALITÀ', 'NAZIONALITA',
  // Portugais
  'NACIONALIDADE',
  // Néerlandais
  'NATIONALITEIT'
];

// Patterns pour détecter différents formats de passeports
export const PASSPORT_FORMAT_PATTERNS = {
  // Format avec numérotation (ex: "1. NOM", "2. PRENOM")
  numberedField: /^(\d+)\.\s*(.+)/,
  
  // Format avec deux points (ex: "NOM: DUPONT")
  colonFormat: /^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŠŽČĆĐ\s]+):\s*(.+)/,
  
  // Format avec tirets ou séparateurs
  separatorFormat: /^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŠŽČĆĐ\s]+)\s*[-|]\s*(.+)/,
  
  // Format allemand avec noms isolés
  germanIsolatedName: /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸŠŽČĆĐ]{2,20}$/
};

// Fonction pour détecter le format du passeport
export const detectPassportFormat = (lines: string[]): string => {
  let formatScores = {
    numbered: 0,
    colon: 0,
    separator: 0,
    german: 0,
    standard: 0
  };

  lines.forEach(line => {
    if (PASSPORT_FORMAT_PATTERNS.numberedField.test(line)) {
      formatScores.numbered++;
    }
    if (PASSPORT_FORMAT_PATTERNS.colonFormat.test(line)) {
      formatScores.colon++;
    }
    if (PASSPORT_FORMAT_PATTERNS.separatorFormat.test(line)) {
      formatScores.separator++;
    }
    if (PASSPORT_FORMAT_PATTERNS.germanIsolatedName.test(line)) {
      formatScores.german++;
    }
  });

  // Retourner le format avec le score le plus élevé
  const maxScore = Math.max(...Object.values(formatScores));
  const detectedFormat = Object.keys(formatScores).find(
    key => formatScores[key as keyof typeof formatScores] === maxScore
  ) || 'standard';

  console.log("Format de passeport détecté:", detectedFormat, "scores:", formatScores);
  return detectedFormat;
};
