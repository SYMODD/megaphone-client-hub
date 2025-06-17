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
    
    // PATTERN SÉQUENTIEL NOM : Surname/Nom -> ligne suivante (formats multiples)
    if (!passportData.nom && (lineUpper.includes('SURNAME') || lineUpper.includes('/NOM') || 
                              lineUpper.includes('NAMO') || lineUpper.includes('SURANE'))) {
      console.log(`✅ Ligne indicatrice nom trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat nom (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 2 && 
            /^[A-Z\s]+$/.test(nextLine) && 
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
    
    // PATTERN SÉQUENTIEL PRÉNOM : Given Names/Prenoms -> ligne suivante
    if (!passportData.prenom && (lineUpper.includes('GIVEN NAMES') || 
                                lineUpper.includes('PRENOMS') || 
                                lineUpper.includes('PRENOM'))) {
      console.log(`✅ Ligne indicatrice prénom trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat prénom (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 2 && 
            /^[A-Z\s]+$/.test(nextLine) && 
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
    if (!passportData.nationalite && (lineUpper.includes('NATIONALITY') || 
                                     lineUpper.includes('/NATION') ||
                                     lineUpper.includes('NANIONALTON'))) {
      console.log(`✅ Ligne indicatrice nationalité trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat nationalité (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 3 && 
            /^[A-Z\s\/]+$/.test(nextLine) && 
            !nextLine.includes('DATE') && 
            !nextLine.includes('BIRTH')) {
          
          // CORRECTION : Utiliser d'abord convertMainTextNationality
          const convertedNationality = convertMainTextNationality(nextLine);
          passportData.nationalite = normalizeNationality(convertedNationality);
          console.log("✅ Nationalité extraite (pattern séquentiel):", passportData.nationalite);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL NUMÉRO PASSEPORT : Passport No -> ligne suivante (formats spécifiques)
    if (!passportData.numero_passeport && (lineUpper.includes('PASSPORT NO') || 
                                           lineUpper.includes('PASSEPORT NU') ||
                                           lineUpper.includes('PASSEPORT N') ||
                                           lineUpper.includes('PASS-NR') ||
                                           lineUpper.includes('REISEPASS') ||
                                           (line.includes('•') && lineUpper.includes('PASSEPORT')))) {
      console.log(`✅ Ligne indicatrice numéro passeport trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat numéro (${i+2}):`, nextLine);
        
        // Pattern spécifique pour numéro de passeport (éviter les mots)
        const passportCandidate = nextLine.match(/\b([A-Z0-9]+(?:\s+[A-Z0-9]+)*)\b/);
        if (passportCandidate && passportCandidate[1] && 
            passportCandidate[1].length >= 6 && 
            /[0-9]/.test(passportCandidate[1]) && 
            !passportCandidate[1].includes('PASSPORT')) {
          
          // Nettoyer le numéro (enlever les espaces)
          passportData.numero_passeport = passportCandidate[1].replace(/\s+/g, '');
          console.log("✅ Numéro passeport extrait (pattern séquentiel):", passportData.numero_passeport);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL DATE NAISSANCE : Date of birth -> ligne suivante
    if (!passportData.date_naissance && lineUpper.includes('DATE OF BIRTH')) {
      console.log(`✅ Ligne indicatrice date naissance trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        console.log(`🔍 Ligne suivante candidat date naissance (${i+2}):`, nextLine);
        
        const birthCandidate = nextLine.match(/(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/);
        if (birthCandidate && birthCandidate[1]) {
          passportData.date_naissance = birthCandidate[1];
          console.log("✅ Date naissance extraite (pattern séquentiel):", passportData.date_naissance);
        }
      }
    }
    
    // PATTERN SÉQUENTIEL DATE EXPIRATION : Date of expiry -> ligne suivante
    if (!passportData.date_expiration && lineUpper.includes('DATE OF EXPIRY')) {
      console.log(`✅ Ligne indicatrice date expiration trouvée ligne ${i+1}:`, line);
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        console.log(`🔍 Ligne suivante candidat date expiration (${i+2}):`, nextLine);
        
        const expiryCandidate = nextLine.match(/(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/);
        if (expiryCandidate && expiryCandidate[1]) {
          passportData.date_expiration = expiryCandidate[1];
          console.log("✅ Date expiration extraite (pattern séquentiel):", passportData.date_expiration);
        }
      }
    }
  }
  
  console.log("🎯 PHASE 1 TERMINÉE - Résultats patterns séquentiels:");
  console.log("📋 Nom séquentiel:", passportData.nom || "NON TROUVÉ");
  console.log("📋 Prénom séquentiel:", passportData.prenom || "NON TROUVÉ");
  console.log("📋 Nationalité séquentielle:", passportData.nationalite || "NON TROUVÉ");
  
  // ===== PHASE 2: PATTERNS DE FALLBACK (seulement si pas trouvé en Phase 1) =====
  console.log("🔄 PHASE 2 - Patterns de fallback pour champs manquants...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();
    console.log(`🔍 Analyse ligne ${i+1}:`, line);
    
    // Extraction du nom (FALLBACK seulement si pas trouvé)
    if (!passportData.nom) {
      console.log("👤 Recherche du nom (fallback)...");
      
      // Patterns directs
      const surnamePatterns = [
        /(?:SURNAME|FAMILY\s*NAME)\s*[\/:]?\s*([A-Z\s]{2,30})/i,
        /(?:1\.\s*)?(?:SURNAME|FAMILY)\s*[\/:]?\s*([A-Z\s]{2,30})/i,
        /FAMILY\s+NAME\s*[\/:]?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of surnamePatterns) {
        const surnameMatch = line.match(pattern);
        if (surnameMatch && surnameMatch[1]) {
          const candidate = safeStringTrim(surnameMatch[1]);
          if (candidate.length >= 2 && /^[A-Z\s]+$/.test(candidate)) {
            passportData.nom = candidate;
            console.log("✅ Nom extrait du texte principal (pattern fallback):", passportData.nom);
            break;
          }
        }
      }
      
      // Pattern alternatif: ligne avec seulement des lettres majuscules (potentiel nom)
      // MAIS EXCLURE LES MOTS COMMUNS DES PASSEPORTS
      if (!passportData.nom && /^[A-Z]{5,20}$/.test(line.trim()) && 
          !['PASSPORT', 'PASSEPORT', 'REPUBLIC', 'KINGDOM', 'NATIONALITY', 'CANADA', 'CANADIAN'].includes(line.trim())) {
        passportData.nom = line.trim();
        console.log("✅ Nom extrait (pattern isolé fallback):", passportData.nom);
      }
    }
    
    // Extraction du prénom (FALLBACK seulement si pas trouvé)
    if (!passportData.prenom) {
      console.log("👤 Recherche du prénom (fallback)...");
      
      const givenPatterns = [
        /(?:GIVEN\s*NAMES?|FIRST\s*NAME|PRINOMA|PRENOM)\s*[\/:]?\s*([A-Z\s]{2,30})/i,
        /(?:2\.\s*)?(?:GIVEN|FIRST)\s*[\/:]?\s*([A-Z\s]{2,30})/i,
        /GIVEN\s+NAMES?\s*[\/:]?\s*([A-Z\s]{2,30})/i
      ];
      
      for (const pattern of givenPatterns) {
        const givenMatch = line.match(pattern);
        if (givenMatch && givenMatch[1]) {
          const candidate = safeStringTrim(givenMatch[1]);
          if (candidate.length >= 2 && /^[A-Z\s]+$/.test(candidate)) {
            passportData.prenom = candidate;
            console.log("✅ Prénom extrait du texte principal (pattern fallback):", passportData.prenom);
            break;
          }
        }
      }
    }
    
    // Extraction de la nationalité (FALLBACK seulement si pas trouvé)
    if (!passportData.nationalite) {
      console.log("🌍 Recherche de la nationalité (fallback)...");
      
      // Vérifier les patterns de nationalité dans la ligne
      const nationalityFromLine = checkForNationalityInLine(line);
      if (nationalityFromLine) {
        passportData.nationalite = normalizeNationality(nationalityFromLine);
        console.log("✅ Nationalité extraite du texte principal (fallback):", passportData.nationalite);
      }
      
      // Patterns spécifiques pour NATIONALITY
      const nationalityPatterns = [
        /(?:NATIONALITY|NATIONALITE|CITIZEN\s*OF)\s*[\/:]?\s*([A-Z\s\/]{3,30})/i,
        /(?:3\.\s*)?(?:NATIONALITY)\s*[\/:]?\s*([A-Z\s\/]{3,30})/i
      ];
      
      for (const pattern of nationalityPatterns) {
        const nationalityMatch = line.match(pattern);
        if (nationalityMatch && nationalityMatch[1]) {
          // CORRECTION : Utiliser convertMainTextNationality
          const convertedNationality = convertMainTextNationality(nationalityMatch[1]);
          passportData.nationalite = normalizeNationality(convertedNationality);
          console.log("✅ Nationalité extraite (pattern fallback):", passportData.nationalite);
          break;
        }
      }
    }
    
    // Extraction du numéro de passeport (FALLBACK seulement si pas trouvé)
    if (!passportData.numero_passeport) {
      console.log("🔢 Recherche du numéro de passeport (fallback)...");
      
      const passportPatterns = [
        /(?:PASSPORT\s*NO|PASSEPORT\s*N°|NO\s*PASSEPORT|DOCUMENT\s*NO)\s*[:\s]*([A-Z0-9]{6,15})/i,
        /(?:4\.\s*)?(?:PASSPORT\s*NO)\s*[:\s]*([A-Z0-9]{6,15})/i,
        /\b([A-Z]{1,2}\d{6,9})\b/g,  // Pattern alphanumérique
        /\b(\d{8,10})\b/g            // Pattern numérique long
      ];
      
      for (const pattern of passportPatterns) {
        const passportMatch = line.match(pattern);
        if (passportMatch && passportMatch[1]) {
          const candidate = safeStringTrim(passportMatch[1]);
          if (candidate.length >= 6) {
            passportData.numero_passeport = candidate;
            console.log("✅ Numéro passeport extrait (fallback):", passportData.numero_passeport);
            break;
          }
        }
      }
    }
    
    // Extraction de la date de naissance (FALLBACK seulement si pas trouvé)
    if (!passportData.date_naissance) {
      console.log("📅 Recherche de la date de naissance (fallback)...");
      
      const birthDatePatterns = [
        /(?:DATE\s*OF\s*BIRTH|NEE?\s*LE|BORN\s*ON)\s*[:\s]*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:5\.\s*)?(?:DATE\s*OF\s*BIRTH)\s*[:\s]*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})\b/g
      ];
      
      for (const pattern of birthDatePatterns) {
        const birthMatch = line.match(pattern);
        if (birthMatch && birthMatch[1]) {
          passportData.date_naissance = birthMatch[1];
          console.log("✅ Date naissance extraite (fallback):", passportData.date_naissance);
          break;
        }
      }
    }
    
    // Extraction de la date d'expiration (FALLBACK seulement si pas trouvé)
    if (!passportData.date_expiration) {
      console.log("📅 Recherche de la date d'expiration (fallback)...");
      
      const expiryPatterns = [
        /(?:DATE\s*OF\s*EXPIRY|EXPIRE|VALID\s*UNTIL|EXPIRES)\s*[:\s]*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i,
        /(?:6\.\s*)?(?:DATE\s*OF\s*EXPIRY)\s*[:\s]*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4})/i
      ];
      
      for (const pattern of expiryPatterns) {
        const expiryMatch = line.match(pattern);
        if (expiryMatch && expiryMatch[1]) {
          passportData.date_expiration = expiryMatch[1];
          console.log("✅ Date expiration extraite (fallback):", passportData.date_expiration);
          break;
        }
      }
    }
  }
  
  console.log("📋 === RÉSULTAT EXTRACTION TEXTE PRINCIPAL ===");
  console.log("📋 Nom:", passportData.nom || "NON TROUVÉ");
  console.log("📋 Prénom:", passportData.prenom || "NON TROUVÉ");
  console.log("📋 Nationalité:", passportData.nationalite || "NON TROUVÉ");
  console.log("📋 N° Passeport:", passportData.numero_passeport || "NON TROUVÉ");
  console.log("📋 Date naissance:", passportData.date_naissance || "NON TROUVÉ");
  console.log("📋 Date expiration:", passportData.date_expiration || "NON TROUVÉ");
};