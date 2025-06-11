import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TestTube, Check, X } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { notifyRecaptchaSettingsUpdate } from "@/hooks/recaptcha/RecaptchaNotifications";
import { toast } from 'sonner';

export const RecaptchaUpdateTester: React.FC = () => {
  const { isConfigured, isLoading, refreshSettings } = useRecaptchaSettings();
  const [testResults, setTestResults] = useState<{
    localRefresh: boolean | null;
    globalNotification: boolean | null;
    cacheInvalidation: boolean | null;
  }>({
    localRefresh: null,
    globalNotification: null,
    cacheInvalidation: null
  });

  const runRefreshTest = async () => {
    console.log('🧪 [TEST] Test de refresh local');
    setTestResults(prev => ({ ...prev, localRefresh: null }));
    
    try {
      refreshSettings();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults(prev => ({ ...prev, localRefresh: true }));
      toast.success('Test de refresh local réussi');
    } catch (error) {
      console.error('❌ [TEST] Erreur lors du test de refresh:', error);
      setTestResults(prev => ({ ...prev, localRefresh: false }));
      toast.error('Test de refresh local échoué');
    }
  };

  const runGlobalNotificationTest = async () => {
    console.log('🧪 [TEST] Test de notification globale');
    setTestResults(prev => ({ ...prev, globalNotification: null }));
    
    try {
      notifyRecaptchaSettingsUpdate();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults(prev => ({ ...prev, globalNotification: true }));
      toast.success('Test de notification globale réussi');
    } catch (error) {
      console.error('❌ [TEST] Erreur lors du test de notification:', error);
      setTestResults(prev => ({ ...prev, globalNotification: false }));
      toast.error('Test de notification globale échoué');
    }
  };

  const runCacheTest = async () => {
    console.log('🧪 [TEST] Test d\'invalidation du cache');
    setTestResults(prev => ({ ...prev, cacheInvalidation: null }));
    
    try {
      // Forcer un refresh pour tester l'invalidation du cache
      refreshSettings();
      
      // Attendre et tester à nouveau
      await new Promise(resolve => setTimeout(resolve, 500));
      refreshSettings();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResults(prev => ({ ...prev, cacheInvalidation: true }));
      toast.success('Test d\'invalidation du cache réussi');
    } catch (error) {
      console.error('❌ [TEST] Erreur lors du test de cache:', error);
      setTestResults(prev => ({ ...prev, cacheInvalidation: false }));
      toast.error('Test d\'invalidation du cache échoué');
    }
  };

  const runAllTests = async () => {
    console.log('🧪 [TEST] Démarrage de tous les tests');
    await runRefreshTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    await runGlobalNotificationTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    await runCacheTest();
    console.log('🧪 [TEST] Tous les tests terminés');
  };

  const getTestIcon = (result: boolean | null) => {
    if (result === null) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (result === true) return <Check className="w-4 h-4 text-green-600" />;
    return <X className="w-4 h-4 text-red-600" />;
  };

  const getTestBadge = (result: boolean | null) => {
    if (result === null) return <Badge variant="secondary">En cours...</Badge>;
    if (result === true) return <Badge variant="default" className="bg-green-100 text-green-800">Réussi</Badge>;
    return <Badge variant="destructive">Échoué</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Testeur de mise à jour reCAPTCHA
        </CardTitle>
        <CardDescription>
          Testez les mécanismes de mise à jour des paramètres reCAPTCHA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Statut actuel
            </span>
            <div className="flex items-center gap-2">
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
              <span className={`text-sm px-2 py-1 rounded ${
                isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConfigured ? '✅ Configuré' : '❌ Non configuré'}
              </span>
            </div>
          </div>
        </div>

        {/* Tests individuels */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getTestIcon(testResults.localRefresh)}
              <span className="text-sm font-medium">Refresh local</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestBadge(testResults.localRefresh)}
              <Button size="sm" variant="outline" onClick={runRefreshTest}>
                Tester
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getTestIcon(testResults.globalNotification)}
              <span className="text-sm font-medium">Notification globale</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestBadge(testResults.globalNotification)}
              <Button size="sm" variant="outline" onClick={runGlobalNotificationTest}>
                Tester
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getTestIcon(testResults.cacheInvalidation)}
              <span className="text-sm font-medium">Invalidation cache</span>
            </div>
            <div className="flex items-center gap-2">
              {getTestBadge(testResults.cacheInvalidation)}
              <Button size="sm" variant="outline" onClick={runCacheTest}>
                Tester
              </Button>
            </div>
          </div>
        </div>

        {/* Bouton pour tous les tests */}
        <div className="pt-4 border-t">
          <Button onClick={runAllTests} className="w-full">
            <TestTube className="w-4 h-4 mr-2" />
            Exécuter tous les tests
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
