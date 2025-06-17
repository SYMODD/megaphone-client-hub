import { PassportEtrangerData } from "@/types/passportEtrangerTypes";
import { safeStringTrim } from "./stringUtils";
import { checkForNationalityInLine, convertMainTextNationality } from "./nationalityUtils";
import { normalizeNationality } from "../nationalityNormalizer";

export const extractDataFromMainText = (lines: string[], passportData: PassportEtrangerData): void => {
  console.log("🔍 Extraction depuis le texte principal du passeport étranger");
  console.log("📝 Lignes à analyser:", lines.length);
  console.log("📋 Toutes les lignes:", lines);
  
  // ===== PHASE 1: RECHERCHE PRIORITAIRE DES PATTERNS SÉQUENTIELS =====
  console.log("🎯 PHASE 1 - Recherche patterns séquentiels prioritaires...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();
    
    // PATTERN SÉQUENTIEL NOM : Formats courts universels
    // ✨ SUPPORT UNIVERSEL : Formats longs ET courts de tous pays
    if (!passportData.nom && (lineUpper.includes('SURNAME') || lineUpper.includes('/NOM') || 
                              lineUpper.includes('NAMO') || lineUpper.includes('SURANE') ||
                              lineUpper.includes('FAMILY NAME') ||      // Anglais
                              lineUpper.includes('APELLIDOS') ||        // Espagnol
                              lineUpper.includes('COGNOME') ||          // Italien
                              lineUpper.includes('NOM DE FAMILLE') ||   // Français long
                              lineUpper.includes('NACHNAME') ||         // Allemand
                              lineUpper.includes('SOBRENOME') ||        // Portugais
                              lineUpper.includes('ACHTERNAAM') ||       // Néerlandais
                              // FORMATS COURTS UNIVERSELS
                              (lineUpper.includes('NOM ') && !lineUpper.includes('PRENOM')) ||  // Français court
                              (lineUpper.includes('NOME ') && !lineUpper.includes('COGNOME')) || // Italien court
                              lineUpper.includes('APELLIDO ') ||        // Espagnol court
                              lineUpper.includes('SURNAME ') ||         // Anglais court
                              lineUpper.includes('FAMILIA ') ||         // Variations
                              lineUpper.includes('LAST NAME'))) {       // Anglais alternatif
      console.log(`✅ Ligne indicatrice nom trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat nom (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 2 && 
            /^[A-ZÀ-ÿ\s]+$/.test(nextLine) &&  // Support accents
            !nextLine.includes('NAME') && 
            !nextLine.includes('GIVEN') &&
            !nextLine.includes('PASSPORT') &&
            !nextLine.includes('REPUBLIC') &&
            !nextLine.includes('/')) {
          
          // Nettoyer le nom (enlever "IN" au début s'il y en a)
          let cleanName = nextLine.trim();
          if (cleanName.startsWith('IN ')) {
            cleanName = cleanName.substring(3).trim();
          }
          
          passportData.nom = cleanName;
          console.log("✅ Nom extrait (pattern séquentiel):", passportData.nom);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL PRÉNOM : Formats courts universels
    // ✨ SUPPORT UNIVERSEL : Formats longs ET courts de tous pays
    if (!passportData.prenom && (lineUpper.includes('GIVEN NAMES') || 
                                lineUpper.includes('GIVON NAMES') ||    // OCR allemand
                                lineUpper.includes('GIVEN NAMED') ||    // OCR marocain
                                lineUpper.includes('PRENOMS') || 
                                lineUpper.includes('PRENOM') ||
                                lineUpper.includes('FIRST NAME') ||     // Anglais
                                lineUpper.includes('FIRST NAMES') ||    // Anglais pluriel
                                lineUpper.includes('GIVEN NAME') ||     // Anglais singulier
                                lineUpper.includes('NOMBRE') ||         // Espagnol
                                lineUpper.includes('NOME') ||           // Italien
                                lineUpper.includes('PRÉNOM') ||         // Français avec accent
                                lineUpper.includes('PRÉNOMS') ||        // Français pluriel
                                lineUpper.includes('VORNAME') ||        // Allemand
                                lineUpper.includes('VORNAMEN') ||       // Allemand pluriel
                                lineUpper.includes('PRIMEIRO NOME') ||  // Portugais
                                lineUpper.includes('VOORNAAM') ||       // Néerlandais
                                // FORMATS COURTS UNIVERSELS
                                (lineUpper.includes('PRENOM') && !lineUpper.includes('PRENOMS')) ||  // Français court
                                lineUpper.includes('PRENOMST') ||       // OCR français imparfait
                                lineUpper.includes('NOME ') ||          // Italien court
                                lineUpper.includes('NAME ') ||          // Anglais court
                                lineUpper.includes('FIRST ') ||         // Anglais très court
                                lineUpper.includes('GIVEN '))) {        // Anglais très court
      console.log(`✅ Ligne indicatrice prénom trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat prénom (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 2 && 
            /^[A-ZÀ-ÿ\s]+$/.test(nextLine) &&  // Support accents
            !nextLine.includes('NAME') && 
            !nextLine.includes('GIVEN') &&
            !nextLine.includes('PASSPORT') &&
            !nextLine.includes('REPUBLIC') &&
            !nextLine.includes('/') &&
            !nextLine.includes('NATIONALITY')) {
          
          passportData.prenom = nextLine.trim();
          console.log("✅ Prénom extrait (pattern séquentiel):", passportData.prenom);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL NATIONALITÉ : Nationality/Nation -> ligne suivante
    // ✨ SUPPORT UNIVERSEL : Tous formats internationaux
    if (!passportData.nationalite && (lineUpper.includes('NATIONALITY') || 
                                     lineUpper.includes('NANIONALTON') ||   // OCR marocain
                                     lineUpper.includes('/NATION') ||
                                     lineUpper.includes('NATIONALITÉ') ||   // Français avec accent
                                     lineUpper.includes('NACIONALIDAD') ||  // Espagnol
                                     lineUpper.includes('NAZIONALITÀ') ||   // Italien
                                     lineUpper.includes('STAATSANGEHÖRIGKEIT') || // Allemand
                                     lineUpper.includes('NATIONALITEIT') || // Néerlandais
                                     lineUpper.includes('NACIONALIDADE') || // Portugais
                                     lineUpper.includes('CITIZENSHIP') ||   // Anglais alternatif
                                     lineUpper.includes('CITIZEN OF'))) {   // Anglais
      console.log(`✅ Ligne indicatrice nationalité trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat nationalité (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 3 && 
            /^[A-ZÀ-ÿ\s\/]+$/.test(nextLine) &&  // Support accents
            !nextLine.includes('DATE') && 
            !nextLine.includes('BIRTH')) {
          
          const convertedNationality = convertMainTextNationality(nextLine);
          passportData.nationalite = normalizeNationality(convertedNationality);
          console.log("✅ Nationalité extraite (pattern séquentiel):", passportData.nationalite);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL NUMÉRO DOCUMENT : Passport No -> ligne suivante
    // ✨ SUPPORT UNIVERSEL : Tous formats internationaux
    if (!passportData.numero_passeport && (lineUpper.includes('PASSPORT NO') || 
                                           lineUpper.includes('PASSPORT NUMBER') ||
                                           lineUpper.includes('PASSEPORT NU') ||
                                           lineUpper.includes('PASSEPORT N') ||
                                           lineUpper.includes('PASS-NR') ||
                                           lineUpper.includes('REISEPASS') ||
                                           lineUpper.includes('DOCUMENTO N') ||    // Espagnol
                                           lineUpper.includes('DOCUMENTO NO') ||   // Espagnol
                                           lineUpper.includes('PASSAPORTO N') ||   // Italien
                                           lineUpper.includes('N° PASSEPORT') ||   // Français
                                           lineUpper.includes('NUMÉRO') ||         // Français
                                           lineUpper.includes('NÚMERO') ||         // Espagnol/Portugais
                                           lineUpper.includes('NUMERO') ||         // Italien
                                           lineUpper.includes('PASPOORTNUMMER') || // Néerlandais
                                           (line.includes('•') && lineUpper.includes('PASSEPORT')))) {
      console.log(`✅ Ligne indicatrice numéro document trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat numéro (${i+2}):`, nextLine);
        
        // Pattern universel pour numéro de document
        const docCandidate = nextLine.match(/\b([A-Z0-9]+(?:\s+[A-Z0-9]+)*)\b/);
        if (docCandidate && docCandidate[1] && 
            docCandidate[1].length >= 6 && 
            /[0-9]/.test(docCandidate[1]) && 
            !docCandidate[1].includes('PASSPORT')) {
          
          // Nettoyer le numéro (enlever les espaces)
          passportData.numero_passeport = docCandidate[1].replace(/\s+/g, '');
          console.log("✅ Numéro document extrait (pattern séquentiel):", passportData.numero_passeport);
        }
      }
    }
  }
  
  console.log("🎯 PHASE 1 TERMINÉE - Résultats patterns séquentiels:");
  console.log("📋 Nom séquentiel:", passportData.nom || "NON TROUVÉ");
  console.log("📋 Prénom séquentiel:", passportData.prenom || "NON TROUVÉ");
  console.log("📋 Nationalité séquentielle:", passportData.nationalite || "NON TROUVÉ");
  
  // ===== PHASE 2: PATTERNS DE FALLBACK UNIVERSELS =====
  console.log("🔄 PHASE 2 - Patterns de fallback universels...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();
    console.log(`🔍 Analyse ligne ${i+1}:`, line);
    
    // Extraction du nom (FALLBACK universel)
    if (!passportData.nom) {
      console.log("👤 Recherche du nom (fallback universel)...");
      
      // Patterns directs universels (formats longs ET courts)
      const surnamePatterns = [
        /(?:SURNAME|FAMILY\s*NAME|APELLIDOS|COGNOME|NACHNAME|SOBRENOME|ACHTERNAAM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:1\.\s*)?(?:SURNAME|FAMILY|NOM\s*DE\s*FAMILLE)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:FAMILY\s+NAME|NOM\s+DE\s+FAMILLE)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        // FORMATS COURTS UNIVERSELS
        /(?:NOM|NOME|APELLIDO|SURNAME|LAST\s*NAME|FAMILIA)\s+([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:NOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i  // Français très simple
      ];
      
      for (const pattern of surnamePatterns) {
        const surnameMatch = line.match(pattern);
        if (surnameMatch && surnameMatch[1]) {
          const candidate = safeStringTrim(surnameMatch[1]);
          if (candidate.length >= 2 && /^[A-ZÀ-ÿ\s]+$/.test(candidate)) {
            passportData.nom = candidate;
            console.log("✅ Nom extrait (pattern fallback universel):", passportData.nom);
            break;
          }
        }
      }
      
      // Pattern alternatif: ligne avec lettres majuscules (potentiel nom)
      // Exclusions universelles
      if (!passportData.nom && /^[A-ZÀ-ÿ]{5,20}$/.test(line.trim()) && 
          !['PASSPORT', 'PASSEPORT', 'REPUBLIC', 'KINGDOM', 'NATIONALITY', 'CANADA', 'CANADIAN', 'MAR', 
            'DEUTSCH', 'FRANCE', 'ESPAÑA', 'ITALIA', 'BRASIL', 'NEDERLAND'].includes(line.trim())) {
        passportData.nom = line.trim();
        console.log("✅ Nom extrait (pattern isolé universel):", passportData.nom);
      }
    }
    
    // Extraction du prénom (FALLBACK universel)
    if (!passportData.prenom) {
      console.log("👤 Recherche du prénom (fallback universel)...");
      
      const givenPatterns = [
        /(?:GIVEN\s*NAMES?|FIRST\s*NAMES?|PRENOMS?|NOMBRE|NOME|VORNAME|VOORNAAM|PRIMEIRO\s*NOME)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:2\.\s*)?(?:GIVEN|FIRST|PRÉNOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:GIVEN\s+NAMES?|FIRST\s+NAMES?)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        // FORMATS COURTS UNIVERSELS
        /(?:PRENOM|PRENOMST|NOME|NAME|FIRST|GIVEN)\s+([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:PRENOM|PRÉNOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i  // Français très simple
      ];
      
      for (const pattern of givenPatterns) {
        const givenMatch = line.match(pattern);
        if (givenMatch && givenMatch[1]) {
          const candidate = safeStringTrim(givenMatch[1]);
          if (candidate.length >= 2 && /^[A-ZÀ-ÿ\s]+$/.test(candidate)) {
            passportData.prenom = candidate;
            console.log("✅ Prénom extrait (pattern fallback universel):", passportData.prenom);
            break;
          }
        }
      }
    }
    
    // Extraction de la nationalité (FALLBACK universel)
    if (!passportData.nationalite) {
      console.log("🌍 Recherche de la nationalité (fallback universel)...");
      
      // Vérifier les patterns de nationalité dans la ligne
      const nationalityFromLine = checkForNationalityInLine(line);
      if (nationalityFromLine) {
        passportData.nationalite = normalizeNationality(nationalityFromLine);
        console.log("✅ Nationalité extraite (fallback universel):", passportData.nationalite);
      }
      
      // Patterns spécifiques universels pour NATIONALITY
      const nationalityPatterns = [
        /(?:NATIONALITY|NATIONALITÉ|NACIONALIDAD|NAZIONALITÀ|STAATSANGEHÖRIGKEIT|NATIONALITEIT|NACIONALIDADE|NANIONALTON|CITIZENSHIP|CITIZEN\s*OF)\s*[\/:]?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:3\.\s*)?(?:NATIONALITY|NATIONALITÉ|CITIZENSHIP)\s*[\/:]?\s*([A-ZÀ-ÿ\s\/]{3,30})/i
      ];
      
      for (const pattern of nationalityPatterns) {
        const nationalityMatch = line.match(pattern);
        if (nationalityMatch && nationalityMatch[1]) {
          const convertedNationality = convertMainTextNationality(nationalityMatch[1]);
          passportData.nationalite = normalizeNationality(convertedNationality);
          console.log("✅ Nationalité extraite (pattern fallback universel):", passportData.nationalite);
          break;
        }
      }
    }
    
    // Extraction du numéro de document (FALLBACK universel)
    if (!passportData.numero_passeport) {
      console.log("🔢 Recherche du numéro de document (fallback universel)...");
      
      const passportPatterns = [
        /(?:PASSPORT\s*NO|PASSPORT\s*NUMBER|PASSEPORT\s*N°|NO\s*PASSEPORT|DOCUMENT\s*NO|DOCUMENTO\s*N|PASSAPORTO\s*N|NUMÉRO|NÚMERO|NUMERO|PASPOORTNUMMER)\s*[:\s]*([A-Z0-9]{6,15})/i,
        /(?:4\.\s*)?(?:PASSPORT\s*NO|DOCUMENT\s*NO)\s*[:\s]*([A-Z0-9]{6,15})/i,
        /\b([A-Z]{1,3}\d{6,9})\b/g,  // Pattern alphanumérique universel
        /\b(\d{8,12})\b/g            // Pattern numérique long universel
      ];
      
      for (const pattern of passportPatterns) {
        const passportMatch = line.match(pattern);
        if (passportMatch && passportMatch[1]) {
          const candidate = safeStringTrim(passportMatch[1]);
          if (candidate.length >= 6) {
            passportData.numero_passeport = candidate;
            console.log("✅ Numéro document extrait (fallback universel):", passportData.numero_passeport);
            break;
          }
        }
      }
    }
  }
  
  console.log("📋 === RÉSULTAT EXTRACTION UNIVERSELLE ===");
  console.log("📋 Nom:", passportData.nom || "NON TROUVÉ");
  console.log("📋 Prénom:", passportData.prenom || "NON TROUVÉ");
  console.log("📋 Nationalité:", passportData.nationalite || "NON TROUVÉ");
  console.log("📋 N° Document:", passportData.numero_passeport || "NON TROUVÉ");
  console.log("🌍 === SUPPORT UNIVERSEL ACTIVÉ ===");
};