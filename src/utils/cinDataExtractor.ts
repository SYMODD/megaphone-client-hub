
import { CINData } from "@/types/cinTypes";
import { extractNames } from "./cin/nameExtractor";
import { extractCINNumber } from "./cin/cinNumberExtractor";
import { extractBirthDate } from "./cin/dateExtractor";
import { extractBirthPlace } from "./cin/placeExtractor";
import { normalizeNationality } from "./nationalityNormalizer";

export const extractCINData = (text: string): CINData => {
  console.log("🔍 EXTRACTION CIN - Texte OCR reçu:", text.substring(0, 300) + "...");
  console.log("📏 Longueur du texte:", text.length);
  
  // Affichage du texte complet pour debugging
  console.log("📝 TEXTE COMPLET OCR:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("📝 Lignes de texte détectées:", lines.length);
  console.log("📋 Toutes les lignes:", lines);
  
  const cinData: CINData = {
    nationalite: "Maroc" // Défaut pour les CIN marocaines
  };

  const fullText = text.toUpperCase();
  console.log("🔤 Début extraction données CIN...");
  
  // 1. EXTRACTION DU NOM ET PRÉNOM (améliorée)
  console.log("👤 === EXTRACTION NOMS ET PRÉNOMS ===");
  const names = extractNames(text);
  if (names.nom) {
    cinData.nom = names.nom;
    console.log("✅ Nom extrait:", cinData.nom);
  } else {
    console.log("❌ Nom non trouvé - tentative de patterns alternatifs");
    // Patterns alternatifs plus souples
    for (const line of lines) {
      const cleanLine = line.toUpperCase().trim();
      // Recherche de mots isolés qui pourraient être des noms
      if (cleanLine.length >= 3 && cleanLine.length <= 25 && /^[A-Z\s]+$/.test(cleanLine)) {
        const words = cleanLine.split(/\s+/).filter(w => w.length >= 2);
        if (words.length === 1 && !cinData.nom && !['CIN', 'CARTE', 'IDENTITE', 'ROYAUME', 'MAROC'].includes(words[0])) {
          cinData.nom = words[0];
          console.log("✅ Nom extrait (pattern alternatif):", cinData.nom);
          break;
        }
      }
    }
  }
  
  if (names.prenom) {
    cinData.prenom = names.prenom;
    console.log("✅ Prénom extrait:", cinData.prenom);
  } else {
    console.log("❌ Prénom non trouvé - tentative de patterns alternatifs");
    // Recherche alternative pour le prénom
    for (const line of lines) {
      const cleanLine = line.toUpperCase().trim();
      if (cleanLine.length >= 3 && cleanLine.length <= 25 && /^[A-Z\s]+$/.test(cleanLine)) {
        const words = cleanLine.split(/\s+/).filter(w => w.length >= 2);
        if (words.length === 1 && !cinData.prenom && cinData.nom && words[0] !== cinData.nom && 
            !['CIN', 'CARTE', 'IDENTITE', 'ROYAUME', 'MAROC'].includes(words[0])) {
          cinData.prenom = words[0];
          console.log("✅ Prénom extrait (pattern alternatif):", cinData.prenom);
          break;
        }
      }
    }
  }

  // 2. EXTRACTION DU NUMÉRO CIN (améliorée)
  console.log("🔢 === EXTRACTION NUMÉRO CIN ===");
  const numeroCIN = extractCINNumber(text);
  if (numeroCIN) {
    cinData.numero_cin = numeroCIN;
    console.log("✅ Numéro CIN extrait:", cinData.numero_cin);
  } else {
    console.log("❌ Numéro CIN non trouvé - tentative de patterns alternatifs");
    // Patterns alternatifs pour le numéro CIN
    const cinPatterns = [
      /\b([A-Z]{1,2}\d{5,8})\b/g,  // Format avec lettres + chiffres
      /\b(\d{6,10})\b/g,           // Format numérique simple
      /\b([A-Z]\d{5,7})\b/g        // Une lettre + chiffres
    ];
    
    for (const pattern of cinPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1] && match[1].length >= 6) {
          cinData.numero_cin = match[1];
          console.log("✅ Numéro CIN extrait (pattern alternatif):", cinData.numero_cin);
          break;
        }
      }
      if (cinData.numero_cin) break;
    }
  }

  // 3. EXTRACTION DE LA DATE DE NAISSANCE (améliorée)
  console.log("📅 === EXTRACTION DATE DE NAISSANCE ===");
  const dateNaissance = extractBirthDate(text);
  if (dateNaissance) {
    cinData.date_naissance = dateNaissance;
    console.log("✅ Date naissance extraite:", cinData.date_naissance);
  } else {
    console.log("❌ Date naissance non trouvée - tentative de patterns alternatifs");
    // Patterns plus souples pour les dates
    const datePatterns = [
      /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/g,
      /\b(\d{2}\s\d{2}\s\d{4})\b/g,
      /\b(\d{8})\b/g  // Format DDMMYYYY
    ];
    
    for (const pattern of datePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          let dateCandidate = match[1];
          // Conversion format DDMMYYYY vers DD/MM/YYYY
          if (/^\d{8}$/.test(dateCandidate)) {
            dateCandidate = `${dateCandidate.slice(0,2)}/${dateCandidate.slice(2,4)}/${dateCandidate.slice(4,8)}`;
          }
          cinData.date_naissance = dateCandidate;
          console.log("✅ Date naissance extraite (pattern alternatif):", cinData.date_naissance);
          break;
        }
      }
      if (cinData.date_naissance) break;
    }
  }

  // 4. EXTRACTION DU LIEU DE NAISSANCE
  console.log("📍 === EXTRACTION LIEU DE NAISSANCE ===");
  const lieuNaissance = extractBirthPlace(text);
  if (lieuNaissance) {
    cinData.lieu_naissance = lieuNaissance;
    console.log("✅ Lieu naissance extrait:", cinData.lieu_naissance);
  }

  // 5. EXTRACTION DE LA NATIONALITÉ (améliorée avec normalisation)
  console.log("🌍 === EXTRACTION NATIONALITÉ ===");
  for (const line of lines) {
    if (!cinData.nationalite || cinData.nationalite === "Maroc") {
      // Recherche patterns de nationalité
      const nationalityMatch = line.match(/(?:NATIONALITE|NATIONALITY)\s*:?\s*([A-Z\s]{3,25})/i);
      if (nationalityMatch) {
        const rawNationality = nationalityMatch[1].trim();
        cinData.nationalite = normalizeNationality(rawNationality);
        console.log("✅ Nationalité extraite et normalisée:", cinData.nationalite);
        break;
      }
      
      // Recherche mots-clés de nationalité
      if (line.toUpperCase().includes('MAROCAIN') || line.toUpperCase().includes('MOROCCAN')) {
        cinData.nationalite = "Maroc";
        console.log("✅ Nationalité détectée: Maroc");
        break;
      }
    }
  }

  console.log("📋 === RÉSULTAT FINAL EXTRACTION CIN ===");
  const extractedFields = {
    nom: cinData.nom || "NON TROUVÉ",
    prenom: cinData.prenom || "NON TROUVÉ", 
    numero_cin: cinData.numero_cin || "NON TROUVÉ",
    nationalite: cinData.nationalite,
    date_naissance: cinData.date_naissance || "NON TROUVÉ",
    lieu_naissance: cinData.lieu_naissance || "NON TROUVÉ"
  };
  
  console.log("📋 Données extraites:", extractedFields);
  
  // Compter les champs extraits avec succès
  const successfulFields = Object.entries(extractedFields).filter(([key, value]) => 
    value && value !== "NON TROUVÉ" && (key !== 'nationalite' || value !== "Maroc")
  ).length;
  
  console.log(`📊 Champs extraits avec succès: ${successfulFields}/6`);
  console.log(`📈 Taux de réussite: ${Math.round((successfulFields/6)*100)}%`);
  
  return cinData;
};
