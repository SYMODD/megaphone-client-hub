import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizeNationality } from '@/utils/nationalityNormalizer';
import { nationalities } from '@/data/nationalities';

interface AuditIssue {
  clientId: string;
  field: string;
  type: 'missing' | 'invalid' | 'formatting';
  description: string;
  currentValue: any;
  suggestedValue?: any;
  autoFixable: boolean;
}

interface AuditSummary {
  totalClients: number;
  clientsWithIssues: number;
  issuesByType: Record<string, number>;
  autoFixableCount: number;
  manualReviewCount: number;
}

export const useClientAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditIssue[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * 🔍 AUDIT COMPLET - Analyse tous les clients
   */
  const runFullAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    const issues: AuditIssue[] = [];

    try {
      console.log('🚀 Début audit complet des clients...');

      // Récupérer tous les clients
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('date_enregistrement', { ascending: false });

      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      if (!clients || clients.length === 0) {
        console.log('⚠️ Aucun client trouvé');
        return;
      }

      console.log(`📊 Audit de ${clients.length} clients...`);

      // Auditer chaque client
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        const clientIssues = auditSingleClient(client);
        issues.push(...clientIssues);

        // Mise à jour du progrès
        const progress = Math.round(((i + 1) / clients.length) * 100);
        setProgress(progress);

        // Log progress
        if ((i + 1) % 50 === 0 || i === clients.length - 1) {
          console.log(`📈 Progression: ${i + 1}/${clients.length} clients (${progress}%)`);
        }
      }

      // Générer le résumé
      const summary = generateSummary(clients.length, issues);
      
      setAuditResults(issues);
      setAuditSummary(summary);

      console.log('✅ Audit terminé:', summary);

    } catch (error) {
      console.error('❌ Erreur audit:', error);
      throw error;
    } finally {
      setIsAuditing(false);
      setProgress(100);
    }
  };

  /**
   * 🔍 AUDIT INDIVIDUEL - Analyse un client
   */
  const auditSingleClient = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];

    // 1. AUDIT NATIONALITÉ
    issues.push(...auditNationality(client));

    // 2. AUDIT NOMS
    issues.push(...auditNames(client));

    // 3. AUDIT DOCUMENTS
    issues.push(...auditDocuments(client));

    // 4. AUDIT DATES
    issues.push(...auditDates(client));

    // 5. AUDIT TÉLÉPHONES
    issues.push(...auditPhones(client));

    return issues;
  };

  /**
   * 🌍 AUDIT NATIONALITÉ
   */
  const auditNationality = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];



    // Nationalité manquante
    if (!client.nationalite || client.nationalite.trim() === '') {
      issues.push({
        clientId: client.id,
        field: 'nationalite',
        type: 'missing',
        description: 'Nationalité manquante',
        currentValue: client.nationalite,
        suggestedValue: 'Maroc', // Défaut pour CIN marocaines
        autoFixable: false
      });
      return issues;
    }

    // 🎯 UTILISER UNIQUEMENT normalizeNationality (qui a tous les mappings)
    const normalizedNationality = normalizeNationality(client.nationalite);
    

    
    // Si la normalisation a changé la valeur, c'est qu'on a trouvé un mapping intelligent
    if (normalizedNationality !== client.nationalite) {
      issues.push({
        clientId: client.id,
        field: 'nationalite',
        type: 'invalid',
        description: `Nationalité "${client.nationalite}" non reconnue`,
        currentValue: client.nationalite,
        suggestedValue: normalizedNationality,
        autoFixable: true // Auto-corrigeable car normalizeNationality a trouvé un mapping
      });
      return issues;
    }

    // Si normalizeNationality n'a rien changé, vérifier si c'est dans la liste officielle
    if (!nationalities.includes(normalizedNationality)) {
      issues.push({
        clientId: client.id,
        field: 'nationalite',
        type: 'invalid',
        description: `Nationalité "${client.nationalite}" non reconnue`,
        currentValue: client.nationalite,
        suggestedValue: 'À définir manuellement',
        autoFixable: false
      });
      return issues;
    }

    // Dernière vérification : formatage simple
    if (client.nationalite !== normalizedNationality) {
      issues.push({
        clientId: client.id,
        field: 'nationalite',
        type: 'formatting',
        description: 'Format de nationalité à corriger',
        currentValue: client.nationalite,
        suggestedValue: normalizedNationality,
        autoFixable: true
      });
    }

    return issues;
  };

  /**
   * 👤 AUDIT NOMS
   */
  const auditNames = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];

    // Nom manquant
    if (!client.nom || client.nom.trim() === '') {
      issues.push({
        clientId: client.id,
        field: 'nom',
        type: 'missing',
        description: 'Nom manquant',
        currentValue: client.nom,
        autoFixable: false
      });
    }

    // Prénom manquant
    if (!client.prenom || client.prenom.trim() === '') {
      issues.push({
        clientId: client.id,
        field: 'prenom',
        type: 'missing',
        description: 'Prénom manquant',
        currentValue: client.prenom,
        autoFixable: false
      });
    }

    // Formatage nom avec correction OCR intelligente
    if (client.nom) {
      // Détecter les erreurs de code pays dans le nom
      if (isCountryCodeError(client.nom)) {
        issues.push({
          clientId: client.id,
          field: 'nom',
          type: 'invalid',
          description: `Le nom "${client.nom}" ressemble à un code pays - probablement une erreur de saisie`,
          currentValue: client.nom,
          suggestedValue: 'À corriger manuellement',
          autoFixable: false
        });
      } else {
        // Utiliser le formatage intelligent avec correction OCR
        const intelligentNom = intelligentNameFormatting(client.nom);
        if (client.nom !== intelligentNom) {
          issues.push({
            clientId: client.id,
            field: 'nom',
            type: 'formatting',
            description: 'Format du nom à corriger (avec correction OCR)',
            currentValue: client.nom,
            suggestedValue: intelligentNom,
            autoFixable: true
          });
        }
      }
    }

    // Formatage prénom avec correction OCR intelligente
    if (client.prenom) {
      // Détecter les erreurs de code pays dans le prénom
      if (isCountryCodeError(client.prenom)) {
        issues.push({
          clientId: client.id,
          field: 'prenom',
          type: 'invalid',
          description: `Le prénom "${client.prenom}" ressemble à un code pays - probablement une erreur de saisie`,
          currentValue: client.prenom,
          suggestedValue: 'À corriger manuellement',
          autoFixable: false
        });
      } else {
        // Utiliser le formatage intelligent avec correction OCR
        const intelligentPrenom = intelligentNameFormatting(client.prenom);
        if (client.prenom !== intelligentPrenom) {
          issues.push({
            clientId: client.id,
            field: 'prenom',
            type: 'formatting',
            description: 'Format du prénom à corriger (avec correction OCR)',
            currentValue: client.prenom,
            suggestedValue: intelligentPrenom,
            autoFixable: true
          });
        }
      }
    }

    return issues;
  };

  /**
   * 🔧 CORRECTION INTELLIGENTE DES DOCUMENTS
   */
  const correctDocumentNumber = (docNumber: string): string => {
    if (!docNumber) return docNumber;
    
    return docNumber
      // Supprime les caractères parasites courants
      .replace(/[®©™\+\•\*\-\s\.]/g, '')
      
      // Corrections OCR pour les documents
      .replace(/O/g, '0')    // O → 0
      .replace(/I/g, '1')    // I → 1
      .replace(/S/g, '5')    // S → 5
      .replace(/B/g, '8')    // B → 8
      .replace(/G/g, '6')    // G → 6
      
      // Met en majuscules et supprime caractères invalides
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .trim();
  };

  /**
   * 📄 AUDIT DOCUMENTS AMÉLIORÉ
   */
  const auditDocuments = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];

    if (!client.numero_passeport || client.numero_passeport.trim() === '') {
      issues.push({
        clientId: client.id,
        field: 'numero_passeport',
        type: 'missing',
        description: 'Numéro de document manquant',
        currentValue: client.numero_passeport,
        autoFixable: false
      });
    } else {
      // Utiliser la correction intelligente
      const correctedNumber = correctDocumentNumber(client.numero_passeport);
      
      // Patterns valides pour les documents
      const documentPatterns = [
        /^[A-Z]{1,2}\d{6,8}$/,    // Format standard: A1234567
        /^\d{8,9}$/,              // Format numérique pur
        /^[A-Z]\d{7,8}$/          // Format mixte simple
      ];
      
      const isValidOriginal = documentPatterns.some(pattern => pattern.test(client.numero_passeport.replace(/[^A-Z0-9]/g, '')));
      const isValidCorrected = documentPatterns.some(pattern => pattern.test(correctedNumber));
      
      if (!isValidOriginal && isValidCorrected && correctedNumber !== client.numero_passeport) {
        // Correction OCR possible
        issues.push({
          clientId: client.id,
          field: 'numero_passeport',
          type: 'formatting',
          description: 'Format du numéro de document à corriger (correction OCR)',
          currentValue: client.numero_passeport,
          suggestedValue: correctedNumber,
          autoFixable: true
        });
      } else if (client.numero_passeport !== correctedNumber && correctedNumber.length >= 6) {
        // Correction de formatage simple
        issues.push({
          clientId: client.id,
          field: 'numero_passeport',
          type: 'formatting',
          description: 'Format du numéro de document à corriger',
          currentValue: client.numero_passeport,
          suggestedValue: correctedNumber,
          autoFixable: true
        });
      } else if (correctedNumber.length < 6) {
        // Trop court même après correction
        issues.push({
          clientId: client.id,
          field: 'numero_passeport',
          type: 'invalid',
          description: 'Numéro de document trop court',
          currentValue: client.numero_passeport,
          suggestedValue: 'À vérifier manuellement',
          autoFixable: false
        });
      }
    }

    return issues;
  };

  /**
   * 📅 AUDIT DATES
   */
  const auditDates = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];

    if (client.date_naissance && !isValidDate(client.date_naissance)) {
      issues.push({
        clientId: client.id,
        field: 'date_naissance',
        type: 'invalid',
        description: 'Format de date de naissance invalide',
        currentValue: client.date_naissance,
        autoFixable: false
      });
    }

    if (client.date_expiration && !isValidDate(client.date_expiration)) {
      issues.push({
        clientId: client.id,
        field: 'date_expiration',
        type: 'invalid',
        description: 'Format de date d\'expiration invalide',
        currentValue: client.date_expiration,
        autoFixable: false
      });
    }

    return issues;
  };

  /**
   * 📞 AUDIT TÉLÉPHONES
   */
  const auditPhones = (client: any): AuditIssue[] => {
    const issues: AuditIssue[] = [];

    if (client.numero_telephone && !isValidPhoneNumber(client.numero_telephone)) {
      const cleanedPhone = cleanPhoneNumber(client.numero_telephone);
      
      issues.push({
        clientId: client.id,
        field: 'numero_telephone',
        type: 'invalid',
        description: 'Format de numéro de téléphone invalide',
        currentValue: client.numero_telephone,
        suggestedValue: cleanedPhone,
        autoFixable: cleanedPhone !== client.numero_telephone
      });
    }

    return issues;
  };

  /**
   * 🔧 CORRECTIF AUTOMATIQUE
   */
  const applyAutoFixes = async () => {
    const autoFixableIssues = auditResults.filter(issue => issue.autoFixable);
    
    if (autoFixableIssues.length === 0) {
      console.log('⚠️ Aucune correction automatique disponible');
      return;
    }

    console.log(`🔧 Application de ${autoFixableIssues.length} corrections automatiques...`);

    // Grouper par client
    const updatesByClient = autoFixableIssues.reduce((acc, issue) => {
      if (!acc[issue.clientId]) {
        acc[issue.clientId] = {};
      }
      acc[issue.clientId][issue.field] = issue.suggestedValue;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Appliquer les corrections
    const updatePromises = Object.entries(updatesByClient).map(([clientId, updates]) => {
      return supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);
    });

    try {
      await Promise.all(updatePromises);
      console.log('✅ Corrections automatiques appliquées');
      
      // Relancer l'audit pour voir les améliorations
      await runFullAudit();
    } catch (error) {
      console.error('❌ Erreur lors des corrections:', error);
      throw error;
    }
  };

  // === UTILITAIRES ===



  const cleanName = (name: string): string => {
    return name
      .trim()
      .replace(/[®©™\+\•\*]/g, '')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  // Fonction pour détecter les erreurs de saisie (codes pays dans les noms)
  const isCountryCodeError = (name: string): boolean => {
    const countryCodes = [
      'IRL', 'USA', 'UK', 'UAE', 'GBR', 'FRA', 'ESP', 'ITA', 'DEU', 'NLD', 'BEL', 'CHE', 'CAN',
      'AUS', 'NZL', 'JPN', 'KOR', 'CHN', 'IND', 'BRA', 'ARG', 'MEX', 'RUS', 'POL', 'SWE', 'NOR'
    ];
    
    const trimmedName = name.trim().toUpperCase();
    return countryCodes.includes(trimmedName);
  };

  const isValidDate = (date: string): boolean => {
    return /^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}$/.test(date);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = cleanPhoneNumber(phone);
    
    // Formats étendus valides
    const patterns = [
      /^0[1-9]\d{8}$/,           // Format français: 0123456789
      /^\+33[1-9]\d{8}$/,        // Format français international: +33123456789
      /^0[5-7]\d{8}$/,           // Format marocain: 0612345678
      /^\+212[5-7]\d{8}$/,       // Format marocain international: +212612345678
      /^\d{10}$/,                // Format générique 10 chiffres
      /^\+\d{10,15}$/            // Format international générique
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  };

  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return phone;
    
    let cleaned = phone
      // Supprime tous les espaces, tirets, points, parenthèses
      .replace(/[\s\-\.()]/g, '')
      
      // Corrections OCR communes
      .replace(/O/g, '0')    // O → 0
      .replace(/I/g, '1')    // I → 1
      .replace(/S/g, '5')    // S → 5
      .replace(/B/g, '8')    // B → 8
      
      // Supprime les caractères non numériques (sauf +)
      .replace(/[^0-9+]/g, '');
    
    // Si commence par 33 sans +, ajouter le +
    if (cleaned.startsWith('33') && !cleaned.startsWith('+') && cleaned.length >= 11) {
      cleaned = '+' + cleaned;
    }
    
    // Si commence par 212 sans +, ajouter le +
    if (cleaned.startsWith('212') && !cleaned.startsWith('+') && cleaned.length >= 12) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };

  const generateSummary = (totalClients: number, issues: AuditIssue[]): AuditSummary => {
    const clientsWithIssues = new Set(issues.map(issue => issue.clientId)).size;
    const issuesByType = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const autoFixableCount = issues.filter(issue => issue.autoFixable).length;
    const manualReviewCount = issues.length - autoFixableCount;

    return {
      totalClients,
      clientsWithIssues,
      issuesByType,
      autoFixableCount,
      manualReviewCount
    };
  };

  /**
   * 🔧 FONCTION DE CORRECTION OCR AVANCÉE
   * Corrige les erreurs OCR communes dans les noms et prénoms
   */
  const correctOCRErrors = (text: string): string => {
    if (!text) return text;
    
    // Corrections OCR communes spécifiques aux noms français/européens
    let corrected = text
      // Corrections chiffres → lettres
      .replace(/\b0(?=[a-z])/gi, 'O')      // 0livier → Olivier
      .replace(/\b1(?=[a-z])/gi, 'I')      // 1sabelle → Isabelle  
      .replace(/([a-z])0([a-z])/gi, '$1O$2') // Mar0c → Maroc, Nic0las → Nicolas
      .replace(/([a-z])1([a-z])/gi, '$1I$2') // Mar1e → Marie, Dom1nique → Dominique
      .replace(/5(?=t)/gi, 'S')            // 5tephane → Stephane
      .replace(/8(?=e)/gi, 'B')            // 8ernard → Bernard
      .replace(/3(?=e)/gi, 'E')            // 3lise → Elise
      
      // Corrections lettres → lettres (confusion OCR)
      .replace(/rn/g, 'm')                 // Arrnaud → Armaud → Arnaud
      .replace(/([A-Z])n([a-z])/g, '$1h$2') // Cnristine → Christine
      .replace(/cl(?=a|o|u)/gi, 'd')       // Claurle → Claude
      .replace(/([a-z])ii([a-z])/gi, '$1ll$2') // Miichel → Miichel → Michel
      
      // Corrections caractères spéciaux parasites
      .replace(/[®©™\+\•\*]+$/g, '')       // Supprime les caractères à la fin
      .replace(/[®©™\+\•\*]/g, '')         // Supprime les caractères dans le texte
      
      // Corrections spécifiques aux prénoms composés
      .replace(/([A-Z][a-z]+)-([a-z])/g, '$1-$2'.replace(/^(.)/, c => c.toUpperCase())) // jean-claude → Jean-Claude
      
      // Nettoyage final
      .trim();
    
    return corrected;
  };

  /**
   * 🎯 FORMATAGE INTELLIGENT DES NOMS
   * Applique le formatage correct + corrections OCR
   */
  const intelligentNameFormatting = (name: string): string => {
    if (!name) return name;
    
    // 1. Correction OCR d'abord
    const ocrCorrected = correctOCRErrors(name);
    
    // 2. Formatage standard ensuite
    return cleanName(ocrCorrected);
  };

  return {
    isAuditing,
    auditResults,
    auditSummary,
    progress,
    runFullAudit,
    applyAutoFixes
  };
}; 