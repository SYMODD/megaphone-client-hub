
import { isValidNameCandidate, isExcludedWord } from './validators';

export function extractNames(text: string): { nom?: string; prenom?: string } {
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

  const result: { nom?: string; prenom?: string } = {};

  if (validNames.length >= 1) {
    result.nom = validNames[0];
    console.log("✅ Nom assigné:", result.nom);
  }
  if (validNames.length >= 2) {
    result.prenom = validNames[1];
    console.log("✅ Prénom assigné:", result.prenom);
  }

  return result;
}
