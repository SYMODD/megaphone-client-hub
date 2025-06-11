
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

export const useRecaptchaSettings = () => {
  const [settings, setSettings] = useState<RecaptchaSettings>({
    siteKey: null,
    secretKey: null,
    isLoaded: false,
    isConfigured: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [FIXED_HOOK] Chargement paramètres reCAPTCHA');
      
      const { data, error: fetchError } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (fetchError) {
        console.error('❌ [FIXED_HOOK] Erreur Supabase:', fetchError);
        throw fetchError;
      }

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      // LOGIQUE FIXÉE : les deux clés doivent être présentes et non vides
      const isConfigured = !!(siteKey && siteKey.trim() && secretKey && secretKey.trim());

      const newSettings = {
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      };

      console.log('✅ [FIXED_HOOK] Statut final:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        isConfigured,
        status: isConfigured ? 'CONFIGURÉ ✅' : 'NON CONFIGURÉ ❌'
      });

      setSettings(newSettings);
    } catch (err) {
      console.error('❌ [FIXED_HOOK] Erreur:', err);
      setError('Erreur lors du chargement');
      setSettings({
        siteKey: null,
        secretKey: null,
        isLoaded: true,
        isConfigured: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [FIXED_HOOK] Actualisation demandée');
    loadSettings();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
