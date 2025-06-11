
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Play, Loader2, Shield, User, Users, Settings } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { recaptchaService } from "@/services/recaptchaService";
import { toast } from "sonner";

interface TestResult {
  role: string;
  action: string;
  success: boolean;
  error?: string;
  token?: string;
  timestamp: Date;
}

export const RecaptchaStatusTester: React.FC = () => {
  const { siteKey, isConfigured, isLoading } = useRecaptchaSettings();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testScenarios = [
    { role: 'admin', action: 'admin_login', label: 'Connexion Admin', icon: Settings },
    { role: 'superviseur', action: 'supervisor_login', label: 'Connexion Superviseur', icon: Users },
    { role: 'agent', action: 'agent_document_selection', label: 'Sélection Document Agent', icon: User },
  ];

  const runTests = async () => {
    if (!isConfigured || !siteKey) {
      toast.error('reCAPTCHA non configuré');
      return;
    }

    setTesting(true);
    setResults([]);
    
    console.log('🧪 [TEST] Début des tests reCAPTCHA pour tous les rôles');

    for (const scenario of testScenarios) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement du testeur de statut...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Test de Statut reCAPTCHA - Déploiement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vérifiez que reCAPTCHA fonctionne correctement pour tous les rôles après le déploiement
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Configuration reCAPTCHA</span>
          </div>
          <Badge variant={isConfigured ? "default" : "destructive"}>
            {isConfigured ? "✅ Configuré" : "❌ Non configuré"}
          </Badge>
        </div>

        {/* Test Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={!isConfigured || testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Lancer Tests
              </>
            )}
          </Button>
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearResults}
              disabled={testing}
            >
              Vider Résultats
            </Button>
          )}
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Résultats des Tests</h4>
            
            {testScenarios.map((scenario) => {
              const result = results.find(r => r.role === scenario.role);
              const IconComponent = scenario.icon;
              
              return (
                <div 
                  key={scenario.role}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="font-medium text-sm">{scenario.label}</div>
                      <div className="text-xs text-slate-500">
                        Action: {scenario.action}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result ? (
                      <>
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "✅ Succès" : "❌ Échec"}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Détails Techniques</h5>
            <div className="space-y-2 text-xs">
              {results.map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{result.role.toUpperCase()}</span>
                    <span className="text-slate-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="text-green-700">
                      ✅ Token généré: {result.token}
                    </div>
                  ) : (
                    <div className="text-red-700">
                      ❌ Erreur: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h5 className="font-medium text-sm text-yellow-800 mb-1">
            Instructions de Test
          </h5>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Admin/Superviseur : reCAPTCHA requis pour la connexion</li>
            <li>• Agent : reCAPTCHA requis pour la sélection de document</li>
            <li>• Tous les tests doivent retourner un token valide</li>
            <li>• En cas d'échec, vérifiez les clés et la connectivité</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
