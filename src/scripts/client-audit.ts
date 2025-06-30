import { createClient } from '@supabase/supabase-js';
import { normalizeNationality } from '../utils/nationalityNormalizer';
import { nationalities } from '../data/nationalities';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ClientAuditResult {
  clientId: string;
  nom: string;
  prenom: string;
  issues: AuditIssue[];
  severity: 'low' | 'medium' | 'high';
  suggestedFixes: SuggestedFix[];
}

interface AuditIssue {
  field: string;
  type: 'missing' | 'invalid' | 'formatting' | 'inconsistent';
  description: string;
  currentValue: any;
  confidence: number;
}

interface SuggestedFix {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  confidence: number;
  autoApplicable: boolean;
}

export class ClientAuditor {
  private auditResults: ClientAuditResult[] = [];
  private statistics = {
    totalClients: 0,
    clientsWithIssues: 0,
    issuesByType: {} as Record<string, number>,
    issuesByField: {} as Record<string, number>,
    autoFixableIssues: 0,
    manualReviewRequired: 0
  };

  /**
   * 🔍 AUDIT COMPLET - Analyse tous les clients
   */
  async runCompleteAudit(): Promise<{
    summary: typeof this.statistics;
    results: ClientAuditResult[];
    report: string;
  }> {
    console.log('🚀 === DÉBUT AUDIT COMPLET BASE CLIENT ===');
    
    try {
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
        return { summary: this.statistics, results: [], report: 'Aucun client à auditer' };
      }

      this.statistics.totalClients = clients.length;
      console.log(`📊 Audit de ${clients.length} clients...`);

      // Auditer chaque client
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        console.log(`🔍 Audit client ${i + 1}/${clients.length}: ${client.prenom} ${client.nom}`);
        
        const auditResult = await this.auditSingleClient(client);
        if (auditResult.issues.length > 0) {
          this.auditResults.push(auditResult);
          this.statistics.clientsWithIssues++;
        }

        // Progress indicator
        if ((i + 1) % 50 === 0) {
          console.log(`📈 Progression: ${i + 1}/${clients.length} clients audités`);
        }
      }

      // Générer statistiques
      this.generateStatistics();
      
      // Générer rapport
      const report = this.generateDetailedReport();

