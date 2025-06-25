import { normalizeNationality } from "./nationalityNormalizer";

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
        /\b([A-Z0-9]{10,15})\b/g, // Pattern générique pour numéros longs
        /\b(\d{10,12})\b/g,       // Pattern numérique long
        /\b([A-Z]{2}\d{8,10})\b/g // Pattern lettres + chiffres
      ];
      
      for (const pattern of numeroPatterns) {
        const matches = Array.from(line.matchAll(pattern));
        for (const match of matches) {
          if (match && match[1] && match[1].length >= 8) {
            carteData.numero_carte = match[1];
            console.log("✅ Numéro carte trouvé:", carteData.numero_carte);
            break;
          }
        }
        if (carteData.numero_carte) break;
      }
    }

    // Nom de famille - patterns améliorés
    if (!carteData.nom) {
      console.log("👤 Recherche du nom...");
      
      const nomPatterns = [
        /(?:NOM|SURNAME|FAMILY\s*NAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:FAMILLE)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:1\.\s*)?(?:NOM|SURNAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i
      ];
      
      for (const pattern of nomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          carteData.nom = match[1].trim();
          console.log("✅ Nom trouvé:", carteData.nom);
          break;
        }
      }
      
      // Pattern alternatif: recherche de mots isolés potentiels - SUPPORT ACCENTS
      if (!carteData.nom && /^[A-ZÀ-ÿ\s\-]{3,20}$/i.test(line.trim()) && 
          !['CARTE', 'SEJOUR', 'TITRE', 'RESIDENCE', 'FRANCE'].includes(line.trim().toUpperCase())) {
        carteData.nom = line.trim();
        console.log("✅ Nom trouvé (pattern isolé avec accents):", carteData.nom);
      }
    }

    // Prénom - patterns améliorés
    if (!carteData.prenom) {
      console.log("👤 Recherche du prénom...");
      
      const prenomPatterns = [
        /(?:PRENOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:PRENOMS)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i,
        /(?:2\.\s*)?(?:PRENOM|GIVEN)\s*:?\s*([A-ZÀ-ÿ\s\-]{2,30})/i
      ];
      
      for (const pattern of prenomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          carteData.prenom = match[1].trim();
          console.log("✅ Prénom trouvé:", carteData.prenom);
          break;
        }
      }
      
      // Pattern alternatif si on a déjà le nom - SUPPORT ACCENTS
      if (!carteData.prenom && carteData.nom && /^[A-ZÀ-ÿ\s\-]{2,20}$/i.test(line.trim()) && 
          line.trim().toUpperCase() !== carteData.nom.toUpperCase() && 
          !['CARTE', 'SEJOUR', 'TITRE', 'RESIDENCE', 'FRANCE'].includes(line.trim().toUpperCase())) {
        carteData.prenom = line.trim();
        console.log("✅ Prénom trouvé (pattern isolé avec accents):", carteData.prenom);
      }
    }

    // Nationalité - patterns améliorés
    if (!carteData.nationalite) {
      console.log("🌍 Recherche de la nationalité...");
      
      const nationalitePatterns = [
        /(?:NATIONALITE|NATIONALITY)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:PAYS\s*D.ORIGINE|COUNTRY)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:3\.\s*)?(?:NATIONALITE)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:CITIZEN\s*OF)\s*:?\s*([A-ZÀ-ÿ\s\/]{3,30})/i
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
    'SURNAME', 'FAMILY', 'FIRST', 'PRENOM', 'NOM'
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
