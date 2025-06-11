
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { AlertTriangle, CheckCircle, RefreshCw, Globe, Key } from "lucide-react";
import { toast } from "sonner";

interface DomainTestResults {
  currentDomain: string;
  currentUrl: string;
  siteKey: string | null;
  timestamp: string;
  checks: {
    hasValidSiteKey: boolean;
    domainInfo: {
      hostname: string;
      protocol: string;
      port: string;
      fullOrigin: string;
    };
    expectedDomains: string[];
    scriptLoaded?: boolean;
    scriptError?: string;
  };
}

export const RecaptchaDomainTester: React.FC = () => {
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

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Globe className="w-5 h-5" />
          Diagnostic Domaine reCAPTCHA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations actuelles */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <strong>Domaine actuel :</strong>
            <Badge variant="outline" className="ml-2">{currentDomain}</Badge>
          </div>
          <div>
            <strong>URL complète :</strong>
            <Badge variant="outline" className="ml-2">{currentUrl}</Badge>
          </div>
          <div>
            <strong>Clé configurée :</strong>
            <Badge variant={isConfigured ? "default" : "destructive"} className="ml-2">
              {isConfigured ? '✅ Oui' : '❌ Non'}
            </Badge>
          </div>
          <div>
            <strong>Clé valide :</strong>
            <Badge variant={siteKey?.startsWith('6L') ? "default" : "destructive"} className="ml-2">
              {siteKey?.startsWith('6L') ? '✅ Format OK' : '❌ Format invalide'}
            </Badge>
          </div>
        </div>

        {/* Actions de test */}
        <div className="flex gap-2">
          <Button 
            onClick={testDomainCompatibility} 
            disabled={testing || !siteKey}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Tester domaine
              </>
            )}
          </Button>
          
          <Button 
            onClick={forceCompleteRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh complet
          </Button>
        </div>

        {/* Résultats du test */}
        {testResults && (
          <Alert className={testResults.checks.scriptLoaded ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Test effectué :</strong> {new Date(testResults.timestamp).toLocaleString()}</div>
                <div><strong>Script chargé :</strong> {testResults.checks.scriptLoaded ? '✅ Succès' : '❌ Échec'}</div>
                {testResults.checks.scriptError && (
                  <div className="text-red-600"><strong>Erreur :</strong> {testResults.checks.scriptError}</div>
                )}
                <div><strong>Domaines attendus :</strong></div>
                <ul className="list-disc list-inside text-xs">
                  {testResults.checks.expectedDomains.map((domain: string) => (
                    <li key={domain}>{domain}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions importantes */}
        <Alert className="border-blue-200 bg-blue-50">
          <Key className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1 text-sm">
              <div><strong>Vérifications nécessaires :</strong></div>
              <div>1. Dans Google Cloud Console, vérifiez que ces domaines sont autorisés :</div>
              <div className="ml-4">• <code>localhost</code> (pour développement)</div>
              <div className="ml-4">• <code>sudmegaphone.netlify.app</code></div>
              <div className="ml-4">• <code>app.sudmegaphone.com</code></div>
              <div className="ml-4">• <code>{currentDomain}</code> (domaine actuel)</div>
              <div>2. Assurez-vous que la clé publique correspond au bon projet Google</div>
              <div>3. Rechargez complètement la page après les modifications</div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