      console.log('✅ === AUDIT TERMINÉ ===');
      return {
        summary: this.statistics,
        results: this.auditResults,
        report
      };

    } catch (error) {
      console.error('❌ Erreur audit:', error);
      throw error;
    }
  }

  /**
   * 🔍 AUDIT INDIVIDUEL - Analyse un client spécifique
   */
  private async auditSingleClient(client: any): Promise<ClientAuditResult> {
    const issues: AuditIssue[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    // 1. AUDIT NATIONALITÉ (Priorité HIGH)
    const nationalityIssues = this.auditNationality(client);
    issues.push(...nationalityIssues.issues);
    suggestedFixes.push(...nationalityIssues.fixes);

    // 2. AUDIT NOMS ET PRÉNOMS
    const nameIssues = this.auditNames(client);
    issues.push(...nameIssues.issues);
    suggestedFixes.push(...nameIssues.fixes);

    // 3. AUDIT DOCUMENTS
    const docIssues = this.auditDocuments(client);
    issues.push(...docIssues.issues);
    suggestedFixes.push(...docIssues.fixes);

    // 4. AUDIT DATES
    const dateIssues = this.auditDates(client);
    issues.push(...dateIssues.issues);
    suggestedFixes.push(...dateIssues.fixes);

    // 5. AUDIT TÉLÉPHONES
    const phoneIssues = this.auditPhones(client);
    issues.push(...phoneIssues.issues);
    suggestedFixes.push(...phoneIssues.fixes);

    // 6. AUDIT COHÉRENCE GLOBALE
    const consistencyIssues = this.auditConsistency(client);
    issues.push(...consistencyIssues.issues);
    suggestedFixes.push(...consistencyIssues.fixes);

    // Déterminer la sévérité
    const severity = this.calculateSeverity(issues);

    return {
      clientId: client.id,
      nom: client.nom || 'INCONNU',
      prenom: client.prenom || 'INCONNU',
      issues,
      severity,
      suggestedFixes
    };
  }

  /**
   * 🌍 AUDIT NATIONALITÉ - Problèmes les plus critiques
   */
  private auditNationality(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    // Nationalité manquante
    if (!client.nationalite || client.nationalite.trim() === '') {
      issues.push({
        field: 'nationalite',
        type: 'missing',
        description: 'Nationalité manquante',
        currentValue: client.nationalite,
        confidence: 1.0
      });

      // Suggestion basée sur le type de document
      let suggestedNationality = null;
      if (client.observations?.includes('CIN') || client.observations?.includes('Marocaine')) {
        suggestedNationality = 'Maroc';
      }

      if (suggestedNationality) {
        fixes.push({
          field: 'nationalite',
          currentValue: client.nationalite,
          suggestedValue: suggestedNationality,
          reason: 'Inféré depuis le type de document',
          confidence: 0.8,
          autoApplicable: false // Nécessite validation
        });
      }
      
      return { issues, fixes };
    }

    // Nationalité invalide (pas dans la liste officielle)
    const normalizedNationality = normalizeNationality(client.nationalite);
    if (!nationalities.includes(normalizedNationality)) {
      issues.push({
        field: 'nationalite',
        type: 'invalid',
        description: `Nationalité "${client.nationalite}" non reconnue`,
        currentValue: client.nationalite,
        confidence: 0.9
      });

      // Essayer de trouver une correspondance proche
      const suggestion = this.findClosestNationality(client.nationalite);
      if (suggestion) {
        fixes.push({
          field: 'nationalite',
          currentValue: client.nationalite,
          suggestedValue: suggestion.nationality,
          reason: `Correspondance proche trouvée (similarité: ${suggestion.similarity}%)`,
          confidence: suggestion.similarity / 100,
          autoApplicable: suggestion.similarity > 0.8
        });
      }
    }

    // Formatage incorrect
    if (client.nationalite !== normalizedNationality) {
      issues.push({
        field: 'nationalite',
        type: 'formatting',
        description: 'Format de nationalité incorrect',
        currentValue: client.nationalite,
        confidence: 1.0
      });

      fixes.push({
        field: 'nationalite',
        currentValue: client.nationalite,
        suggestedValue: normalizedNationality,
        reason: 'Normalisation automatique',
        confidence: 1.0,
        autoApplicable: true
      });
    }

    return { issues, fixes };
  }

  /**
   * 👤 AUDIT NOMS ET PRÉNOMS
   */
  private auditNames(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    // Nom manquant
    if (!client.nom || client.nom.trim() === '') {
      issues.push({
        field: 'nom',
        type: 'missing',
        description: 'Nom manquant',
        currentValue: client.nom,
        confidence: 1.0
      });
    }

    // Prénom manquant
    if (!client.prenom || client.prenom.trim() === '') {
      issues.push({
        field: 'prenom',
        type: 'missing',
        description: 'Prénom manquant',
        currentValue: client.prenom,
        confidence: 1.0
      });
    }

    // Formatage des noms (caractères spéciaux, casse)
    if (client.nom) {
      const cleanNom = this.cleanName(client.nom);
      if (client.nom !== cleanNom) {
        issues.push({
          field: 'nom',
          type: 'formatting',
          description: 'Format du nom incorrect',
          currentValue: client.nom,
          confidence: 0.9
        });

        fixes.push({
          field: 'nom',
          currentValue: client.nom,
          suggestedValue: cleanNom,
          reason: 'Nettoyage et formatage du nom',
          confidence: 0.9,
          autoApplicable: true
        });
      }
    }

    if (client.prenom) {
      const cleanPrenom = this.cleanName(client.prenom);
      if (client.prenom !== cleanPrenom) {
        issues.push({
          field: 'prenom',
          type: 'formatting',
          description: 'Format du prénom incorrect',
          currentValue: client.prenom,
          confidence: 0.9
        });

        fixes.push({
          field: 'prenom',
          currentValue: client.prenom,
          suggestedValue: cleanPrenom,
          reason: 'Nettoyage et formatage du prénom',
          confidence: 0.9,
          autoApplicable: true
        });
      }
    }

    return { issues, fixes };
  }

  /**
   * 📄 AUDIT DOCUMENTS
   */
  private auditDocuments(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    // Numéro de passeport manquant ou invalide
    if (!client.numero_passeport || client.numero_passeport.trim() === '') {
      issues.push({
        field: 'numero_passeport',
        type: 'missing',
        description: 'Numéro de document manquant',
        currentValue: client.numero_passeport,
        confidence: 0.8
      });
    } else {
      // Validation du format
      const cleanedNumber = client.numero_passeport.replace(/[^A-Z0-9]/g, '');
      if (cleanedNumber.length < 6) {
        issues.push({
          field: 'numero_passeport',
          type: 'invalid',
          description: 'Numéro de document trop court',
          currentValue: client.numero_passeport,
          confidence: 0.9
        });
      }

      if (client.numero_passeport !== cleanedNumber) {
        fixes.push({
          field: 'numero_passeport',
          currentValue: client.numero_passeport,
          suggestedValue: cleanedNumber,
          reason: 'Nettoyage du numéro de document',
          confidence: 0.9,
          autoApplicable: true
        });
      }
    }

    return { issues, fixes };
  }

  /**
   * 📅 AUDIT DATES
   */
  private auditDates(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    // Date de naissance
    if (client.date_naissance) {
      if (!this.isValidDate(client.date_naissance)) {
        issues.push({
          field: 'date_naissance',
          type: 'invalid',
          description: 'Format de date de naissance invalide',
          currentValue: client.date_naissance,
          confidence: 0.9
        });
      }
    }

    // Date d'expiration
    if (client.date_expiration) {
      if (!this.isValidDate(client.date_expiration)) {
        issues.push({
          field: 'date_expiration',
          type: 'invalid',
          description: 'Format de date d\'expiration invalide',
          currentValue: client.date_expiration,
          confidence: 0.9
        });
      }
    }

    return { issues, fixes };
  }

  /**
   * 📞 AUDIT TÉLÉPHONES
   */
  private auditPhones(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    if (client.numero_telephone && !this.isValidPhoneNumber(client.numero_telephone)) {
      issues.push({
        field: 'numero_telephone',
        type: 'invalid',
        description: 'Format de numéro de téléphone invalide',
        currentValue: client.numero_telephone,
        confidence: 0.8
      });

      const cleanedPhone = this.cleanPhoneNumber(client.numero_telephone);
      if (cleanedPhone !== client.numero_telephone) {
        fixes.push({
          field: 'numero_telephone',
          currentValue: client.numero_telephone,
          suggestedValue: cleanedPhone,
          reason: 'Formatage du numéro de téléphone',
          confidence: 0.7,
          autoApplicable: false
        });
      }
    }

    return { issues, fixes };
  }

  /**
   * 🔗 AUDIT COHÉRENCE GLOBALE
   */
  private auditConsistency(client: any): { issues: AuditIssue[], fixes: SuggestedFix[] } {
    const issues: AuditIssue[] = [];
    const fixes: SuggestedFix[] = [];

    // Cohérence nationalité/type de document
    if (client.nationalite === 'Maroc' && client.observations) {
      if (!client.observations.toLowerCase().includes('cin') && 
          !client.observations.toLowerCase().includes('passeport marocain')) {
        issues.push({
          field: 'coherence',
          type: 'inconsistent',
          description: 'Incohérence entre nationalité marocaine et type de document',
          currentValue: { nationalite: client.nationalite, observations: client.observations },
          confidence: 0.6
        });
      }
    }

    return { issues, fixes };
  }

  // === MÉTHODES UTILITAIRES ===

  private findClosestNationality(input: string): { nationality: string, similarity: number } | null {
    const inputLower = input.toLowerCase();
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const nationality of nationalities) {
      const similarity = this.calculateSimilarity(inputLower, nationality.toLowerCase());
      if (similarity > bestSimilarity && similarity > 0.6) {
        bestSimilarity = similarity;
        bestMatch = nationality;
      }
    }

    return bestMatch ? { nationality: bestMatch, similarity: Math.round(bestSimilarity * 100) } : null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private cleanName(name: string): string {
    return name
      .trim()
      .replace(/[®©™\+\•\*]/g, '')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private isValidDate(date: string): boolean {
    return /^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}$/.test(date);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    return /^(\+212|0)[5-7]\d{8}$/.test(cleaned);
  }

  private cleanPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    if (/^0[5-7]\d{8}$/.test(cleaned)) {
      return cleaned;
    }
    if (/^\+212[5-7]\d{8}$/.test(cleaned)) {
      return cleaned;
    }
    return phone; // Retourner l'original si pas de format reconnu
  }

  private calculateSeverity(issues: AuditIssue[]): 'low' | 'medium' | 'high' {
    const highSeverityTypes = ['missing'];
    const mediumSeverityTypes = ['invalid'];
    
    if (issues.some(issue => highSeverityTypes.includes(issue.type))) {
      return 'high';
    }
    if (issues.some(issue => mediumSeverityTypes.includes(issue.type))) {
      return 'medium';
    }
    return 'low';
  }

  private generateStatistics(): void {
    for (const result of this.auditResults) {
      for (const issue of result.issues) {
        this.statistics.issuesByType[issue.type] = (this.statistics.issuesByType[issue.type] || 0) + 1;
        this.statistics.issuesByField[issue.field] = (this.statistics.issuesByField[issue.field] || 0) + 1;
      }
      
      const autoFixable = result.suggestedFixes.filter(fix => fix.autoApplicable).length;
      this.statistics.autoFixableIssues += autoFixable;
      this.statistics.manualReviewRequired += result.suggestedFixes.length - autoFixable;
    }
  }

  private generateDetailedReport(): string {
    const { totalClients, clientsWithIssues, issuesByType, issuesByField, autoFixableIssues, manualReviewRequired } = this.statistics;
    
    return `
📊 === RAPPORT D'AUDIT COMPLET ===

🎯 RÉSUMÉ EXÉCUTIF:
• Total clients analysés: ${totalClients}
• Clients avec problèmes: ${clientsWithIssues} (${Math.round((clientsWithIssues/totalClients)*100)}%)
• Clients sans problème: ${totalClients - clientsWithIssues} (${Math.round(((totalClients-clientsWithIssues)/totalClients)*100)}%)

🔧 ACTIONS POSSIBLES:
• Corrections automatiques: ${autoFixableIssues}
• Révision manuelle requise: ${manualReviewRequired}

📈 PROBLÈMES PAR TYPE:
${Object.entries(issuesByType).map(([type, count]) => `• ${type}: ${count}`).join('\n')}

📋 PROBLÈMES PAR CHAMP:
${Object.entries(issuesByField).map(([field, count]) => `• ${field}: ${count}`).join('\n')}

🎯 RECOMMANDATIONS:
1. Corriger automatiquement les ${autoFixableIssues} problèmes de formatage
2. Réviser manuellement les ${manualReviewRequired} cas nécessitant validation
3. Mettre en place des validations préventives pour éviter ces problèmes futurs

📁 Rapport détaillé: ${this.auditResults.length} clients avec problèmes identifiés
    `;
  }
}

// Export pour utilisation
export const clientAuditor = new ClientAuditor(); 