
import { useEffect, useState } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

export const CaptchaDebugInfo = () => {
  const { getSecuritySettings, loading } = useSecuritySettings();
  const [debugData, setDebugData] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  const fetchDebugData = async () => {
    console.log('🔍 DEBUT DU DEBUG CAPTCHA');
    
    try {
      // Test 1: Récupérer TOUS les paramètres
      console.log('📊 Test 1: Récupération de TOUS les paramètres');
      const allSettings = await getSecuritySettings();
      console.log('📊 Tous les paramètres:', allSettings);

      // Test 2: Récupérer uniquement recaptcha_public_key
      console.log('📊 Test 2: Récupération de la clé publique uniquement');
      const publicKeyOnly = await getSecuritySettings(['recaptcha_public_key']);
      console.log('📊 Clé publique uniquement:', publicKeyOnly);

      // Test 3: Récupérer les deux clés CAPTCHA
      console.log('📊 Test 3: Récupération des deux clés CAPTCHA');
      const captchaKeys = await getSecuritySettings(['recaptcha_public_key', 'recaptcha_secret_key']);
      console.log('📊 Clés CAPTCHA:', captchaKeys);

      setDebugData({
        allSettings,
        publicKeyOnly,
        captchaKeys,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erreur dans fetchDebugData:', error);
      setDebugData({ error: error.message });
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Chargement du debug CAPTCHA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          🔍 Debug CAPTCHA - Diagnostic complet
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDebugData}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {debugData?.error && (
          <div className="p-3 bg-red-100 border border-red-200 rounded">
            <strong className="text-red-800">Erreur:</strong>
            <pre className="text-red-700 text-sm mt-1">{debugData.error}</pre>
          </div>
        )}

        {debugData && !debugData.error && (
          <>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-800">Résumé rapide:</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Tous les paramètres:</span> 
                  <span className={debugData.allSettings?.success ? "text-green-600" : "text-red-600"}>
                    {debugData.allSettings?.success ? "✅ Succès" : "❌ Échec"}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({debugData.allSettings?.data?.length || 0} éléments)
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Clé publique uniquement:</span> 
                  <span className={debugData.publicKeyOnly?.success ? "text-green-600" : "text-red-600"}>
                    {debugData.publicKeyOnly?.success ? "✅ Succès" : "❌ Échec"}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({debugData.publicKeyOnly?.data?.length || 0} éléments)
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Clés CAPTCHA:</span> 
                  <span className={debugData.captchaKeys?.success ? "text-green-600" : "text-red-600"}>
                    {debugData.captchaKeys?.success ? "✅ Succès" : "❌ Échec"}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({debugData.captchaKeys?.data?.length || 0} éléments)
                  </span>
                </div>
              </div>
            </div>

            {debugData.captchaKeys?.data && debugData.captchaKeys.data.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-orange-800">Analyse des clés CAPTCHA:</h4>
                {debugData.captchaKeys.data.map((setting: any) => (
                  <div key={setting.setting_key} className="text-sm p-2 bg-white rounded border">
                    <div><strong>Clé:</strong> {setting.setting_key}</div>
                    <div><strong>Valeur:</strong> {setting.setting_value || '[VIDE]'}</div>
                    <div><strong>Chiffrée:</strong> {setting.is_encrypted ? 'Oui' : 'Non'}</div>
                    <div><strong>Longueur:</strong> {setting.setting_value?.length || 0} caractères</div>
                    <div><strong>Commence par:</strong> {setting.setting_value?.substring(0, 10) || '[RIEN]'}...</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center gap-2"
              >
                {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showRawData ? 'Masquer' : 'Afficher'} les données brutes
              </Button>
              
              {showRawData && (
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Dernière actualisation: {debugData.timestamp}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
