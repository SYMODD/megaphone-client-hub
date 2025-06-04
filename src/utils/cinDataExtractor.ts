
import { CINData } from "@/types/cinTypes";

export const extractCINData = (text: string): CINData => {
  console.log("🔍 EXTRACTION CIN - Texte OCR reçu:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("📝 Lignes de texte:", lines);
  
  const cinData: CINData = {
    nationalite: "Maroc"
  };

  const fullTextUpper = text.toUpperCase();
  
  // 1. EXTRACTION DU NOM ET PRÉNOM - Patterns spécifiques à la CIN marocaine
  console.log("🔤 Recherche nom et prénom...");
  
  // Recherche de patterns pour CIN marocaine
  const nomPatterns = [
    /(?:NOM|SURNAME|FAMILY\s*NAME)\s*:?\s*([A-Z][A-Z\s]{1,30})/gi,
    /EL\s+([A-Z]{2,20})/gi, // Patterns comme "EL ALAMI"
    /([A-Z]{2,20})\s+([A-Z]{2,20})\s*$/gm, // Deux mots consécutifs en majuscules
  ];
  
  const prenomPatterns = [
    /(?:PRENOM|PRÉNOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-Z][A-Z\s]{1,30})/gi,
    /([A-Z]{2,20})\s*(?=\d{8,10})/gi, // Prénom suivi d'un numéro CIN
  ];

  // Extraction du nom - essayer différents patterns
  for (const pattern of nomPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const nom = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (nom.length >= 2 && nom.length <= 30 && 
            !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO'].includes(nom)) {
          cinData.nom = nom;
          console.log("✅ Nom trouvé:", nom);
          break;
        }
      }
    }
    if (cinData.nom) break;
  }

  // Extraction du prénom
  for (const pattern of prenomPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const prenom = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (prenom.length >= 2 && prenom.length <= 30 && 
            prenom !== cinData.nom && 
            !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO'].includes(prenom)) {
          cinData.prenom = prenom;
          console.log("✅ Prénom trouvé:", prenom);
          break;
        }
      }
    }
    if (cinData.prenom) break;
  }

  // Si pas trouvé avec patterns, analyser les lignes pour nom/prénom
  if (!cinData.nom || !cinData.prenom) {
    console.log("🔍 Analyse alternative des lignes...");
    const candidateNames = [];
    
    for (const line of lines) {
      const cleanLine = line.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
      
      // Filtrer les mots valides pour nom/prénom
      if (cleanLine.length >= 2 && cleanLine.length <= 30 && 
          !cleanLine.match(/\d/) && // Pas de chiffres
          !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO', 'DU', 'DE', 'LA', 'LE'].includes(cleanLine) &&
          /^[A-Z\s]+$/.test(cleanLine)) {
        candidateNames.push(cleanLine);
      }
    }
    
    console.log("👥 Candidats noms détectés:", candidateNames);
    
    // Assigner les premiers candidats valides
    if (candidateNames.length >= 1 && !cinData.nom) {
      cinData.nom = candidateNames[0];
      console.log("✅ Nom alternatif:", candidateNames[0]);
    }
    if (candidateNames.length >= 2 && !cinData.prenom) {
      cinData.prenom = candidateNames[1];
      console.log("✅ Prénom alternatif:", candidateNames[1]);
    }
  }

  // 2. EXTRACTION DU NUMÉRO CIN - Patterns pour CIN marocaine
  console.log("🔢 Recherche numéro CIN...");
  
  const cinPatterns = [
    /(?:CIN|N[°O])\s*:?\s*([A-Z]{0,3}\d{6,10})/gi,
    /([A-Z]{1,3}\d{6,10})/g, // Format CIN marocaine
    /(\d{8,10})/g, // Numéros longs sans lettres
    /([A-Z]\d{7,9})/g, // Une lettre suivie de chiffres
  ];

  for (const pattern of cinPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const cleanMatch = match[1].replace(/[^A-Z0-9]/g, '');
        // Validation pour format CIN marocaine
        if (cleanMatch.length >= 6 && cleanMatch.length <= 12 && 
            cleanMatch.match(/\d{6,}/)) { // Au moins 6 chiffres
          cinData.numero_cin = cleanMatch;
          console.log("✅ Numéro CIN trouvé:", cleanMatch);
          break;
        }
      }
    }
    if (cinData.numero_cin) break;
  }

  // 3. EXTRACTION DE LA DATE DE NAISSANCE
  console.log("📅 Recherche date de naissance...");
  
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g, // Format année/mois/jour
    /(?:NE|BORN|NAISSANCE)\s*(?:LE)?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      let day, month, year;
      
      if (match[0].includes(match[3]) && match[3].length === 4) {
        // Format dd/mm/yyyy
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3];
      } else if (match[1].length === 4) {
        // Format yyyy/mm/dd
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      }
      
      // Validation de la date
      if (day && month && year &&
          parseInt(day) >= 1 && parseInt(day) <= 31 && 
          parseInt(month) >= 1 && parseInt(month) <= 12 && 
          parseInt(year) >= 1900 && parseInt(year) <= 2024) {
        cinData.date_naissance = `${day}/${month}/${year}`;
        console.log("✅ Date de naissance trouvée:", cinData.date_naissance);
        break;
      }
    }
    if (cinData.date_naissance) break;
  }

  // 4. EXTRACTION DU LIEU DE NAISSANCE
  console.log("📍 Recherche lieu de naissance...");
  
  const lieuPatterns = [
    /(?:NE|BORN)\s*A\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    /(?:LIEU|PLACE)\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    // Villes marocaines courantes
    /(AGADIR|CASABLANCA|RABAT|FES|FEZ|MARRAKECH|TANGER|MEKNES|OUJDA|KENITRA|TETOUAN|SALE|MOHAMMEDIA|BENI\s*MELLAL|EL\s*JADIDA)/gi,
  ];

  for (const pattern of lieuPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const lieu = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (lieu.length >= 3 && lieu.length <= 50) {
          cinData.lieu_naissance = lieu;
          console.log("✅ Lieu de naissance trouvé:", lieu);
          break;
        }
      }
    }
    if (cinData.lieu_naissance) break;
  }

  console.log("📋 RÉSULTAT FINAL extraction CIN:", cinData);
  
  return cinData;
};
