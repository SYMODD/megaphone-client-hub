
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

export const RecaptchaStatusTester: React.FC = () => {
  const { siteKey, isConfigured, isLoading } = useRecaptchaSettings();
  const { testing, results, runTests, clearResults } = useRecaptchaTestRunner();

  const handleRunTests = () => {
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
        <RecaptchaTestActions
          isConfigured={isConfigured}
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

        {/* Instructions */}
        <RecaptchaTestInstructions />
      </CardContent>
    </Card>
  );
};
