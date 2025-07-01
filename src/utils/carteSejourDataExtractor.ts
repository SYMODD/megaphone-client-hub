import { normalizeNationality } from "./nationalityNormalizer";

/**
 * 🔧 CORRECTION OCR SPÉCIFIQUE POUR CARTES D'IDENTITÉ ÉTRANGÈRES
 * Corrige les erreurs OCR communes dans les noms (surtout roumains)
 */
function correctOCRErrorsForNames(text: string): string {
  if (!text) return text;
  
  return text
    // Corrections OCR spécifiques pour noms roumains
    .replace(/^Ahda/i, 'ANDA')          // Ahda-greta → ANDA-GRETA
    .replace(/^ahda/i, 'ANDA')          // ahda-greta → ANDA-GRETA  
    .replace(/h([a-z])/g, 'N$1')        // h → N (Ahda → ANda)
    .replace(/^0/g, 'D')                // 0AVID → DAVID (début de ligne)
    .replace(/\b0([A-Z])/g, 'D$1')      // 0AVID → DAVID (début de mot)
    .replace(/([A-Z])0([A-Z])/g, '$1D$2') // A0VID → ADVID → DAVID
    // Corrections générales chiffres → lettres en début/milieu de noms
    .replace(/\b1([a-z])/gi, 'I$1')     // 1sabelle → Isabelle
    .replace(/\b5([a-z])/gi, 'S$1')     // 5tephane → Stephane  
    .replace(/([a-z])1([a-z])/gi, '$1I$2') // Mar1e → Marie
    .replace(/([a-z])5([a-z])/gi, '$1S$2') // Cri5tian → Cristian
    .replace(/([a-z])0([a-z])/gi, '$1O$2') // Nic0las → Nicolas
    .toUpperCase()
    .trim();
}

/**
 * 🔧 CORRECTION OCR SPÉCIFIQUE POUR NUMÉROS DE DOCUMENTS
 * Corrige les erreurs OCR communes dans les numéros (format roumain)
 */
function correctOCRErrorsForDocumentNumber(text: string): string {
  if (!text) return text;
  
  // Si c'est un numéro purement numérique (13 chiffres), corrections OCR simples
  if (/^\d{12,14}$/.test(text)) {
    return text
      .replace(/O/g, '0')  // O → 0
      .replace(/I/g, '1')  // I → 1  
      .replace(/S/g, '5')  // S → 5
      .replace(/B/g, '8')  // B → 8
      .replace(/G/g, '6')  // G → 6
      .trim();
  }
  
  // Pour les formats avec lettres (061200544R0)
  return text
    // Corrections OCR pour numéros de documents roumains
    .replace(/(\d{8,9})0(\d{1,2})$/g, '$1R$2')  // 061200544*0* → 061200544*R*0 (fin)
    .replace(/(\d{8,9})O(\d{1,2})$/g, '$1R$2')  // 061200544*O*0 → 061200544*R*0 (O→R)
    .replace(/(\d{8,9})8(\d{1,2})$/g, '$1R$2')  // 061200544*8*0 → 061200544*R*0 (8→R)
    .replace(/(\d{8,9})P(\d{1,2})$/g, '$1R$2')  // 061200544*P*0 → 061200544*R*0 (P→R)
    // Corrections générales OCR
    .replace(/O/g, '0')  // O → 0
    .replace(/I/g, '1')  // I → 1  
    .replace(/S/g, '5')  // S → 5
    .replace(/B/g, '8')  // B → 8
    .replace(/G/g, '6')  // G → 6
    .toUpperCase()
    .trim();
}

export interface CarteSejourData {
  nom?: string;
  prenom?: string;
  nationalite?: string;
  numero_carte?: string;
  date_naissance?: string;
  date_expiration?: string;
}

