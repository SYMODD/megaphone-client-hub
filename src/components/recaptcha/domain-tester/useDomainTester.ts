
import { useState } from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { toast } from "sonner";
import { DomainTestResults } from './types';

export const useDomainTester = () => {
  const { siteKey, isConfigured, isLoading, refreshSettings } = useRecaptchaSettings();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<DomainTestResults | null>(null);

  const currentDomain = window.location.hostname;
  const currentUrl = window.location.origin;

  const testDomainCompatibility = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      console.log('🧪 [DOMAIN_TEST] Test de compatibilité domaine-clé reCAPTCHA');
      
      const results: DomainTestResults = {
        currentDomain,
        currentUrl,
        siteKey,
        timestamp: new Date().toISOString(),
        checks: {
          hasValidSiteKey: !!(siteKey && siteKey.length > 10 && siteKey.startsWith('6L')),
          domainInfo: {
            hostname: currentDomain,
            protocol: window.location.protocol,
            port: window.location.port || 'default',
            fullOrigin: currentUrl
          },
          expectedDomains: [
            'localhost',
            'sudmegaphone.netlify.app', 
            'app.sudmegaphone.com',
            currentDomain
          ],
          scriptLoaded: false,
          scriptError: undefined
        }
      };

      // Test de chargement du script reCAPTCHA
      if (siteKey) {
        try {
          // Suppression de l'ancien script s'il existe
          const existingScript = document.querySelector('script[src*="recaptcha"]');
          if (existingScript) {
            existingScript.remove();
            console.log('🗑️ [DOMAIN_TEST] Ancien script reCAPTCHA supprimé');
          }

          // Chargement frais du script
          const script = document.createElement('script');
          script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
          script.async = true;

          const scriptLoadPromise = new Promise((resolve, reject) => {
            script.onload = () => {
              console.log('✅ [DOMAIN_TEST] Script reCAPTCHA chargé avec succès');
              resolve('loaded');
            };
            script.onerror = (error) => {
              console.error('❌ [DOMAIN_TEST] Erreur chargement script:', error);
              reject(error);
            };
          });

          document.head.appendChild(script);
          await scriptLoadPromise;

          results.checks.scriptLoaded = true;
        } catch (error) {
          console.error('❌ [DOMAIN_TEST] Erreur lors du test:', error);
          results.checks.scriptLoaded = false;
          results.checks.scriptError = error instanceof Error ? error.message : 'Erreur inconnue';
        }
      }

      setTestResults(results);
      console.log('📊 [DOMAIN_TEST] Résultats complets:', results);

    } catch (error) {
      console.error('❌ [DOMAIN_TEST] Erreur générale:', error);
      toast.error('Erreur lors du test de domaine');
    } finally {
      setTesting(false);
    }
  };

  const forceCompleteRefresh = async () => {
    console.log('🔄 [DOMAIN_TEST] REFRESH COMPLET FORCÉ');
    
    // Suppression complète du cache
    localStorage.removeItem('recaptcha_cache');
    sessionStorage.clear();
    
    // Suppression des scripts reCAPTCHA
    document.querySelectorAll('script[src*="recaptcha"]').forEach(script => {
      script.remove();
    });
    
    // Triple refresh avec délais
    refreshSettings();
    setTimeout(() => refreshSettings(), 500);
    setTimeout(() => refreshSettings(), 1500);
    
    toast.success('🔄 Refresh complet effectué - rechargez la page');
  };

  return {
    siteKey,
    isConfigured,
    isLoading,
    testing,
    testResults,
    currentDomain,
    currentUrl,
    testDomainCompatibility,
    forceCompleteRefresh
  };
};
