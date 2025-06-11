
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2 } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useRecaptchaTestRunner } from "@/hooks/useRecaptchaTestRunner";
import { testScenarios } from "./RecaptchaTestScenarios";
import { RecaptchaTestActions } from "./RecaptchaTestActions";
import { RecaptchaTestResults } from "./RecaptchaTestResults";
import { RecaptchaTestDetails } from "./RecaptchaTestDetails";
import { RecaptchaTestInstructions } from "./RecaptchaTestInstructions";
import { useAuth } from "@/contexts/AuthContext";

export const RecaptchaStatusTester: React.FC = () => {
  const { siteKey, isConfigured, isLoading } = useRecaptchaSettings();
  const { testing, results, runTests, clearResults } = useRecaptchaTestRunner();
  const { profile } = useAuth();

  const handleRunTests = () => {
    console.log('🧪 [STATUS_TESTER] Lancement tests avec utilisateur:', profile?.role);
    runTests(testScenarios, siteKey || '', isConfigured);
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
          Tests de Statut reCAPTCHA - Version Unifiée
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests adaptés aux règles unifiées : Agent = Bypass | Admin/Superviseur = reCAPTCHA requis
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Status avec règles unifiées */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Configuration reCAPTCHA</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? "✅ Configuré" : "❌ Non configuré"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Utilisateur: {profile?.role || 'Non défini'}
            </Badge>
          </div>
        </div>

        {/* Explication des règles unifiées */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h5 className="text-sm font-medium text-amber-800 mb-2">Règles Unifiées Appliquées</h5>
          <div className="text-xs text-amber-700 space-y-1">
            <div>• <strong>Agent :</strong> Bypass total (succès automatique)</div>
            <div>• <strong>Admin/Superviseur :</strong> reCAPTCHA requis et testé</div>
            <div>• <strong>Document sélection :</strong> Désactivé pour tous les rôles</div>
          </div>
        </div>

        {/* Test Actions */}
        <RecaptchaTestActions
          isConfigured={true}
          testing={testing}
          hasResults={results.length > 0}
          onRunTests={handleRunTests}
          onClearResults={clearResults}
        />

        {/* Test Results */}
        <RecaptchaTestResults 
          results={results} 
          scenarios={testScenarios} 
        />

        {/* Detailed Results */}
        <RecaptchaTestDetails results={results} />

        {/* Instructions adaptées */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 mb-2">Instructions pour l'interprétation</h5>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Les tests Agent montreront toujours "Succès" (bypass selon les règles)</div>
            <div>• Les tests Admin/Superviseur nécessitent une configuration reCAPTCHA</div>
            <div>• Si reCAPTCHA n'est pas configuré, seuls les tests Agent réussiront</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
