
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
      toast.error('reCAPTCHA non configuré');
      return;
    }

    setTesting(true);
    setResults([]);
    
    console.log('🧪 [TEST] Début des tests reCAPTCHA pour tous les rôles');

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
    console.log('🧪 [TEST] Tests terminés');
  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    testing,
    results,
    runTests,
    clearResults
  };
};
