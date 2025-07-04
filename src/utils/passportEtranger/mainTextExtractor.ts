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
    
    // PATTERN SÉQUENTIEL NUMÉRO DE PASSEPORT : Passport No./N° de passeport -> ligne suivante
    if (!passportData.numero_passeport && (
      lineUpper.includes('PASSPORT NO') ||
      lineUpper.includes('N° DE PASSEPORT') ||
      lineUpper.includes('DOCUMENT NO') ||
      lineUpper.includes('NUMERO PASSEPORT') ||
      lineUpper.includes('PASSEPORT N°')
    )) {
      console.log(`✅ Ligne indicatrice numéro document trouvée ligne ${i+1}:`, line);
      
      // Chercher dans les 3 lignes suivantes
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = safeStringTrim(lines[j]);
        console.log(`🔍 Ligne suivante candidat numéro (${j+1}):`, nextLine);
        
        // Pattern pour numéro de passeport (lettres + chiffres, 6-15 caractères)
        // Support spécial pour Nations Unies (format AUNB466734UN)
        if (nextLine && (/^[A-Z0-9]{6,15}$/i.test(nextLine) || /^[A-Z0-9]{4,12}[A-Z]{2,3}$/i.test(nextLine)) && 
            !['CANADA', 'CAN', 'USA', 'DEU', 'FRA', 'ESP', 'ITA', 'BEL', 'CHE', 'PASSPORT', 'PASSEPORT', 'UNITED', 'NATIONS'].includes(nextLine.toUpperCase())) {
          
          let passportNumber = nextLine.toUpperCase();
          
          // 🔧 CORRECTION CRITIQUE : Nettoyer les codes pays algériens mal collés
          if (passportNumber.endsWith('DZ') && passportNumber.length > 8) {
            // Si le numéro se termine par "DZ" et est long, c'est probablement "numéro + code pays"
            passportNumber = passportNumber.replace(/DZ$/i, '');
            console.log(`🔧 Code pays DZ retiré du numéro: "${nextLine}" → "${passportNumber}"`);
          } else if (passportNumber.endsWith('DZA') && passportNumber.length > 9) {
            // Si le numéro se termine par "DZA" et est long, c'est probablement "numéro + code pays"  
            passportNumber = passportNumber.replace(/DZA$/i, '');
            console.log(`🔧 Code pays DZA retiré du numéro: "${nextLine}" → "${passportNumber}"`);
          }
          
          // 🔧 CORRECTION OCR : G confondu avec 6 dans les numéros de passeports
          if (passportNumber.startsWith('6') && passportNumber.length >= 8 && /^6[A-Z]/.test(passportNumber)) {
            // Si le numéro commence par "6" suivi d'une lettre, c'est probablement "G" mal reconnu
            const correctedNumber = passportNumber.replace(/^6/, 'G');
            console.log(`🔧 Correction OCR G/6: "${passportNumber}" → "${correctedNumber}"`);
            passportNumber = correctedNumber;
          }
          
          // 🔧 CORRECTION BELGIQUE : Nettoyer formats belges avec caractères parasites  
          if (/^[G6][A-Z]\d{7,9}/.test(passportNumber)) {
            // Format belge : GC4322386 ou 6C4322386 (avec parasites possibles)
            const belgianMatch = passportNumber.match(/^([G6][A-Z]\d{7})/);
            if (belgianMatch) {
              const cleanNumber = belgianMatch[1].replace(/^6/, 'G'); // Corriger 6->G si nécessaire
              console.log(`🔧 Nettoyage format belge: "${passportNumber}" → "${cleanNumber}"`);
              passportNumber = cleanNumber;
            }
          }
          
          passportData.numero_passeport = passportNumber;
          console.log("✅ Numéro passeport extrait (pattern séquentiel):", passportData.numero_passeport);
          break;
        }
      }
    }
    
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
                              lineUpper.includes('NAAM/SUMAME') ||      // Belge/Néerlandais (erreur OCR)
                              // 🆕 FORMATS BELGES SPÉCIFIQUES  
                              lineUpper.includes('NAAM/') ||            // Néerlandais belge "Naam/"
                              lineUpper.includes('ACHTERNAAM/') ||      // Néerlandais complet
                              lineUpper.includes('FAMILIENAAM') ||      // Néerlandais "nom de famille"
                              lineUpper.includes('NAAM (') ||           // Format avec parenthèses
                              lineUpper.includes('1. SURNAME') ||       // Format numéroté belge
                              lineUpper.includes('1. NOM') ||           // Format numéroté français
                              // 🆕 FORMATS IRLANDAIS SPÉCIFIQUES
                              lineUpper.includes('SLOINNE') ||          // Irlandais : Nom de famille
                              lineUpper.includes('AINM TEAGHLAIGH') ||  // Irlandais : Nom de famille
                              lineUpper.includes('FAMILY') && !lineUpper.includes('NAME') || // Irlandais court
                              // FORMATS SUISSES
                              lineUpper.includes('NAME • NOS • COGNONE') || // Suisse multilingue
                              lineUpper.includes('SURNANE') ||          // Suisse (avec erreur OCR surname)
                              lineUpper.includes('NAME NUM') ||         // Suisse spécial (Name Num = Nom)
                              // FORMATS COURTS UNIVERSELS
                              (lineUpper.includes('NOM ') && !lineUpper.includes('PRENOM')) ||  // Français court
                              (lineUpper.includes('NAAM') && !lineUpper.includes('VOORAMEN')) || // Néerlandais court
                              (lineUpper.includes('NOME ') && !lineUpper.includes('COGNOME')) || // Italien court
                              lineUpper.includes('APELLIDO ') ||        // Espagnol court
                              lineUpper.includes('SURNAME ') ||         // Anglais court
                              lineUpper.includes('FAMILIA ') ||         // Variations
                              lineUpper.includes('LAST NAME'))) {       // Anglais alternatif
      console.log(`✅ Ligne indicatrice nom trouvée ligne ${i+1}:`, line);
      
      // Vérifier les 3 lignes suivantes pour le nom (pas seulement la première)
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = safeStringTrim(lines[j]);
        console.log(`🔍 Ligne suivante candidat nom (${j+1}):`, nextLine);
        
                    // EXCLUSIONS SPÉCIFIQUES pour éviter faux positifs
            const isExcluded = (
              /^[A-Z]{2}\d{6,9}$/.test(nextLine) ||  // Numéro passeport format AW320731
              /^\d+$/.test(nextLine) ||              // Numéros purs
              nextLine.includes('/') ||              // Lignes indicatrices avec /
              nextLine.includes('NAME') ||
              nextLine.includes('GIVEN') ||
              nextLine.includes('PASSPORT') ||
              nextLine.includes('REPUBLIC') ||
              // Exclure les lignes d'indicateurs suisses
              nextLine.includes('VORNANE(N)') ||
              nextLine.includes('PRÉNON[S)') ||
              nextLine.includes('PREMUSIS)') ||
              // 🆕 EXCLUSIONS LABELS SPÉCIFIQUES (éviter "PRÉNOMS", "PRENOMS", etc.)
              ['PRÉNOMS', 'PRENOMS', 'PRENOMST', 'GIVEN', 'NAMES', 'FORENAMES', 'FIRST'].includes(nextLine.toUpperCase()) ||
              // 🆕 EXCLUSIONS CODES PAYS ÉTENDUES (Inclure IRL pour éviter qu'il soit pris comme nom)
              ['COL', 'CAN', 'USA', 'DEU', 'FRA', 'ESP', 'ITA', 'BEL', 'SVK', 'POL', 'CZE', 'IRL', 'GBR', 'IND'].includes(nextLine)  // Codes pays étendus
            );
        
        // Nettoyer d'abord les caractères parasites pour le test
        let cleanName = nextLine.trim().replace(/[®©™\+\•]+$/g, '').trim();
        if (cleanName.startsWith('IN ')) {
          cleanName = cleanName.substring(3).trim();
        }
        
        // Nettoyer d'abord les caractères parasites pour le test
        const testLine = nextLine.replace(/[®©™\+\•]+$/g, '').trim();
        
        // DÉBOGAGE DÉTAILLÉ
        console.log(`🔍 Debug nom candidat "${nextLine}":`);
        console.log(`  - Longueur: ${nextLine.length}`);
        console.log(`  - testLine: "${testLine}"`);
        console.log(`  - Pattern test: ${/^[A-ZÀ-ÿ\s\-]+$/.test(testLine)}`);
        console.log(`  - isExcluded: ${isExcluded}`);
        console.log(`  - cleanName: "${cleanName}"`);
        console.log(`  - cleanNameLength: ${cleanName.length}`);
        
        // Tester avec la version nettoyée pour éviter les problèmes de regex avec caractères spéciaux
        if (nextLine && nextLine.length >= 2 && 
            /^[A-ZÀ-ÿ\s\-]+$/i.test(testLine) &&  // Pattern avec caractères accentués
            !isExcluded) {
          
                  if (cleanName.length >= 2) {
            passportData.nom = cleanName;
            console.log("✅ Nom extrait (pattern séquentiel):", passportData.nom);
            
            // Chercher le prénom dans les lignes suivantes (jusqu'à 5 lignes après le nom)
            if (!passportData.prenom) {
              console.log("🔍 Recherche du prénom après extraction du nom...");
              for (let k = j + 1; k < Math.min(j + 6, lines.length); k++) {
                const prenomLine = safeStringTrim(lines[k]);
                const testPrenomLine = prenomLine.replace(/[®©™\+\•]+$/g, '').trim();
                
                console.log(`🔍 Test prénom ligne ${k+1}: "${prenomLine}" -> "${testPrenomLine}"`);
                
                if (prenomLine && prenomLine.length >= 2 && 
                    /^[A-ZÀ-ÿ\s\-]+$/i.test(testPrenomLine) &&
                    !prenomLine.toUpperCase().includes('GIVEN') &&
                    !prenomLine.toUpperCase().includes('NAME') &&
                    !prenomLine.toUpperCase().includes('NATIONALITY') &&
                    !prenomLine.toUpperCase().includes('PASSPORT') &&
                    !prenomLine.toUpperCase().includes('REPOND') &&
                    !prenomLine.toUpperCase().includes('NAMEIN')) {
                  
                  passportData.prenom = testPrenomLine;
                  console.log("✅ Prénom extrait (après nom séquentiel):", passportData.prenom);
                  break;
                }
              }
            }
            // 🔧 CORRECTION CRITIQUE : Arrêter la recherche après avoir trouvé le premier nom valide !
            break;  // SORTIR DE LA BOUCLE DES LIGNES SUIVANTES - j loop
          }
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
                                lineUpper.includes('VOORAMEN/ GIVEN') || // Belge/Néerlandais
                                // 🆕 FORMATS BELGES SPÉCIFIQUES
                                lineUpper.includes('VOORNAAM/') ||      // Néerlandais belge "Voornaam/"
                                lineUpper.includes('VOORNAMEN/') ||     // Néerlandais pluriel
                                lineUpper.includes('GIVEN NAME(S)') ||  // Format anglais avec parenthèses  
                                lineUpper.includes('2. GIVEN') ||       // Format numéroté belge
                                lineUpper.includes('2. PRÉNOM') ||      // Format numéroté français
                                lineUpper.includes('2. PRENOM') ||      // Format numéroté sans accent
                                // 🆕 FORMATS IRLANDAIS SPÉCIFIQUES
                                lineUpper.includes('CÉAD AINM') ||       // Irlandais : Prénom
                                lineUpper.includes('AINMNEACHA') ||      // Irlandais : Prénoms
                                lineUpper.includes('FORENAME') ||        // Irlandais anglais
                                lineUpper.includes('FORENAMES') ||       // Irlandais anglais pluriel
                                // FORMATS SUISSES
                                lineUpper.includes('VORNANE(N)') ||      // Suisse allemand
                                lineUpper.includes('PRÉNON[S)') ||       // Suisse français (avec erreur OCR)
                                lineUpper.includes('PREMUSIS)') ||       // Suisse (avec erreur OCR)
                                // FORMATS COURTS UNIVERSELS
                                (lineUpper.includes('PRENOM') && !lineUpper.includes('PRENOMS')) ||  // Français court
                                lineUpper.includes('PRENOMST') ||       // OCR français imparfait
                                lineUpper.includes('NOME ') ||          // Italien court
                                (lineUpper.includes('NAME ') && !lineUpper.includes('NAME NUM')) ||          // Anglais court (exclure NAME NUM)
                                lineUpper.includes('FIRST ') ||         // Anglais très court
                                lineUpper.includes('GIVEN '))) {        // Anglais très court
      console.log(`✅ Ligne indicatrice prénom trouvée ligne ${i+1}:`, line);
      
      // Vérifier les 3 lignes suivantes pour le prénom (pas seulement la première)
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = safeStringTrim(lines[j]);
        console.log(`🔍 Ligne suivante candidat prénom (${j+1}):`, nextLine);
        
        // Nettoyer d'abord les caractères parasites pour le test
        let cleanPrenom = nextLine.trim().replace(/[®©™\+\•]+$/g, '').trim();
        
        // Tester avec la version nettoyée pour éviter les problèmes de regex avec caractères spéciaux
        const testPrenom = nextLine.replace(/[®©™\+\•]+$/g, '').trim();
        
        // EXCLUSIONS SPÉCIFIQUES POUR PRÉNOMS (éviter labels et mots-clés)
        const isPrenomExcluded = (
          nextLine.includes('NAME') || 
          nextLine.includes('GIVEN') ||
          nextLine.includes('PASSPORT') ||
          nextLine.includes('REPUBLIC') ||
          nextLine.includes('/') ||
          nextLine.includes('NATIONALITY') ||
          // 🆕 EXCLUSIONS LABELS SPÉCIFIQUES
          ['PRÉNOMS', 'PRENOMS', 'PRENOMST', 'GIVEN', 'NAMES', 'FORENAMES', 'FIRST', 'SURNAME', 'NOM'].includes(nextLine.toUpperCase())
        );
        
        if (nextLine && nextLine.length >= 2 && 
            /^[A-ZÀ-ÿ\s\-]+$/i.test(testPrenom) &&  // Pattern avec caractères accentués
            !isPrenomExcluded) {
          
          if (cleanPrenom.length >= 2) {
            passportData.prenom = cleanPrenom;
            console.log("✅ Prénom extrait (pattern séquentiel):", passportData.prenom);
            break;
          }
        }
      }
    }
    
    // PATTERN SÉQUENTIEL NATIONALITÉ : Nationality/Nation -> ligne suivante  
    // ✨ SUPPORT UNIVERSEL : Tous formats internationaux + détection directe ESPAÑOLA
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
                                     lineUpper.includes('CITIZEN OF') ||    // Anglais
                                     // 🆕 DÉTECTION DIRECTE NATIONALITÉS ISOLÉES
                                     lineUpper === 'ESPAÑOLA' ||            // Espagnol isolé
                                     lineUpper === 'ESPANOLA' ||            // Espagnol sans accent
                                     lineUpper === 'FRANÇAISE' ||           // Français isolé
                                     lineUpper === 'FRANCAISE' ||           // Français sans accent
                                     lineUpper === 'ITALIANA' ||            // Italien isolé
                                     lineUpper === 'DEUTSCHE' ||            // Allemand isolé
                                     lineUpper === 'PORTUGUESA' ||          // Portugais isolé
                                     lineUpper === 'ÉIREANNACH' ||          // Irlandais isolé
                                     lineUpper === 'EIREANNACH')) {         // Portugais isolé
      console.log(`✅ Ligne indicatrice nationalité trouvée ligne ${i+1}:`, line);
      
      // 🆕 CAS SPÉCIAL : Nationalité directe isolée (ESPAÑOLA, FRANÇAISE, etc.)
      if (lineUpper === 'ESPAÑOLA' || lineUpper === 'ESPANOLA' || 
          lineUpper === 'FRANÇAISE' || lineUpper === 'FRANCAISE' ||
          lineUpper === 'ITALIANA' || lineUpper === 'DEUTSCHE' || 
          lineUpper === 'PORTUGUESA' || lineUpper === 'NEDERLANDSE' ||
          lineUpper === 'NEDERLANDS' || lineUpper === 'HOLLAND' ||
          lineUpper === 'HOLLANDE' || lineUpper === 'SÉNÉGALAISE' ||
          lineUpper === 'SENEGALAISE' || lineUpper === 'MAROCAINE' ||
          lineUpper === 'MOROCAIN' || lineUpper === 'MAROC' ||
          lineUpper === 'ÉIREANNACH' || lineUpper === 'EIREANNACH') {
        console.log(`🎯 Nationalité isolée détectée directement: "${line}"`);
        const convertedNationality = convertMainTextNationality(line);
        passportData.nationalite = normalizeNationality(convertedNationality);
        console.log("✅ Nationalité extraite (détection directe):", passportData.nationalite);
      }
      // CAS STANDARD : Pattern séquentiel (NATIONALITY -> ligne suivante)
      else if (i + 1 < lines.length) {
        const nextLine = safeStringTrim(lines[i + 1]);
        console.log(`🔍 Ligne suivante candidat nationalité (${i+2}):`, nextLine);
        
        if (nextLine && nextLine.length >= 3 && 
            /^[A-ZÀ-ÿ\u00C0-\u017F\s\/]+$/.test(nextLine) &&  // Support accents étendus et caractères spéciaux européens
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
                                           // REISEPASS RETIRÉ - Cause confusion avec nom
                                           // lineUpper.includes('REISEPASS') ||
                                           lineUpper.includes('DOCUMENTO N') ||    // Espagnol
                                           lineUpper.includes('DOCUMENTO NO') ||   // Espagnol
                                           lineUpper.includes('PASSAPORTO N') ||   // Italien
                                           lineUpper.includes('N° PASSEPORT') ||   // Français
                                           lineUpper.includes('NUMÉRO') ||         // Français
                                           lineUpper.includes('NÚMERO') ||         // Espagnol/Portugais
                                           lineUpper.includes('NUMERO') ||         // Italien
                                           lineUpper.includes('PASPOORTNUMMER') || // Néerlandais
                                           lineUpper.includes('SPORT NO') ||       // Belge/Néerlandais
                                           (line.includes('•') && lineUpper.includes('PASSEPORT')))) {
      console.log(`✅ Ligne indicatrice numéro document trouvée ligne ${i+1}:`, line);
      
      // Vérifier les 3 lignes suivantes pour le numéro de document
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = safeStringTrim(lines[j]);
        console.log(`🔍 Ligne suivante candidat numéro (${j+1}):`, nextLine);
        
        // Pattern universel pour numéro de document
        const docCandidate = nextLine.match(/\b([A-Z0-9]+(?:\s+[A-Z0-9]+)*)\b/);
        console.log(`🔍 Debug numéro candidat "${nextLine}":`, {
          docCandidate: docCandidate ? docCandidate[1] : null,
          longueur: docCandidate ? docCandidate[1].length : 0,
          aDesChiffres: docCandidate ? /[0-9]/.test(docCandidate[1]) : false,
          pasPassport: docCandidate ? !docCandidate[1].includes('PASSPORT') : false,
          pasCodePays: docCandidate ? !['SVK', 'CAN', 'USA', 'DEU', 'FRA', 'ESP', 'ITA'].includes(docCandidate[1]) : false
        });
        
        // Debug supplémentaire pour AW550166
        if (nextLine.includes('AW550166')) {
          console.log(`🚨 TROUVÉ AW550166 ! Pattern test:`, {
            ligne: nextLine,
            match: docCandidate,
            pattern: /\b([A-Z0-9]+(?:\s+[A-Z0-9]+)*)\b/.exec(nextLine)
          });
        }
        
        if (docCandidate && docCandidate[1] && 
            docCandidate[1].length >= 6 && 
            /[0-9]/.test(docCandidate[1]) && 
            !docCandidate[1].includes('PASSPORT') &&
            !['SVK', 'CAN', 'USA', 'DEU', 'FRA', 'ESP', 'ITA'].includes(docCandidate[1])) {  // Exclure codes pays
          
          // Nettoyer le numéro (enlever les espaces)
          passportData.numero_passeport = docCandidate[1].replace(/\s+/g, '');
          console.log("✅ Numéro document extrait (pattern séquentiel):", passportData.numero_passeport);
          break;
        } else if (docCandidate && docCandidate[1]) {
          console.log("❌ Numéro candidat rejeté:", docCandidate[1]);
        }
      }
    }
  }
  
  console.log("🎯 PHASE 1 TERMINÉE - Résultats patterns séquentiels:");
  console.log("📋 Nom séquentiel:", passportData.nom || "NON TROUVÉ");
  console.log("📋 Prénom séquentiel:", passportData.prenom || "NON TROUVÉ");
  console.log("📋 Nationalité séquentielle:", passportData.nationalite || "NON TROUVÉ");
  console.log("📋 Numéro document séquentiel:", passportData.numero_passeport || "NON TROUVÉ");
  
  // ===== PHASE 2: PATTERNS DE FALLBACK UNIVERSELS =====
  console.log("🔄 PHASE 2 - Patterns de fallback universels...");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();
    console.log(`🔍 Analyse ligne ${i+1}:`, line);
    
    // Extraction du nom (FALLBACK universel)
    if (!passportData.nom) {
      console.log("👤 Recherche du nom (fallback universel)...");
      
      // PATTERN SPÉCIAL ALLEMAND : (a) NOM + lignes suivantes pour nom composé
      const germanSurnameMatch = line.match(/^\(a\)\s+([A-ZÀ-ÿ\s]{2,30})$/i);
      if (germanSurnameMatch && germanSurnameMatch[1]) {
        let candidate = safeStringTrim(germanSurnameMatch[1]);
        
        // Vérifier les 2 lignes suivantes pour des parties additionnelles du nom composé
        let fullName = candidate;
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = safeStringTrim(lines[j]);
          
          // Pattern pour partie additionnelle nom allemand (ex: I0 STOLLE)
          const additionalNameMatch = nextLine.match(/^(?:I\d\s+)?([A-ZÀ-ÿ\s]{2,30})$/);
          if (additionalNameMatch && additionalNameMatch[1]) {
            const additionalPart = safeStringTrim(additionalNameMatch[1]);
            if (additionalPart.length >= 2 && /^[A-ZÀ-ÿ\s]+$/.test(additionalPart) &&
                !additionalPart.match(/^\d+$/) && // Pas un numéro
                !additionalPart.includes('GIVEN') && // Pas le prénom
                !additionalPart.includes('VORNAMEN')) {
              fullName += " " + additionalPart;
              console.log(`✅ Partie additionnelle nom détectée ligne ${j+1}:`, additionalPart);
            }
          } else {
            // Arrêter si la ligne suivante n'est pas une partie du nom
            break;
          }
        }
        
        if (fullName.length >= 2 && /^[A-ZÀ-ÿ\s]+$/.test(fullName)) {
          passportData.nom = fullName;
          console.log("✅ Nom complet extrait (pattern allemand composé):", passportData.nom);
        }
      }
      
      // Patterns directs universels (formats longs ET courts) - BEAUCOUP PLUS RESTRICTIFS
      if (!passportData.nom) {
        const surnamePatterns = [
          /(?:SURNAME|FAMILY\s*NAME|APELLIDOS|COGNOME|NACHNAME|SOBRENOME|ACHTERNAAM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
          /(?:1\.\s*)?(?:SURNAME|FAMILY|NOM\s*DE\s*FAMILLE)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
          /(?:FAMILY\s+NAME|NOM\s+DE\s+FAMILLE)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
          // FORMATS COURTS UNIVERSELS - LIGNE DÉDIÉE SEULEMENT
          /^(?:APELLIDO|SURNAME|LAST\s*NAME|FAMILIA)\s+([A-ZÀ-ÿ\s]{2,30})$/i,
          // SUPPRIMER ce pattern trop agressif qui extrait "NOM" des étiquettes :
          // /(?:NOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i  // ❌ TROP AGRESSIF - SUPPRIMÉ
        ];
        
        for (const pattern of surnamePatterns) {
          const surnameMatch = line.match(pattern);
          if (surnameMatch && surnameMatch[1]) {
            let candidate = safeStringTrim(surnameMatch[1]);
            // Nettoyer caractères parasites (®, ©, etc.)
            candidate = candidate.replace(/[®©™]/g, '').trim();
            
            // AJOUTER EXCLUSIONS STRICTES pour éviter d'extraire des étiquettes
            const excludedTerms = ['NOM', 'SURNAME', 'FAMILY', 'GIVEN', 'NAMES', 'TRENCM', 'PRENOMS', 'PRENOM', 'APELLIDOS', 'SURAME'];
            const isExcluded = excludedTerms.some(term => 
              candidate.toUpperCase().includes(term.toUpperCase())
            );
            
            if (!isExcluded && candidate.length >= 2 && /^[A-ZÀ-ÿ\s\-]+$/.test(candidate)) {
              passportData.nom = candidate;
              console.log("✅ Nom extrait (pattern fallback universel):", passportData.nom);
              break;
            }
          }
        }
      }
      
      // Pattern alternatif: ligne avec lettres majuscules (potentiel nom)
      // Support caractères parasites (®, ©, etc.)
      const cleanLine = line.trim().replace(/[®©™]/g, '').trim();
      
      // Exclusions universelles ÉTENDUES
      if (!passportData.nom && /^[A-ZÀ-ÿ\-]{3,20}$/.test(cleanLine) && 
          !['PASSPORT', 'PASSEPORT', 'PASAPORTE', 'REISEPASS', 'REPUBLIC', 'KINGDOM', 'NATIONALITY', 'CANADA', 'CANADIAN', 'MAR', 
            'DEUTSCH', 'FRANCE', 'ESPAÑA', 'ITALIA', 'BRASIL', 'NEDERLAND', 'PASZPORT', 'FEDERALRE', 'FEDERAL',
            // EXCLUSIONS MOTS TECHNIQUES PASSPORTS
            'PASSEPORI', 'PASZPORT', 'PASPOORT', 'PASSPORT',
            // EXCLUSIONS CODES PAYS ISO (3 lettres) - TRÈS IMPORTANT
            'CHE', 'CAN', 'USA', 'DEU', 'FRA', 'ESP', 'ITA', 'BEL', 'SVK', 'POL', 'CZE', 'GBR', 'AUT', 'NLD', 'COL', 'BRA', 'PRT', 'RUS', 'CHN', 'JPN', 'FIN',
            // EXCLUSIONS MOTS TECHNIQUES SPÉCIAUX
            'FARM', 'CODE', 'TYPE', 'PASS', 'FORM',
            // EXCLUSIONS PRÉNOMS TRÈS FRÉQUENTS SEULEMENT
            'MARIE', 'ANNE', 'PIERRE', 'MICHEL', 'PHILIPPE', 'NICOLAS', 'LAURENT', 'DAVID',
            'STEPHANIE', 'CATHERINE', 'FRANCOISE', 'ISABELLE', 'MARTINE', 'CHRISTINE', 'DOMINIQUE', 'PATRICIA',
            // 🔧 EXCLUSIONS SPÉCIFIQUES POUR ÉVITER LES PRÉNOMS COMPOSÉS COMME NOM
            'JO-ANNIE', 'JEAN-CLAUDE', 'MARIE-CLAIRE', 'ANNE-MARIE', 'PIERRE-LOUIS',
            // 🆕 EXCLUSIONS PRÉNOMS INTERNATIONAUX COURTS COURANTS
            'ZIAD', 'OMAR', 'AHMED', 'SARA', 'LEILA', 'KARIM', 'NADIA', 'YOUSSEF', 'FATIMA', 'HASSAN'].includes(cleanLine.toUpperCase())) {
        
        passportData.nom = cleanLine;
        console.log("✅ Nom extrait (pattern isolé universel):", passportData.nom);
      }
      
      // Pattern spécial pour prénoms composés avec tirets (avec nettoyage parasites)
      if (!passportData.prenom && /^[A-ZÀ-ÿ\-®©™]{3,20}$/.test(line.trim()) && (line.includes('-') || line.includes('®'))) {
        // C'est probablement un prénom composé comme Jean-Claude® 
        const cleanPrenom = line.trim().replace(/[®©™]+$/g, '').trim();
        if (cleanPrenom.length >= 2) {
          passportData.prenom = cleanPrenom;
          console.log("✅ Prénom composé extrait (pattern isolé universel):", passportData.prenom);
        }
      }
    }
    
    // Extraction du prénom (FALLBACK universel)
    if (!passportData.prenom) {
      console.log("👤 Recherche du prénom (fallback universel)...");
      
      const givenPatterns = [
        /(?:GIVEN\s*NAMES?|FIRST\s*NAMES?|PRENOMS?|NOMBRE|NOME|VORNAME|VOORNAAM|PRIMEIRO\s*NOME)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:2\.\s*)?(?:GIVEN|FIRST|PRÉNOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        /(?:GIVEN\s+NAMES?|FIRST\s+NAMES?)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i,
        // FORMATS COURTS UNIVERSELS - LIGNE DÉDIÉE SEULEMENT
        /^(?:FIRST|GIVEN)\s+([A-ZÀ-ÿ\s]{2,30})$/i,
        // SUPPRIMER ces patterns trop agressifs qui extraient "TRENCM" des étiquettes :
        // /(?:PRENOM|PRENOMST|NOME|NAME|FIRST|GIVEN)\s+([A-ZÀ-ÿ\s]{2,30})/i,  // ❌ TROP AGRESSIF - SUPPRIMÉ
        // /(?:PRENOM|PRÉNOM)\s*[\/:]?\s*([A-ZÀ-ÿ\s]{2,30})/i  // ❌ TROP AGRESSIF - SUPPRIMÉ
      ];
      
              for (const pattern of givenPatterns) {
          const givenMatch = line.match(pattern);
          if (givenMatch && givenMatch[1]) {
            let candidate = safeStringTrim(givenMatch[1]);
            // Nettoyer caractères parasites (®, ©, etc.)
            candidate = candidate.replace(/[®©™]/g, '').trim();
            
            // AJOUTER EXCLUSIONS STRICTES pour éviter d'extraire des étiquettes
            const excludedTerms = ['GIVEN', 'NAMES', 'PRENOM', 'PRENOMS', 'TRENCM', 'JMENQ', 'FIRST', 'NOMBRES'];
            const isExcluded = excludedTerms.some(term => 
              candidate.toUpperCase().includes(term.toUpperCase())
            );
            
            if (!isExcluded && candidate.length >= 2 && /^[A-ZÀ-ÿ\s\-]+$/.test(candidate)) {
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
      
      // Patterns spécifiques universels pour NATIONALITY + détection directe nationalités  
      const nationalityPatterns = [
        /(?:NATIONALITY|NATIONALITÉ|NACIONALIDAD|NAZIONALITÀ|STAATSANGEHÖRIGKEIT|NATIONALITEIT|NACIONALIDADE|NANIONALTON|CITIZENSHIP|CITIZEN\s*OF)\s*[\/:]?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        /(?:3\.\s*)?(?:NATIONALITY|NATIONALITÉ|CITIZENSHIP)\s*[\/:]?\s*([A-ZÀ-ÿ\s\/]{3,30})/i,
        // 🆕 PATTERNS DIRECTS POUR NATIONALITÉS ISOLÉES OU AVEC PRÉFIXES  
        /\b(ESPAÑOLA|ESPANOLA|FRANÇAISE|FRANCAISE|ITALIANA|DEUTSCHE|PORTUGUESA|CANADIENNE|COLOMBIANA|BRASILEIRA|ÉIREANNACH|EIREANNACH)\b/i,
        // Pattern pour format "KINGDOM OF SPAIN" -> "ESPAÑOLA"
        /KINGDOM\s+OF\s+SPAIN|REIGN\s+OF\s+SPAIN|REINO\s+DE\s+ESPAÑA|REINO\s+DE\s+ESPANA/i
      ];
      
      // ÉVITER d'extraire des mots de la ligne indicatrice elle-même
      const excludeWords = ['NATIONALITY', 'NATIONALITÉ', 'NATIONALITE', 'CITIZENSHIP', 'CITIZEN', 'STATNE', 'OBTIANSTRO'];
      
              for (const pattern of nationalityPatterns) {
          const nationalityMatch = line.match(pattern);
          if (nationalityMatch && nationalityMatch[1]) {
            const candidate = safeStringTrim(nationalityMatch[1]);
            
            // Éviter d'extraire des mots-clés de la ligne indicatrice
            const isExcluded = excludeWords.some(word => 
              candidate.toUpperCase().includes(word.toUpperCase())
            );
            
            if (!isExcluded && candidate.length >= 3) {
              const convertedNationality = convertMainTextNationality(candidate);
              passportData.nationalite = normalizeNationality(convertedNationality);
              console.log("✅ Nationalité extraite (pattern fallback universel):", passportData.nationalite);
              break;
            }
          }
          // 🆕 GESTION SPÉCIALE POUR PATTERNS DIRECTS (ESPAÑOLA, etc.)
          else if (pattern.source.includes('ESPAÑOLA') && pattern.test(line)) {
            console.log("🇪🇸 Pattern direct ESPAÑOLA détecté dans:", line);
            const directMatch = line.match(pattern);
            if (directMatch && directMatch[1]) {
              const convertedNationality = convertMainTextNationality(directMatch[1]);
              passportData.nationalite = normalizeNationality(convertedNationality);
              console.log("✅ Nationalité extraite (pattern direct):", passportData.nationalite);
              break;
            }
          }
          // 🆕 GESTION SPÉCIALE POUR PATTERNS ROYAUME D'ESPAGNE
          else if (pattern.source.includes('KINGDOM') && pattern.test(line)) {
            console.log("👑 Pattern royaume d'Espagne détecté dans:", line);
            passportData.nationalite = "Espagne";
            console.log("✅ Nationalité extraite (royaume d'Espagne):", passportData.nationalite);
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
        // PATTERN SPÉCIAL ALLEMAND - CC J8MMNV2 (avec préfixe CC)
        /\b(CC\s?[A-Z0-9]{6,12})\b/i,  // Format allemand avec préfixe CC
        /\bCC\s+([A-Z0-9]{6,12})\b/i,  // Format allemand spécifique (fallback sans CC)
        // PATTERN SPÉCIAL FRANÇAIS - 18CF85006 (chiffres + lettres + chiffres)
        /\b(\d{2}[A-Z]{2}\d{5,6})\b/g, // Format français 18CF85006
        /\b([A-Z]{1,3}\d{6,9})\b/g,    // Pattern alphanumérique universel
        /\b([A-Z]{2}\d{7})\b/g,        // Pattern belge GA3987122
        /\b(\d{8,12})\b/g              // Pattern numérique long universel
      ];
      
      for (const pattern of passportPatterns) {
        const passportMatch = line.match(pattern);
        if (passportMatch && passportMatch[1]) {
          const candidate = safeStringTrim(passportMatch[1]);
          if (candidate.length >= 6) {
            // Nettoyer et normaliser le numéro (enlever espaces multiples, garder CC)
            passportData.numero_passeport = candidate.replace(/\s+/g, '');
            console.log("✅ Numéro document extrait (fallback universel):", passportData.numero_passeport);
            break;
          }
        }
      }
      
      // DÉTECTION LIGNE ISOLÉE : numéro de passeport seul sur une ligne
      if (!passportData.numero_passeport && 
          (/^[A-Z]{2}\d{7,9}/.test(line.trim()) ||        // Format belge GA3987122
           /^[A-Z]{3}\d{5,8}$/.test(line.trim()) ||        // Format suisse XOY28U44
           /^\d{2}[A-Z]{2}\d{5,6}$/.test(line.trim()) ||   // Format français 18CF85006
           /^6[A-Z]\d{6,8}$/.test(line.trim()) ||          // Format avec erreur OCR 6C5930791
           /^[G6][A-Z]\d{7}/.test(line.trim())) &&         // Format belge avec caractères parasites
          !['BEL', 'FRA', 'USA', 'CAN', 'DEU', 'CHE'].includes(line.trim())) {
        
        let isolatedNumber = line.trim();
        
        // 🔧 CORRECTION BELGIQUE : Nettoyer formats belges avec caractères parasites (en premier)
        if (/^[G6][A-Z]\d{7,9}/.test(isolatedNumber)) {
          const belgianIsolatedMatch = isolatedNumber.match(/^([G6][A-Z]\d{7})/);
          if (belgianIsolatedMatch) {
            isolatedNumber = belgianIsolatedMatch[1]; // Extraire seulement la partie propre
            console.log(`🔧 Nettoyage format belge isolé: "${line.trim()}" → "${isolatedNumber}"`);
          }
        }
        
        // 🔧 CORRECTION OCR : G confondu avec 6 dans les numéros isolés (après nettoyage)
        if (isolatedNumber.startsWith('6') && /^6[A-Z]/.test(isolatedNumber)) {
          const correctedIsolated = isolatedNumber.replace(/^6/, 'G');
          console.log(`🔧 Correction OCR G/6 (ligne isolée): "${isolatedNumber}" → "${correctedIsolated}"`);
          isolatedNumber = correctedIsolated;
        }
        
        passportData.numero_passeport = isolatedNumber;
        console.log("✅ Numéro document extrait (ligne isolée):", passportData.numero_passeport);
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