
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { useCaptchaSettingsV2 } from "@/hooks/useCaptchaSettingsV2";
import { supabase } from "@/integrations/supabase/client";

export const CaptchaDetailedDebug = () => {
  const { getSecuritySettings, loading: dbLoading } = useSecuritySettings();
  const captchaV1 = useCaptchaSettings();
  const captchaV2 = useCaptchaSettingsV2();
  
  const [dbDirectQuery, setDbDirectQuery] = useState<any>(null);
  const [rawDbQuery, setRawDbQuery] = useState<any>(null);
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

  const performRawDbQuery = async () => {
    console.log('🔍 Requête brute Supabase...');
    try {
      // Requête directe avec le client Supabase
      const { data, error } = await supabase
        .from('security_settings')
        .select('*');

      console.log('📊 Résultat requête brute:', { data, error });
      
      setRawDbQuery({
        success: !error,
        data: data || [],
        error: error?.message,
        count: data?.length || 0
      });
      
    } catch (error: any) {
      console.error('❌ Erreur requête brute:', error);
      setRawDbQuery({ 
        success: false, 
        error: error.message,
        data: [],
        count: 0
      });
    }
  };

  useEffect(() => {
    performDirectDbQuery();
    performRawDbQuery();
  }, []);

  const handleRefreshAll = () => {
    console.log('🔄 Rafraîchissement complet du diagnostic CAPTCHA');
    captchaV1.refetch();
    captchaV2.refetch();
    performDirectDbQuery();
    performRawDbQuery();
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
        {/* Requête brute Supabase */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-800 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Requête brute Supabase (security_settings)
          </h4>
          
          <div className="bg-white p-3 rounded border text-sm">
            {rawDbQuery ? (
              <div className="space-y-2">
                <div><strong>Succès:</strong> {rawDbQuery.success ? 'Oui' : 'Non'}</div>
                <div><strong>Nombre total d'enregistrements:</strong> {rawDbQuery.count}</div>
                {rawDbQuery.error && (
                  <div className="text-red-600"><strong>Erreur:</strong> {rawDbQuery.error}</div>
                )}
                {rawDbQuery.data && rawDbQuery.data.length > 0 && (
                  <div>
                    <strong>Paramètres trouvés:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {rawDbQuery.data.map((item: any) => (
                        <li key={item.id} className="text-xs">
                          <strong>{item.setting_key}</strong>: {item.setting_value ? `Configuré (${item.setting_value.length} chars)` : 'Vide'} 
                          {item.is_encrypted && ' [CHIFFRÉ]'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Chargement...</span>
            )}
          </div>
        </div>

        {/* Base de données via useSecuritySettings */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-800 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Via hook useSecuritySettings
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
            Analyse et recommandations
          </h4>
          
          <div className="bg-white p-3 rounded border text-sm">
            {rawDbQuery?.count === 0 ? (
              <div className="text-orange-600">
                <strong>⚠️ Problème identifié:</strong> Aucun paramètre de sécurité trouvé dans la base de données. 
                Les clés ne sont pas sauvegardées correctement.
              </div>
            ) : rawDbQuery?.count > 0 && (!captchaV1.publicKey && !captchaV2.publicKey) ? (
              <div className="text-red-600">
                <strong>🚨 Problème critique:</strong> Les paramètres existent en base ({rawDbQuery.count} enregistrements) 
                mais les hooks ne parviennent pas à les récupérer. Problème de logique de récupération.
              </div>
            ) : captchaV1.publicKey || captchaV2.publicKey ? (
              <div className="text-green-600">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                <strong>✅ Configuration détectée:</strong> Les hooks parviennent à récupérer les clés CAPTCHA.
              </div>
            ) : (
              <div className="text-gray-600">
                <strong>🔍 Diagnostic en cours...</strong> Veuillez actualiser pour obtenir plus d'informations.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
