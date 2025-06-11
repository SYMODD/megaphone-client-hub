
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

      console.log('🔍 [SIMPLE] Chargement direct des paramètres reCAPTCHA');
      
      const { data, error: fetchError } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (fetchError) {
        console.error('❌ [SIMPLE] Erreur Supabase:', fetchError);
        throw fetchError;
      }

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      const isConfigured = !!(siteKey && siteKey.trim() && secretKey && secretKey.trim());

      const newSettings = {
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      };

      console.log('✅ [SIMPLE] Paramètres chargés:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        isConfigured,
        status: isConfigured ? 'CONFIGURÉ' : 'NON CONFIGURÉ'
      });

      setSettings(newSettings);
    } catch (err) {
      console.error('❌ [SIMPLE] Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [SIMPLE] Actualisation des paramètres');
    loadSettings();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};

// Export pour compatibilité
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [SIMPLE] Notification de mise à jour (simplified)');
  // Plus besoin de notifications complexes
};
