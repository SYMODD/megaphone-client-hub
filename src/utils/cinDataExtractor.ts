
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
  console.log("🔤 Texte en majuscules pour analyse:", fullText);
  
  // 1. EXTRACTION DU NOM ET PRÉNOM - Plus permissif
  console.log("🔤 === DÉBUT RECHERCHE NOM ET PRÉNOM ===");
  
  // Patterns plus simples et permissifs
  const nomPrenomPatterns = [
    // Mots en majuscules de 3+ caractères (noms typiques)
    /\b([A-Z]{3,20})\b/g,
    // Patterns avec structure nom prénom
    /([A-Z]+)\s+([A-Z]+)/g,
    // Patterns EL + nom
    /\bEL\s+([A-Z]{2,20})/gi,
    // Patterns avec mots-clés
    /(?:NOM|SURNAME)\s*:?\s*([A-Z][A-Z\s]{2,30})/gi,
    /(?:PRENOM|PRÉNOM|GIVEN)\s*:?\s*([A-Z][A-Z\s]{2,30})/gi
  ];

  const candidateNames = [];
  
  // Collecter tous les mots en majuscules comme candidats
  for (const pattern of nomPrenomPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      const candidate = match[1] ? match[1].trim() : match[0].trim();
      if (candidate && isValidNameCandidate(candidate)) {
        candidateNames.push(candidate);
        console.log("📝 Candidat nom/prénom:", candidate);
      }
    }
  }

  // Filtrer et assigner les meilleurs candidats
  const validNames = candidateNames
    .filter(name => isValidNameCandidate(name))
    .filter(name => !isExcludedWord(name))
    .slice(0, 3); // Prendre les 3 premiers

  console.log("👥 Candidats noms valides:", validNames);

  if (validNames.length >= 1) {
    cinData.nom = validNames[0];
    console.log("✅ Nom assigné:", cinData.nom);
  }
  if (validNames.length >= 2) {
    cinData.prenom = validNames[1];
    console.log("✅ Prénom assigné:", cinData.prenom);
  }

  // 2. EXTRACTION DU NUMÉRO CIN - Plus permissif
  console.log("🔢 === DÉBUT RECHERCHE NUMÉRO CIN ===");
  
  const cinPatterns = [
    // Patterns CIN marocains plus flexibles
    /\b([A-Z]{1,3}\d{5,12})\b/g,
    /\b(\d{6,12})\b/g,
    /(?:CIN|N[°O])\s*:?\s*([A-Z0-9]{6,15})/gi,
    // Patterns plus génériques
    /([A-Z]\d{6,11})/g,
    /([A-Z]{2}\d{5,10})/g
  ];

  for (const pattern of cinPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern CIN ${pattern.source} - ${matches.length} résultats`);
    
    for (const match of matches) {
      if (match[1]) {
        const cleanCIN = match[1].replace(/[^A-Z0-9]/g, '');
        console.log("🔍 Candidat CIN:", cleanCIN);
        if (isValidCINCandidate(cleanCIN)) {
          cinData.numero_cin = cleanCIN;
          console.log("✅ Numéro CIN assigné:", cleanCIN);
          break;
        }
      }
    }
    if (cinData.numero_cin) break;
  }

  // 3. EXTRACTION DE LA DATE DE NAISSANCE - Plus permissif
  console.log("📅 === DÉBUT RECHERCHE DATE DE NAISSANCE ===");
  
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
    /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/g,
    // Dates en format texte
    /(?:NE|BORN|NAISSANCE)\s*(?:LE)?\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern date ${pattern.source} - ${matches.length} résultats`);
    
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

  // 4. EXTRACTION DU LIEU DE NAISSANCE - Plus permissif
  console.log("📍 === DÉBUT RECHERCHE LIEU DE NAISSANCE ===");
  
  const lieuPatterns = [
    // Villes marocaines courantes d'abord
    /(AGADIR|CASABLANCA|RABAT|FES|FEZ|MARRAKECH|TANGER|MEKNES|OUJDA|KENITRA|TETOUAN|SALE|MOHAMMEDIA|BENI\s*MELLAL|EL\s*JADIDA|ESSAOUIRA|NADOR|KHOURIBGA|SETTAT|BERKANE)/gi,
    // Patterns génériques
    /(?:NE|BORN)\s*A\s*:?\s*([A-Z][A-Z\s]{2,25})/gi,
    /(?:LIEU|PLACE)\s*:?\s*([A-Z][A-Z\s]{2,25})/gi,
  ];

  for (const pattern of lieuPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    console.log(`🔍 Pattern lieu ${pattern.source} - ${matches.length} résultats`);
    
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
  
  // Compter les champs extraits (plus permissif)
  const extractedFieldsCount = Object.values(cinData).filter(value => 
    value && value !== "Maroc" && value.toString().trim().length > 0
  ).length;
  
  console.log(`📊 Total champs extraits: ${extractedFieldsCount}/5`);
  
  return cinData;
};

// Fonctions utilitaires pour validation - PLUS PERMISSIVES
function isValidNameCandidate(name: string): boolean {
  if (!name || name.length < 2) return false;
  
  // Doit contenir uniquement des lettres et espaces
  if (!/^[A-Z\s]+$/.test(name)) return false;
  
  return true;
}

function isExcludedWord(word: string): boolean {
  const excludedWords = [
    'ROYAUME', 'MAROC', 'MOROCCO', 'CARTE', 'IDENTITE', 'NATIONALE', 
    'KINGDOM', 'CARD', 'IDENTITY', 'NATIONAL', 'DU', 'DE', 'LA', 'LE',
    'AND', 'ET', 'OU', 'OR', 'THE', 'FOR', 'WITH', 'WITHOUT', 'DATE',
    'SEXE', 'SEX', 'MALE', 'FEMALE', 'LIEU', 'PLACE', 'BORN', 'NAISSANCE'
  ];
  
  return excludedWords.includes(word.trim());
}

function isValidCINCandidate(cin: string): boolean {
  if (!cin || cin.length < 5) return false;
  
  // Doit contenir au moins quelques chiffres
  const digitCount = (cin.match(/\d/g) || []).length;
  if (digitCount < 4) return false;
  
  return true;
}

function isValidPlace(place: string): boolean {
  if (!place || place.length < 3 || place.length > 30) return false;
  
  // Exclure les mots génériques
  const excludedWords = [
    'CARTE', 'IDENTITE', 'NATIONALE', 'KINGDOM', 'MOROCCO', 'MAROC',
    'DATE', 'SEXE', 'MALE', 'FEMALE'
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
  
  // Validation de la date plus permissive
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31 || 
      monthNum < 1 || monthNum > 12 || 
      yearNum < 1940 || yearNum > 2024) {
    return null;
  }
  
  return `${day}/${month}/${year}`;
}
