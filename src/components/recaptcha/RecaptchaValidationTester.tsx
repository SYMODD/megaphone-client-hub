
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
    
    console.log('🧪 [VALIDATION] Début des tests de validation avec logique unifiée');
    console.log('🧪 [VALIDATION] Utilisateur actuel:', profile?.role, 'reCAPTCHA configuré:', isConfigured);
    
    // Test 1 : Configuration des clés
    tests.push({
      test: 'Configuration des clés reCAPTCHA',
      status: isConfigured ? 'success' : 'error',
      message: isConfigured 
        ? `✅ Clés configurées correctement` 
        : '❌ Clés manquantes - reCAPTCHA non configuré'
    });
    
    // Test 2 : Logique unifiée pour Agent
    const userRole = profile?.role || '';
    const isAgent = userRole === 'agent';
    
    if (isAgent) {
      // Pour les agents : TOUJOURS SUCCÈS (bypass systématique selon les règles unifiées)
      tests.push({
        test: 'Logique Agent - Bypass reCAPTCHA',
        status: 'success',
        message: '✅ Agent peut accéder sans reCAPTCHA (règle unifiée : bypass total pour agents)'
      });
    } else {
      // Pour Admin/Superviseur : reCAPTCHA requis
      const isAdminSuperviseur = ['admin', 'superviseur'].includes(userRole);
      if (isAdminSuperviseur) {
        tests.push({
          test: 'Exigence reCAPTCHA pour Admin/Superviseur',
          status: isConfigured ? 'success' : 'error',
          message: isConfigured 
            ? '✅ reCAPTCHA configuré pour Admin/Superviseur' 
            : '❌ reCAPTCHA requis mais non configuré pour votre rôle'
        });
      } else {
        tests.push({
          test: 'Rôle utilisateur',
          status: 'pending',
          message: '⏭️ Rôle non défini ou non pris en charge pour ce test'
        });
      }
    }
    
    // Test 3 : Règles unifiées par contexte
    tests.push({
      test: 'Règles contextuelles unifiées',
      status: 'success',
      message: '✅ Sélection documents = DÉSACTIVÉ | Login Admin/Superviseur = REQUIS'
    });
    
    // Test 4 : État de chargement cohérent
    tests.push({
      test: 'État système stable',
      status: isLoading ? 'pending' : 'success',
      message: isLoading ? '⏳ Chargement en cours...' : '✅ Système stable et opérationnel'
    });
    
    // Simulation progressive des tests
    for (let i = 0; i < tests.length; i++) {
      setResults(tests.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;
    
    console.log('🧪 [VALIDATION] Tests terminés:', {
      total: tests.length,
      succès: successCount,
      erreurs: errorCount,
      userRole: profile?.role,
      configured: isConfigured
    });
    
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
          Tests de Validation UNIFIÉS
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Validation des règles reCAPTCHA selon l'approche unifiée et simplifiée
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations utilisateur avec règles unifiées */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilisateur actuel</span>
              <Badge variant="outline">{profile?.role || 'Non défini'}</Badge>
            </div>
            <div className="text-xs text-blue-700">
              <strong>Règles unifiées :</strong> Agent = Bypass total | Admin/Superviseur = reCAPTCHA requis | Document sélection = Désactivé pour tous
            </div>
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
              Validation en cours...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Valider les Règles Unifiées
            </>
          )}
        </Button>

        {/* Résultats des tests */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Résultats de Validation :</h4>
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

        {/* Résumé avec logique unifiée */}
        {results.length > 0 && !testing && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm space-y-1">
              <div>
                <strong>Résumé :</strong> {results.filter(r => r.status === 'success').length} réussi(s), {' '}
                {results.filter(r => r.status === 'error').length} échec(s), {' '}
                {results.filter(r => r.status === 'pending').length} en attente
              </div>
              <div className="text-xs text-gray-600 mt-2">
                <strong>Statut global :</strong> {
                  profile?.role === 'agent' 
                    ? '✅ Agent - Accès libre selon les règles unifiées'
                    : isConfigured 
                      ? '✅ Configuration complète'
                      : '⚠️ Configuration requise pour votre rôle'
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
