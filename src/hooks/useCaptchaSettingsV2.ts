
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DebugInfo {
  step: string;
  data?: any;
  error?: any;
}

export const useCaptchaSettingsV2 = () => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 [useCaptchaSettingsV2] Début de la récupération...');
      setDebugInfo({ step: 'Début de la requête' });

      // Test 1: Récupération avec SELECT simple
      const { data: allSettings, error: allError } = await supabase
        .from('security_settings')
        .select('*');

      console.log('📊 [useCaptchaSettingsV2] Tous les paramètres:', {
        count: allSettings?.length || 0,
        data: allSettings,
        error: allError
      });

      setDebugInfo({ 
        step: `Requête ALL: ${allSettings?.length || 0} résultats`,
        data: allSettings,
        error: allError
      });

      if (allError) {
        console.error('❌ [useCaptchaSettingsV2] Erreur requête globale:', allError);
        setError(`Erreur globale: ${allError.message}`);
        return;
      }

      // Test 2: Recherche spécifique de la clé publique
      const publicKeySettings = allSettings?.find(s => s.setting_key === 'recaptcha_public_key');
      
      console.log('🔑 [useCaptchaSettingsV2] Recherche clé publique:', {
        found: !!publicKeySettings,
        setting: publicKeySettings
      });

      if (publicKeySettings) {
        setPublicKey(publicKeySettings.setting_value || "");
        setError(null);
        setDebugInfo({ 
          step: 'Clé trouvée et configurée',
          data: { 
            key_length: publicKeySettings.setting_value?.length || 0,
            is_encrypted: publicKeySettings.is_encrypted 
          }
        });
        console.log('✅ [useCaptchaSettingsV2] Clé publique configurée');
      } else {
        setError('Clé publique introuvable');
        setPublicKey("");
        setDebugInfo({ step: 'Clé publique non trouvée' });
        console.warn('⚠️ [useCaptchaSettingsV2] Clé publique non trouvée');
      }

    } catch (error: any) {
      console.error('❌ [useCaptchaSettingsV2] Erreur générale:', error);
      setError(error.message);
      setPublicKey("");
      setDebugInfo({ step: 'Erreur générale', error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 [useCaptchaSettingsV2] Refetch demandé');
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    publicKey,
    isLoading,
    error,
    debugInfo,
    refetch
  };
};
