import { ClientAuditor } from './src/scripts/client-audit';

async function runTestAudit() {
  console.log('🔍 === TEST AUDIT BASE CLIENT ===\n');
  
  const auditor = new ClientAuditor();
  
  try {
    // Lancer l'audit complet
    const { summary, results, report } = await auditor.runCompleteAudit();
    
    // Afficher le rapport
    console.log(report);
    
    // Afficher les 5 premiers problèmes détectés
    if (results.length > 0) {
      console.log('\n🔍 === PREMIERS PROBLÈMES DÉTECTÉS ===');
      results.slice(0, 5).forEach((result, index) => {
        console.log(`\n${index + 1}. Client: ${result.prenom} ${result.nom} (${result.clientId})`);
        console.log(`   Sévérité: ${result.severity.toUpperCase()}`);
        console.log('   Problèmes:');
        result.issues.forEach(issue => {
          console.log(`   - ${issue.description} (${issue.field})`);
          if (issue.currentValue) {
            console.log(`     Valeur actuelle: "${issue.currentValue}"`);
          }
        });
        
        if (result.suggestedFixes.length > 0) {
          console.log('   Corrections suggérées:');
          result.suggestedFixes.forEach(fix => {
            console.log(`   - ${fix.reason}: "${fix.currentValue}" → "${fix.suggestedValue}"`);
            console.log(`     Confiance: ${Math.round(fix.confidence * 100)}% | Auto: ${fix.autoApplicable ? 'Oui' : 'Non'}`);
          });
        }
      });
    }
    
    // Statistiques finales
    console.log('\n📊 === STATISTIQUES FINALES ===');
    console.log(`• Clients analysés: ${summary.totalClients}`);
    console.log(`• Clients avec problèmes: ${summary.clientsWithIssues}`);
    console.log(`• Corrections automatiques possibles: ${summary.autoFixableIssues}`);
    console.log(`• Révisions manuelles nécessaires: ${summary.manualReviewRequired}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
}

// Lancer le test
runTestAudit(); 