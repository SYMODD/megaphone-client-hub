
import { CINData } from "@/types/cinTypes";

export const extractCINData = (text: string): CINData => {
  console.log("🔍 EXTRACTION CIN - Texte OCR reçu:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("📝 Lignes de texte:", lines);
  
  const cinData: CINData = {
    nationalite: "Maroc"
  };

  const fullTextUpper = text.toUpperCase();
  
  // 1. EXTRACTION DU NOM ET PRÉNOM - Patterns améliorés
  console.log("🔤 Recherche nom et prénom...");
  
  // Recherche de patterns "NOM:" ou "NOM :" ou juste des mots en majuscules
  const nomPatterns = [
    /NOM\s*:\s*([A-Z][A-Z\s]+)/gi,
    /SURNAME\s*:\s*([A-Z][A-Z\s]+)/gi,
    /^([A-Z]{2,20})$/gm, // Mots tout en majuscules sur une ligne
  ];
  
  const prenomPatterns = [
    /PRENOM\s*:\s*([A-Z][A-Z\s]+)/gi,
    /PRÉNOM\s*:\s*([A-Z][A-Z\s]+)/gi,
    /GIVEN\s*NAME\s*:\s*([A-Z][A-Z\s]+)/gi,
    /^([A-Z]{2,20})$/gm,
  ];

  // Extraction du nom
  for (const pattern of nomPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const nom = match[1].trim().replace(/[^A-Z\s]/g, '');
      if (nom.length >= 2 && nom.length <= 30 && !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE'].includes(nom)) {
        cinData.nom = nom;
        console.log("✅ Nom trouvé:", nom);
        break;
      }
    }
  }

  // Extraction du prénom
  for (const pattern of prenomPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const prenom = match[1].trim().replace(/[^A-Z\s]/g, '');
      if (prenom.length >= 2 && prenom.length <= 30 && prenom !== cinData.nom && !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE'].includes(prenom)) {
        cinData.prenom = prenom;
        console.log("✅ Prénom trouvé:", prenom);
        break;
      }
    }
  }

  // Si pas de nom/prénom trouvé avec les patterns, chercher dans les lignes
  if (!cinData.nom || !cinData.prenom) {
    console.log("🔍 Recherche alternative dans les lignes...");
    const candidateNames = [];
    
    for (const line of lines) {
      const cleanLine = line.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
      if (cleanLine.length >= 2 && cleanLine.length <= 30 && 
          !['ROYAUME', 'MAROC', 'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO'].includes(cleanLine) &&
          /^[A-Z\s]+$/.test(cleanLine)) {
        candidateNames.push(cleanLine);
      }
    }
    
    console.log("👥 Candidats noms:", candidateNames);
    
    if (candidateNames.length >= 2) {
      if (!cinData.nom) {
        cinData.nom = candidateNames[0];
        console.log("✅ Nom alternatif:", candidateNames[0]);
      }
      if (!cinData.prenom) {
        cinData.prenom = candidateNames[1];
        console.log("✅ Prénom alternatif:", candidateNames[1]);
      }
    }
  }

  // 2. EXTRACTION DU NUMÉRO CIN - Patterns très flexibles
  console.log("🔢 Recherche numéro CIN...");
  
  const cinPatterns = [
    /CIN\s*:?\s*([A-Z]{0,3}\d{5,8})/gi,
    /N[°O]\s*:?\s*([A-Z]{0,3}\d{5,8})/gi,
    /([A-Z]{1,3}\d{5,8})/g,
    /(\d{6,8})/g, // Numéros longs
  ];

  for (const pattern of cinPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleanMatch = match.replace(/[^A-Z0-9]/g, '');
        if (cleanMatch.length >= 5 && cleanMatch.length <= 10) {
          cinData.numero_cin = cleanMatch;
          console.log("✅ Numéro CIN trouvé:", cleanMatch);
          break;
        }
      }
      if (cinData.numero_cin) break;
    }
  }

  // 3. EXTRACTION DE LA DATE DE NAISSANCE
  console.log("📅 Recherche date de naissance...");
  
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /NE\(E\)?\s*LE\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
    /NAISSANCE\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      
      // Validation basique de la date
      if (parseInt(day) <= 31 && parseInt(month) <= 12 && parseInt(year) >= 1900 && parseInt(year) <= 2024) {
        cinData.date_naissance = `${day}/${month}/${year}`;
        console.log("✅ Date de naissance trouvée:", cinData.date_naissance);
        break;
      }
    }
  }

  // 4. EXTRACTION DU LIEU DE NAISSANCE
  console.log("📍 Recherche lieu de naissance...");
  
  const lieuPatterns = [
    /NE\(E\)?\s*A\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    /LIEU\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    /A\s*:?\s*([A-Z][A-Z\s]{2,30})$/gim,
    /(AGADIR|CASABLANCA|RABAT|FES|MARRAKECH|TANGER|MEKNES|OUJDA|KENITRA|TETOUAN)/gi,
  ];

  for (const pattern of lieuPatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const lieu = match[1].trim().replace(/[^A-Z\s]/g, '');
      if (lieu.length >= 3 && lieu.length <= 50) {
        cinData.lieu_naissance = lieu;
        console.log("✅ Lieu de naissance trouvé:", lieu);
        break;
      }
    }
  }

  console.log("📋 RÉSULTAT FINAL extraction CIN:", cinData);
  
  return cinData;
};
