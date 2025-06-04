
import { CINData } from "@/types/cinTypes";

export const extractCINData = (text: string): CINData => {
  console.log("🔍 EXTRACTION CIN - Texte OCR reçu:", text);
  console.log("📏 Longueur du texte:", text.length);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("📝 Lignes de texte détectées:", lines.length, lines);
  
  const cinData: CINData = {
    nationalite: "Maroc"
  };

  const fullText = text.toUpperCase();
  console.log("🔤 Texte en majuscules pour analyse:", fullText.substring(0, 200) + "...");
  
  // 1. EXTRACTION DU NOM ET PRÉNOM - Patterns améliorés
  console.log("🔤 === DÉBUT RECHERCHE NOM ET PRÉNOM ===");
  
  // Patterns pour trouver nom et prénom
  const nomPrenomPatterns = [
    // Patterns explicites avec mots-clés
    /(?:NOM|SURNAME|FAMILY\s*NAME)\s*:?\s*([A-Z][A-Z\s]{1,30})/gi,
    /(?:PRENOM|PRÉNOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-Z][A-Z\s]{1,30})/gi,
    // Patterns EL + nom (courant au Maroc)
    /\bEL\s+([A-Z]{2,20})\b/gi,
    // Patterns avec structure CIN marocaine
    /([A-Z]{2,20})\s+([A-Z]{2,20})\s*(?=\d|$)/gm,
    // Mots isolés en majuscules (potentiels noms)
    /\b([A-Z]{3,20})\b/g
  ];

  const candidateNames = new Set<string>();
  
  // Collecter tous les candidats possibles
  for (const pattern of nomPrenomPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern ${pattern.source} trouvé ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const candidate = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (isValidName(candidate)) {
          candidateNames.add(candidate);
          console.log("📝 Candidat nom/prénom ajouté:", candidate);
        }
      }
    }
  }

  // Convertir en array et filtrer
  const validCandidates = Array.from(candidateNames).filter(name => isValidName(name));
  console.log("👥 Candidats noms valides:", validCandidates);

  // Assigner nom et prénom
  if (validCandidates.length >= 1) {
    cinData.nom = validCandidates[0];
    console.log("✅ Nom assigné:", cinData.nom);
  }
  if (validCandidates.length >= 2) {
    cinData.prenom = validCandidates[1];
    console.log("✅ Prénom assigné:", cinData.prenom);
  }

  // 2. EXTRACTION DU NUMÉRO CIN - Patterns améliorés
  console.log("🔢 === DÉBUT RECHERCHE NUMÉRO CIN ===");
  
  const cinPatterns = [
    // Format CIN classique marocain
    /(?:CIN|N[°O])\s*:?\s*([A-Z]{0,3}\d{6,12})/gi,
    /\b([A-Z]{1,2}\d{6,10})\b/g,
    /\b(\d{8,12})\b/g,
    // Patterns avec lettres et chiffres
    /\b([A-Z]\d{7,11})\b/g,
    /\b([A-Z]{2}\d{6,10})\b/g
  ];

  for (const pattern of cinPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern CIN ${pattern.source} trouvé ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const cleanCIN = match[1].replace(/[^A-Z0-9]/g, '');
        if (isValidCIN(cleanCIN)) {
          cinData.numero_cin = cleanCIN;
          console.log("✅ Numéro CIN assigné:", cleanCIN);
          break;
        }
      }
    }
    if (cinData.numero_cin) break;
  }

  // 3. EXTRACTION DE LA DATE DE NAISSANCE - Patterns améliorés
  console.log("📅 === DÉBUT RECHERCHE DATE DE NAISSANCE ===");
  
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    /(?:NE|BORN|NAISSANCE)\s*(?:LE)?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern date ${pattern.source} trouvé ${matches.length} résultats`);
    
    for (const match of matches) {
      const dateResult = parseDate(match);
      if (dateResult) {
        cinData.date_naissance = dateResult;
        console.log("✅ Date de naissance assignée:", dateResult);
        break;
      }
    }
    if (cinData.date_naissance) break;
  }

  // 4. EXTRACTION DU LIEU DE NAISSANCE
  console.log("📍 === DÉBUT RECHERCHE LIEU DE NAISSANCE ===");
  
  const lieuPatterns = [
    /(?:NE|BORN)\s*A\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    /(?:LIEU|PLACE)\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    // Villes marocaines courantes
    /(AGADIR|CASABLANCA|RABAT|FES|FEZ|MARRAKECH|TANGER|MEKNES|OUJDA|KENITRA|TETOUAN|SALE|MOHAMMEDIA|BENI\s*MELLAL|EL\s*JADIDA)/gi,
  ];

  for (const pattern of lieuPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern lieu ${pattern.source} trouvé ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const lieu = match[1].trim().replace(/[^A-Z\s]/g, '');
        if (isValidPlace(lieu)) {
          cinData.lieu_naissance = lieu;
          console.log("✅ Lieu de naissance assigné:", lieu);
          break;
        }
      }
    }
    if (cinData.lieu_naissance) break;
  }

  console.log("📋 === RÉSULTAT FINAL EXTRACTION CIN ===");
  console.log("📋 Données extraites:", cinData);
  
  // Compter les champs extraits
  const extractedFieldsCount = Object.values(cinData).filter(value => 
    value && value !== "Maroc" && value.toString().trim().length > 0
  ).length;
  
  console.log(`📊 Total champs extraits: ${extractedFieldsCount}/5`);
  
  return cinData;
};

// Fonctions utilitaires pour validation
function isValidName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 30) return false;
  
  // Exclure les mots courants qui ne sont pas des noms
  const excludedWords = [
    'ROYAUME', 'MAROC', 'MOROCCO', 'CARTE', 'IDENTITE', 'NATIONALE', 
    'KINGDOM', 'CARD', 'IDENTITY', 'NATIONAL', 'DU', 'DE', 'LA', 'LE',
    'AND', 'ET', 'OU', 'OR', 'THE', 'FOR', 'WITH', 'WITHOUT'
  ];
  
  if (excludedWords.includes(name.trim())) return false;
  
  // Doit contenir uniquement des lettres et espaces
  if (!/^[A-Z\s]+$/.test(name)) return false;
  
  return true;
}

function isValidCIN(cin: string): boolean {
  if (!cin || cin.length < 6 || cin.length > 12) return false;
  
  // Doit contenir au moins 6 chiffres
  const digitCount = (cin.match(/\d/g) || []).length;
  if (digitCount < 6) return false;
  
  return true;
}

function isValidPlace(place: string): boolean {
  if (!place || place.length < 3 || place.length > 50) return false;
  
  // Exclure les mots génériques
  const excludedWords = [
    'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO', 'MAROC'
  ];
  
  if (excludedWords.includes(place.trim())) return false;
  
  return true;
}

function parseDate(match: RegExpMatchArray): string | null {
  if (!match) return null;
  
  let day: string, month: string, year: string;
  
  // Déterminer le format de date
  if (match[3] && match[3].length === 4) {
    // Format dd/mm/yyyy
    day = match[1].padStart(2, '0');
    month = match[2].padStart(2, '0');
    year = match[3];
  } else if (match[1] && match[1].length === 4) {
    // Format yyyy/mm/dd
    year = match[1];
    month = match[2].padStart(2, '0');
    day = match[3].padStart(2, '0');
  } else {
    return null;
  }
  
  // Validation de la date
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31 || 
      monthNum < 1 || monthNum > 12 || 
      yearNum < 1900 || yearNum > 2024) {
    return null;
  }
  
  return `${day}/${month}/${year}`;
}
