
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export const RecaptchaValidationTester: React.FC = () => {
  const { isConfigured, isLoading, siteKey, secretKey } = useRecaptchaSettings();
  const { profile } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runValidationTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests: TestResult[] = [];
    
    // Test 1 : Configuration des clés
    tests.push({
      test: 'Configuration des clés reCAPTCHA',
      status: isConfigured ? 'success' : 'error',
      message: isConfigured 
        ? `✅ Clés configurées (Site: ${siteKey?.substring(0, 20)}..., Secret: ${secretKey?.substring(0, 20)}...)` 
        : '❌ Clés manquantes ou invalides'
    });
    
    // Test 2 : Logique de bypass pour agent
    const agentBypass = profile?.role === 'agent' && !isConfigured;
    tests.push({
      test: 'Bypass pour Agent sans reCAPTCHA',
      status: profile?.role === 'agent' ? (agentBypass ? 'success' : 'error') : 'pending',
      message: profile?.role === 'agent' 
        ? (agentBypass ? '✅ Agent peut accéder sans reCAPTCHA' : '⚠️ Agent nécessite reCAPTCHA')
        : '⏭️ Test non applicable (utilisateur non Agent)'
    });
    
    // Test 3 : Exigence reCAPTCHA pour Admin/Superviseur
    const adminRequirement = ['admin', 'superviseur'].includes(profile?.role || '');
    tests.push({
      test: 'Exigence reCAPTCHA pour Admin/Superviseur',
      status: adminRequirement ? (isConfigured ? 'success' : 'error') : 'pending',
      message: adminRequirement 
        ? (isConfigured ? '✅ reCAPTCHA configuré pour Admin/Superviseur' : '❌ reCAPTCHA requis mais non configuré')
        : '⏭️ Test non applicable (utilisateur non Admin/Superviseur)'
    });
    
    // Test 4 : Cohérence de l'état de chargement
    tests.push({
      test: 'État de chargement cohérent',
      status: isLoading ? 'pending' : 'success',
      message: isLoading ? '⏳ Chargement en cours...' : '✅ État stable'
    });
    
    // Simulation d'un délai de test
    for (let i = 0; i < tests.length; i++) {
      setResults(tests.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Réussi</Badge>;
      case 'error':
        return <Badge variant="destructive">Échec</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Validation du Déploiement reCAPTCHA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests automatisés pour valider le bon fonctionnement après les corrections
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations utilisateur */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Utilisateur actuel</span>
            <Badge variant="outline">{profile?.role || 'Non défini'}</Badge>
          </div>
        </div>

        {/* Bouton de test */}
        <Button 
          onClick={runValidationTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Test en cours...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Lancer les tests de validation
            </>
          )}
        </Button>

        {/* Résultats des tests */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Résultats des tests :</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{result.test}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Résumé */}
        {results.length > 0 && !testing && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <strong>Résumé :</strong> {results.filter(r => r.status === 'success').length} réussi(s), {' '}
              {results.filter(r => r.status === 'error').length} échec(s), {' '}
              {results.filter(r => r.status === 'pending').length} en attente
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
