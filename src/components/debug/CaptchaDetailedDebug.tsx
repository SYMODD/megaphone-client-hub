
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { useCaptchaSettingsV2 } from "@/hooks/useCaptchaSettingsV2";

export const CaptchaDetailedDebug = () => {
  const { getSecuritySettings, loading: dbLoading } = useSecuritySettings();
  const captchaV1 = useCaptchaSettings();
  const captchaV2 = useCaptchaSettingsV2();
  
  const [dbDirectQuery, setDbDirectQuery] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const performDirectDbQuery = async () => {
    console.log('🔍 Requête directe à la base de données...');
    try {
      const result = await getSecuritySettings();
      setDbDirectQuery(result);
      setLastRefresh(new Date().toLocaleString('fr-FR'));
      console.log('📊 Résultat requête directe:', result);
    } catch (error) {
      console.error('❌ Erreur requête directe:', error);
      setDbDirectQuery({ error: error.message });
    }
  };

  useEffect(() => {
    performDirectDbQuery();
  }, []);

  const handleRefreshAll = () => {
    console.log('🔄 Rafraîchissement complet du diagnostic CAPTCHA');
    captchaV1.refetch();
    captchaV2.refetch();
    performDirectDbQuery();
  };

  const getStatusBadge = (isLoading: boolean, hasPublicKey: boolean, error: string | null) => {
    if (isLoading) {
      return <Badge variant="secondary">Chargement...</Badge>;
    }
    if (error) {
      return <Badge variant="destructive">Erreur</Badge>;
    }
    if (hasPublicKey) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Configuré</Badge>;
    }
    return <Badge variant="outline" className="text-orange-700 border-orange-200">Non configuré</Badge>;
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-indigo-800 flex items-center gap-2">
          🔍 Diagnostic CAPTCHA Détaillé
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll}
            disabled={dbLoading}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tout actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Base de données directe */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-800 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Requête directe base de données
          </h4>
          
          <div className="bg-white p-3 rounded border text-sm">
            {dbLoading ? (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Chargement...</span>
              </div>
            ) : dbDirectQuery ? (
              <div className="space-y-2">
                <div><strong>Succès:</strong> {dbDirectQuery.success ? 'Oui' : 'Non'}</div>
                <div><strong>Nombre d'éléments:</strong> {dbDirectQuery.data?.length || 0}</div>
                {dbDirectQuery.error && (
                  <div className="text-red-600"><strong>Erreur:</strong> {dbDirectQuery.error}</div>
                )}
                {dbDirectQuery.data && dbDirectQuery.data.length > 0 && (
                  <div>
                    <strong>Clés trouvées:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {dbDirectQuery.data.map((item: any) => (
                        <li key={item.setting_key}>
                          {item.setting_key} - {item.setting_value ? 'Configuré' : 'Vide'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Aucune donnée</span>
            )}
            {lastRefresh && (
              <div className="text-xs text-gray-500 mt-2">
                Dernière actualisation: {lastRefresh}
              </div>
            )}
          </div>
        </div>

        {/* Comparaison des hooks */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-800">Comparaison des hooks CAPTCHA</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Hook V1 */}
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">useCaptchaSettings (V1)</span>
                {getStatusBadge(captchaV1.isLoading, !!captchaV1.publicKey, captchaV1.error)}
              </div>
              <div className="text-sm space-y-1">
                <div>Clé publique: {captchaV1.publicKey || '[AUCUNE]'}</div>
                <div>Erreur: {captchaV1.error || '[AUCUNE]'}</div>
              </div>
            </div>

            {/* Hook V2 */}
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">useCaptchaSettingsV2 (Debug)</span>
                {getStatusBadge(captchaV2.isLoading, !!captchaV2.publicKey, captchaV2.error)}
              </div>
              <div className="text-sm space-y-1">
                <div>Clé publique: {captchaV2.publicKey || '[AUCUNE]'}</div>
                <div>Erreur: {captchaV2.error || '[AUCUNE]'}</div>
                {captchaV2.debugInfo && (
                  <div>Debug: {captchaV2.debugInfo.step}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Recommandations
          </h4>
          
          <div className="bg-white p-3 rounded border text-sm">
            {dbDirectQuery?.data?.length === 0 ? (
              <div className="text-orange-600">
                <strong>Action requise:</strong> Aucune clé CAPTCHA n'est configurée dans la base de données. 
                Veuillez accéder à la page de gestion de la sécurité pour configurer les clés reCAPTCHA.
              </div>
            ) : (
              <div className="text-green-600">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                <strong>Configuration détectée:</strong> Des paramètres de sécurité sont présents dans la base de données.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
