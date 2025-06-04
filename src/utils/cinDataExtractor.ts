
import { CINData } from "@/types/cinTypes";
import { extractNames } from "./cin/nameExtractor";
import { extractCINNumber } from "./cin/cinNumberExtractor";
import { extractBirthDate } from "./cin/dateExtractor";
import { extractBirthPlace } from "./cin/placeExtractor";

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
  
  // 1. EXTRACTION DU NOM ET PRÉNOM
  const names = extractNames(text);
  if (names.nom) cinData.nom = names.nom;
  if (names.prenom) cinData.prenom = names.prenom;

  // 2. EXTRACTION DU NUMÉRO CIN
  const numeroCIN = extractCINNumber(text);
  if (numeroCIN) cinData.numero_cin = numeroCIN;

  // 3. EXTRACTION DE LA DATE DE NAISSANCE
  const dateNaissance = extractBirthDate(text);
  if (dateNaissance) cinData.date_naissance = dateNaissance;

  // 4. EXTRACTION DU LIEU DE NAISSANCE
  const lieuNaissance = extractBirthPlace(text);
  if (lieuNaissance) cinData.lieu_naissance = lieuNaissance;

  console.log("📋 === RÉSULTAT FINAL EXTRACTION CIN ===");
  console.log("📋 Données extraites:", cinData);
  
  // Compter les champs extraits (plus permissif)
  const extractedFieldsCount = Object.values(cinData).filter(value => 
    value && value !== "Maroc" && value.toString().trim().length > 0
  ).length;
  
  console.log(`📊 Total champs extraits: ${extractedFieldsCount}/5`);
  
  return cinData;
};