export const extractCarteSejourData = (text: string): CarteSejourData => {
  console.log("🏛️ Extraction données carte de séjour depuis texte:", text.substring(0, 300) + "...");
  console.log("📏 Longueur du texte:", text.length);
  console.log("📝 TEXTE COMPLET OCR:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("📝 Lignes détectées:", lines.length);
  console.log("📋 Toutes les lignes:", lines);
  
  const carteData: CarteSejourData = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();
    console.log(`🔍 Analyse ligne ${i+1}:`, line);
    
    // Numéro de carte (patterns français améliorés)
    if (!carteData.numero_carte) {
      console.log("🔢 Recherche du numéro de carte...");
      
      const numeroPatterns = [
        /(?:N°|NUM|NUMERO|CARD\s*NO)\s*:?\s*([A-Z0-9]{8,15})/i,
        /(?:CARTE\s*N°|TITRE\s*N°)\s*:?\s*([A-Z0-9]{8,15})/i,
        // 🆕 PATTERNS SPÉCIFIQUES CARTES D'IDENTITÉ ROUMAINES
        /\b(\d{13})\b/g,              // Format roumain principal: 6031009303967 (13 chiffres)
        /\b(\d{12,14})\b/g,           // Format roumain étendu (12-14 chiffres)
        /\b(\d{9}[A-Z]\d{1})\b/g,     // Format roumain alternatif: 061200544R0 (9chiffres + lettre + 1chiffre)
        /\b(\d{9}[A-Z0-9]\d{1})\b/g,  // Format roumain étendu avec erreurs OCR possible
        /\b(\d{8,10}[RO0]\d{1,2})\b/g, // Format roumain avec corrections OCR R→0, O→0
        /\b([A-Z0-9]{10,15})\b/g,     // Pattern générique pour numéros longs
        /\b(\d{10,11})\b/g,           // Pattern numérique moyen (éviter dates)
        /\b([A-Z]{2}\d{8,10})\b/g     // Pattern lettres + chiffres (belge, etc.)
      ];
      
      for (const pattern of numeroPatterns) {
        const matches = Array.from(line.matchAll(pattern));
        for (const match of matches) {
          if (match && match[1] && match[1].length >= 8) {
            const correctedNumero = correctOCRErrorsForDocumentNumber(match[1]);
            carteData.numero_carte = correctedNumero;
            console.log("✅ Numéro carte trouvé et corrigé:", match[1], "→", carteData.numero_carte);
            break;
          }
        }
        if (carteData.numero_carte) break;
      }
      
      // 🆕 RECHERCHE SPÉCIALE POUR NUMÉROS ROUMAINS ISOLÉS
      if (!carteData.numero_carte && (
          /^\d{13}$/i.test(line.trim()) ||                        // Format principal: 6031009303967
          /^\d{12,14}$/i.test(line.trim()) ||                     // Format étendu 12-14 chiffres  
          /^\d{9}[A-Z0-9RO0P8]\d{1,2}$/i.test(line.trim())       // Format alternatif: 061200544R0
        )) {
        console.log("🇷🇴 Pattern numéro roumain isolé détecté:", line.trim());
        const correctedNumero = correctOCRErrorsForDocumentNumber(line.trim());
        carteData.numero_carte = correctedNumero;
        console.log("✅ Numéro carte roumain extrait et corrigé:", line.trim(), "→", carteData.numero_carte);
      }
    }

    // Nom de famille - patterns améliorés
    if (!carteData.nom) {
      console.log("👤 Recherche du nom...");
      
      const nomPatterns = [
        /(?:NOM|SURNAME|FAMILY\s*NAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:FAMILLE)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:1\.\s*)?(?:NOM|SURNAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        // 🆕 PATTERNS POUR CARTES D'IDENTITÉ ROUMAINES
        /(?:NUME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,        // Roumain "NUME" = Nom
        /(?:FAMILIA)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i      // Roumain "FAMILIA" = Famille
      ];
      
      for (const pattern of nomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          const correctedNom = correctOCRErrorsForNames(match[1].trim());
          carteData.nom = correctedNom;
          console.log("✅ Nom trouvé et corrigé:", match[1].trim(), "→", carteData.nom);
          break;
        }
      }
      
      // Pattern alternatif: recherche de mots isolés potentiels - SUPPORT ACCENTS
      if (!carteData.nom && /^[A-ZÀ-ÿ\s\-]{3,20}$/i.test(line.trim()) && 
          !['CARTE', 'SEJOUR', 'TITRE', 'RESIDENCE', 'FRANCE', 'IDENTITY', 'IDENTITATE', 'ROMÂNĂ', 'ROMANIA'].includes(line.trim().toUpperCase())) {
        const correctedNom = correctOCRErrorsForNames(line.trim());
        carteData.nom = correctedNom;
        console.log("✅ Nom trouvé (pattern isolé avec accents) et corrigé:", line.trim(), "→", carteData.nom);
      }
    }

    // Prénom - patterns améliorés
    if (!carteData.prenom) {
      console.log("👤 Recherche du prénom...");
      
      const prenomPatterns = [
        /(?:PRENOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:PRENOMS)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:2\.\s*)?(?:PRENOM|GIVEN)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        // 🆕 PATTERNS POUR CARTES D'IDENTITÉ ROUMAINES
        /(?:PRENUME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i      // Roumain "PRENUME" = Prénom
      ];
      
      for (const pattern of prenomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          const correctedPrenom = correctOCRErrorsForNames(match[1].trim());
          carteData.prenom = correctedPrenom;
          console.log("✅ Prénom trouvé et corrigé:", match[1].trim(), "→", carteData.prenom);
          break;
        }
      }
      
      // Pattern alternatif si on a déjà le nom - SUPPORT ACCENTS
      if (!carteData.prenom && carteData.nom && /^[A-ZÀ-ÿ\s\-]{2,20}$/i.test(line.trim()) && 
          line.trim().toUpperCase() !== carteData.nom.toUpperCase() && 
          !['CARTE', 'SEJOUR', 'TITRE', 'RESIDENCE', 'FRANCE', 'IDENTITY', 'IDENTITATE', 'ROMÂNĂ', 'ROMANIA'].includes(line.trim().toUpperCase())) {
        const correctedPrenom = correctOCRErrorsForNames(line.trim());
        carteData.prenom = correctedPrenom;
        console.log("✅ Prénom trouvé (pattern isolé avec accents) et corrigé:", line.trim(), "→", carteData.prenom);
      }
    }

    // Nationalité - patterns améliorés
    if (!carteData.nationalite) {
      console.log("🌍 Recherche de la nationalité...");
      
      const nationalitePatterns = [
        /(?:NATIONALITE|NATIONALITY)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:PAYS\s*D.ORIGINE|COUNTRY)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:3\.\s*)?(?:NATIONALITE)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:CITIZEN\s*OF)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        // 🆕 DÉTECTION DIRECTE NATIONALITÉS ISOLÉES (cartes d'identité étrangères)
        /\b(ROMÂNĂ|ROMANA|FRANÇAISE|FRANCAISE|ITALIANA|DEUTSCHE|PORTUGUESA|ESPAÑOLA|ESPANOLA)\b/i
      ];
      
      for (const pattern of nationalitePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const rawNationality = match[1].trim();
          if (rawNationality.length >= 3) {
            carteData.nationalite = normalizeNationality(rawNationality);
            console.log("✅ Nationalité trouvée:", carteData.nationalite);
            break;
          }
        }
        // 🆕 GESTION SPÉCIALE POUR PATTERNS DIRECTS (ROMÂNĂ, FRANÇAISE, etc.)
        else if (pattern.source.includes('ROMÂNĂ')) {
          const directMatch = line.match(pattern);
          if (directMatch && directMatch[1]) {
            console.log("🇷🇴 Pattern direct ROMÂNĂ détecté:", directMatch[1]);
            carteData.nationalite = normalizeNationality(directMatch[1]);
            console.log("✅ Nationalité extraite (pattern direct carte identité):", carteData.nationalite);
            break;
          }
        }
      }
    }

    // Date de naissance - patterns améliorés
    if (!carteData.date_naissance) {
      console.log("📅 Recherche de la date de naissance...");
      
      const dateNaissancePatterns = [
        /(?:NEE?\s*LE|BORN\s*ON|DATE\s*OF\s*BIRTH)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:NAISSANCE)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:4\.\s*)?(?:DATE\s*OF\s*BIRTH)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})\b/g
      ];
      
      for (const pattern of dateNaissancePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          carteData.date_naissance = match[1];
          console.log("✅ Date naissance trouvée:", carteData.date_naissance);
          break;
        }
      }
    }

    // Date d'expiration - patterns améliorés
    if (!carteData.date_expiration) {
      console.log("📅 Recherche de la date d'expiration...");
      
      const dateExpirationPatterns = [
        /(?:VALID\s*UNTIL|EXPIRE|JUSQU.AU|EXPIRES)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:EXPIRATION|VALIDITE)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:5\.\s*)?(?:VALID\s*UNTIL)\s*:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i
      ];
      
      for (const pattern of dateExpirationPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          carteData.date_expiration = match[1];
          console.log("✅ Date expiration trouvée:", carteData.date_expiration);
          break;
        }
      }
    }
  }

  console.log("📋 === RÉSULTAT FINAL EXTRACTION CARTE SÉJOUR ===");
  const extractedFields = {
    nom: carteData.nom || "NON TROUVÉ",
    prenom: carteData.prenom || "NON TROUVÉ",
    nationalite: carteData.nationalite || "NON TROUVÉ",
    numero_carte: carteData.numero_carte || "NON TROUVÉ",
    date_naissance: carteData.date_naissance || "NON TROUVÉ",
    date_expiration: carteData.date_expiration || "NON TROUVÉ"
  };
  
  console.log("📋 Données extraites:", extractedFields);
  
  // Compter les champs extraits avec succès
  const successfulFields = Object.values(extractedFields).filter(value => 
    value && value !== "NON TROUVÉ"
  ).length;
  
  console.log(`📊 Champs extraits avec succès: ${successfulFields}/6`);
  console.log(`📈 Taux de réussite: ${Math.round((successfulFields/6)*100)}%`);
  
  return carteData;
};

