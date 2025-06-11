
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
    if (!isConfigured || !siteKey) {
      toast.error('reCAPTCHA non configuré - impossible de lancer les tests');
      return;
    }

    setTesting(true);
    setResults([]);
    
    console.log('🧪 [TEST] Début des tests reCAPTCHA pour tous les rôles');
    console.log('🔑 [TEST] Site Key utilisé:', siteKey.substring(0, 20) + '...');

    for (const scenario of scenarios) {
      try {
        console.log(`🔍 [TEST] Test ${scenario.role} - ${scenario.action}`);
        
        const token = await recaptchaService.executeRecaptcha(siteKey, scenario.action);
        
        const result: TestResult = {
          role: scenario.role,
          action: scenario.action,
          success: true,
          token: token.substring(0, 20) + '...',
          timestamp: new Date()
        };

        setResults(prev => [...prev, result]);
        console.log(`✅ [TEST] ${scenario.role} - Succès`);
        
        // Petite pause entre les tests pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const result: TestResult = {
          role: scenario.role,
          action: scenario.action,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          timestamp: new Date()
        };

        setResults(prev => [...prev, result]);
        console.error(`❌ [TEST] ${scenario.role} - Échec:`, error);
      }
    }

    setTesting(false);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = scenarios.length;
    
    console.log(`🧪 [TEST] Tests terminés - ${successCount}/${totalCount} réussis`);
    
    if (successCount === totalCount) {
      toast.success(`✅ Tous les tests reCAPTCHA réussis (${successCount}/${totalCount})`);
    } else {
      toast.warning(`⚠️ Tests partiellement réussis (${successCount}/${totalCount})`);
    }
  };

  const clearResults = () => {
    setResults([]);
    console.log('🧪 [TEST] Résultats des tests effacés');
  };

  return {
    testing,
    results,
    runTests,
    clearResults
  };
};
