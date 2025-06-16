import { isValidNameCandidate, isExcludedWord } from './validators';

export function extractNames(text: string): { nom?: string; prenom?: string } {
  console.log("👤 === DÉBUT RECHERCHE NOMS ET PRÉNOMS CIN ===");
  console.log("📝 Texte analysé:", text.substring(0, 200) + "...");
  
  const lines = text.split('\n').map(line => line.trim().toUpperCase());
  console.log("📝 Lignes analysées:", lines.length);
  console.log("📋 Toutes les lignes:", lines);
  
  const result: { nom?: string; prenom?: string } = {};
  
  // === NOUVELLE MÉTHODE PRIORITAIRE : DÉTECTION SÉQUENTIELLE CIN MAROCAINE ===
  console.log("🔍 Recherche séquentielle après 'CARTE NATIONALE D'IDENTITE'...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Chercher la ligne avec "CARTE NATIONALE" ou "IDENTITE"
    if ((line.includes('CARTE NATIONALE') || line.includes('IDENTITE')) && 
        !result.nom && !result.prenom) {
      
      console.log(`✅ Ligne de référence trouvée à l'index ${i}:`, line);
      
      // Chercher nom et prénom dans les 2-3 lignes suivantes
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const candidatLine = lines[j].trim();
        
        console.log(`🔍 Analyse ligne suivante ${j}:`, candidatLine);
        
        // Vérifier si c'est un candidat nom valide
        if (candidatLine.length >= 3 && 
            candidatLine.length <= 25 &&
            /^[A-Z\s]+$/.test(candidatLine) && // Que des majuscules et espaces
            !isExcludedWord(candidatLine) &&
            !candidatLine.includes('Née') &&
            !candidatLine.includes('ROYAUME') &&
            !candidatLine.includes('MAROC')) {
          
          if (!result.nom) {
            result.nom = candidatLine;
            console.log("✅ Nom trouvé (séquentiel):", result.nom);
          } else if (!result.prenom && candidatLine !== result.nom) {
            result.prenom = candidatLine;
            console.log("✅ Prénom trouvé (séquentiel):", result.prenom);
            break; // On a trouvé les deux, on peut arrêter
          }
        }
      }
      
      // Si on a trouvé au moins le nom, on peut arrêter la recherche
      if (result.nom) break;
    }
  }
  
  // === MÉTHODES EXISTANTES (comme fallback) ===
  
  // Patterns spécifiques pour les CIN marocaines (améliorés)
  if (!result.nom || !result.prenom) {
    console.log("🔍 Recherche avec patterns spécifiques...");
    
    const namePatterns = [
      // Patterns directs avec ponctuation flexible
      /(?:NOM|SURNAME|FAMILY\s*NAME)\s*:?\s*([A-Z\s]{2,25})/gi,
      /(?:PRENOM|GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-Z\s]{2,25})/gi,
      // Patterns avec numérotation
      /(?:1\.\s*)?(?:NOM|SURNAME)\s*:?\s*([A-Z\s]{2,25})/gi,
      /(?:2\.\s*)?(?:PRENOM|GIVEN)\s*:?\s*([A-Z\s]{2,25})/gi,
    ];

    // Recherche dans les lignes avec patterns spécifiques
    for (const line of lines) {
      console.log("🔍 Analyse ligne pattern:", line);
      
      // Ignorer les lignes trop courtes ou avec des mots exclus
      if (line.length < 3) {
        console.log("⏭️ Ligne ignorée (trop courte)");
        continue;
      }
      if (isExcludedWord(line)) {
        console.log("⏭️ Ligne ignorée (mot exclu)");
        continue;
      }
      
      // Recherche pattern NOM avec variations
      const nomPatterns = [
        /(?:NOM|SURNAME)\s*:?\s*([A-Z\s]{2,25})/i,
        /(?:1\.\s*)?(?:NOM|SURNAME)\s*:?\s*([A-Z\s]{2,25})/i,
        /(?:FAMILY\s*NAME)\s*:?\s*([A-Z\s]{2,25})/i
      ];
      
      if (!result.nom) {
        for (const pattern of nomPatterns) {
          const nomMatch = line.match(pattern);
          if (nomMatch && nomMatch[1]) {
            const candidateNom = nomMatch[1].trim();
            console.log("🔍 Candidat nom pattern:", candidateNom);
            if (isValidNameCandidate(candidateNom) && !isExcludedWord(candidateNom)) {
              result.nom = candidateNom;
              console.log("✅ Nom trouvé (pattern):", result.nom);
              break;
            }
          }
        }
      }
      
      // Recherche pattern PRÉNOM avec variations
      const prenomPatterns = [
        /(?:PRENOM|GIVEN|FIRST)\s*:?\s*([A-Z\s]{2,25})/i,
        /(?:2\.\s*)?(?:PRENOM|GIVEN)\s*:?\s*([A-Z\s]{2,25})/i,
        /(?:GIVEN\s*NAME|FIRST\s*NAME)\s*:?\s*([A-Z\s]{2,25})/i
      ];
      
      if (!result.prenom) {
        for (const pattern of prenomPatterns) {
          const prenomMatch = line.match(pattern);
          if (prenomMatch && prenomMatch[1]) {
            const candidatePrenom = prenomMatch[1].trim();
            console.log("🔍 Candidat prénom pattern:", candidatePrenom);
            if (isValidNameCandidate(candidatePrenom) && !isExcludedWord(candidatePrenom)) {
              result.prenom = candidatePrenom;
              console.log("✅ Prénom trouvé (pattern):", result.prenom);
              break;
            }
          }
        }
      }
      
      // Pattern général nom + prénom sur la même ligne (amélioré)
      if (!result.nom || !result.prenom) {
        const generalPatterns = [
          /^([A-Z]{2,20})\s+([A-Z]{2,20})$/,          // Deux mots séparés
          /^([A-Z]{2,20})\s+([A-Z]{2,20})\s+[A-Z]/,   // Deux premiers mots d'une ligne
          /([A-Z]{3,20})\s+([A-Z]{3,20})(?:\s|$)/     // Mots au milieu de ligne
        ];
        
        for (const pattern of generalPatterns) {
          const generalMatch = line.match(pattern);
          if (generalMatch && generalMatch[1] && generalMatch[2]) {
            const candidateNom = generalMatch[1].trim();
            const candidatePrenom = generalMatch[2].trim();
            
            console.log("🔍 Candidats généraux:", candidateNom, "et", candidatePrenom);
            
            if (isValidNameCandidate(candidateNom) && !isExcludedWord(candidateNom) && !result.nom) {
              result.nom = candidateNom;
              console.log("✅ Nom trouvé (pattern général):", result.nom);
            }
            
            if (isValidNameCandidate(candidatePrenom) && !isExcludedWord(candidatePrenom) && 
                !result.prenom && candidatePrenom !== result.nom) {
              result.prenom = candidatePrenom;
              console.log("✅ Prénom trouvé (pattern général):", result.prenom);
            }
            
            if (result.nom && result.prenom) break;
          }
        }
      }
    }
  }

  // Recherche dans des mots individuels si pas encore trouvé (fallback amélioré)
  if (!result.nom || !result.prenom) {
    console.log("🔍 Recherche fallback dans mots isolés...");
    
    const words = text.replace(/[^A-Z\s]/g, ' ')
                     .split(/\s+/)
                     .filter(word => 
                       word.length >= 3 && 
                       word.length <= 25 && 
                       isValidNameCandidate(word) && 
                       !isExcludedWord(word)
                     );
    
    console.log("🔤 Mots candidats restants:", words);
    
    // Prioriser les mots les plus longs et les plus probables
    const sortedWords = words.sort((a, b) => {
      // Prioriser les mots de longueur moyenne (5-15 caractères)
      const scoreA = a.length >= 5 && a.length <= 15 ? 2 : 1;
      const scoreB = b.length >= 5 && b.length <= 15 ? 2 : 1;
      return scoreB - scoreA;
    });
    
    for (const word of sortedWords) {
      if (!result.nom) {
        result.nom = word;
        console.log("✅ Nom assigné (mot candidat):", result.nom);
      } else if (!result.prenom && word !== result.nom) {
        result.prenom = word;
        console.log("✅ Prénom assigné (mot candidat):", result.prenom);
        break;
      }
    }
  }

  console.log("📋 === RÉSULTAT EXTRACTION NOMS CIN ===");
  console.log("📋 Nom:", result.nom || "NON TROUVÉ");
  console.log("📋 Prénom:", result.prenom || "NON TROUVÉ");
  
  // Statistiques de réussite
  const foundFields = (result.nom ? 1 : 0) + (result.prenom ? 1 : 0);
  console.log(`📊 Champs noms extraits: ${foundFields}/2 (${Math.round((foundFields/2)*100)}%)`);
  
  return result;
}