function isValidName(name: string): boolean {
  if (!name || name.length < 2) {
    console.log("❌ Nom invalide (trop court):", name);
    return false;
  }
  
  // Exclure les mots génériques
  const excludedWords = [
    'CARTE', 'SEJOUR', 'TITRE', 'RESIDENCE', 'PERMIT', 'FRANCE', 'REPUBLIC',
    'VALID', 'UNTIL', 'DATE', 'BIRTH', 'NATIONALITY', 'GIVEN', 'NAME',
    'SURNAME', 'FAMILY', 'FIRST', 'PRENOM', 'NOM',
    // 🆕 MOTS ROUMAINS À EXCLURE
    'IDENTITATE', 'BULETIN', 'ROMÂNIA', 'ROMANIA', 'ROMÂNĂ', 'ROMANA',
    'NUME', 'PRENUME', 'FAMILIA', 'CETĂŢEAN', 'CETATEAN'
  ];
  
  const nameUpper = name.toUpperCase().trim();
  const hasExcludedWord = excludedWords.some(word => nameUpper.includes(word));
  
  if (hasExcludedWord) {
    console.log("❌ Nom invalide (mot exclu):", name);
    return false;
  }
  
  // Doit contenir principalement des lettres (SUPPORT ACCENTS)
  const letterCount = (name.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const isValid = letterCount >= name.length * 0.7;
  
  console.log(`${isValid ? '✅' : '❌'} Validation nom "${name}": ${letterCount}/${name.length} lettres`);
  return isValid;
}
