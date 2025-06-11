
import { useState } from 'react';
import { recaptchaService } from "@/services/recaptchaService";
import { toast } from "sonner";

export interface TestResult {
  role: string;
  action: string;
  success: boolean;
  error?: string;
  token?: string;
  timestamp: Date;
}

export interface TestScenario {
  role: string;
  action: string;
  label: string;
  icon: any;
}

export const useRecaptchaTestRunner = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async (scenarios: TestScenario[], siteKey: string, isConfigured: boolean) => {
    console.log('🧪 [TEST_RUNNER] Début tests avec règles unifiées:', {
      isConfigured,
      siteKeyPresent: !!siteKey,
      scenariosCount: scenarios.length
    });

    if (!isConfigured || !siteKey) {
      // Créer des résultats "simulés" pour les tests sans configuration
      console.log('🧪 [TEST_RUNNER] Simulation tests sans configuration reCAPTCHA');
      
      const simulatedResults: TestResult[] = scenarios.map(scenario => ({
        role: scenario.role,
        action: scenario.action,
        success: scenario.role === 'agent', // Les agents réussissent toujours (bypass)
        error: scenario.role === 'agent' 
          ? undefined 
          : 'reCAPTCHA non configuré (requis pour ce rôle)',
        timestamp: new Date()
      }));

      setResults(simulatedResults);
      
      const successCount = simulatedResults.filter(r => r.success).length;
      toast.info(`🧪 Tests simulés: ${successCount}/${scenarios.length} réussis (règles unifiées appliquées)`);
      return;
    }

    setTesting(true);
    setResults([]);
    
    console.log('🧪 [TEST_RUNNER] Tests reCAPTCHA réels avec:', siteKey.substring(0, 20) + '...');

    const finalResults: TestResult[] = [];

    for (const scenario of scenarios) {
      try {
        console.log(`🔍 [TEST_RUNNER] Test ${scenario.role} - ${scenario.action}`);
        
        // Pour les agents : simuler un succès (bypass selon règles unifiées)
        if (scenario.role === 'agent') {
          const result: TestResult = {
            role: scenario.role,
            action: scenario.action,
            success: true,
            token: 'bypassed_for_agent',
            timestamp: new Date()
          };
          finalResults.push(result);
          setResults(prev => [...prev, result]);
          console.log(`✅ [TEST_RUNNER] ${scenario.role} - Bypass réussi (règles unifiées)`);
          continue;
        }
        
        // Pour Admin/Superviseur : test reCAPTCHA réel
        const token = await recaptchaService.executeRecaptcha(siteKey, scenario.action);
        
        const result: TestResult = {
          role: scenario.role,
          action: scenario.action,
          success: true,
          token: token.substring(0, 20) + '...',
          timestamp: new Date()
        };

        finalResults.push(result);
        setResults(prev => [...prev, result]);
        console.log(`✅ [TEST_RUNNER] ${scenario.role} - Succès reCAPTCHA`);
        
        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const result: TestResult = {
          role: scenario.role,
          action: scenario.action,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          timestamp: new Date()
        };

        finalResults.push(result);
        setResults(prev => [...prev, result]);
        console.error(`❌ [TEST_RUNNER] ${scenario.role} - Échec:`, error);
      }
    }

    setTesting(false);
    
    // Calcul final avec les résultats finaux (pas l'état qui peut être en retard)
    const successCount = finalResults.filter(r => r.success).length;
    const totalCount = scenarios.length;
    
    console.log(`🧪 [TEST_RUNNER] Tests terminés - ${successCount}/${totalCount} réussis`);
    
    if (successCount === totalCount) {
      toast.success(`✅ Tous les tests réussis (${successCount}/${totalCount}) selon les règles unifiées`);
    } else {
      toast.warning(`⚠️ Tests partiellement réussis (${successCount}/${totalCount})`);
    }
  };

  const clearResults = () => {
    setResults([]);
    console.log('🧪 [TEST_RUNNER] Résultats effacés');
  };

  return {
    testing,
    results,
    runTests,
    clearResults
  };
};
