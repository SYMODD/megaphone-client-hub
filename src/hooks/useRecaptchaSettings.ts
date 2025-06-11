
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecaptchaSettings {
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

      console.log('🔑 [PRODUCTION] Loading reCAPTCHA settings from database...');
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ [PRODUCTION] Error loading reCAPTCHA settings:', error);
        setError('Erreur lors du chargement des paramètres reCAPTCHA');
        
        // En cas d'erreur, on bloque l'application
        setSettings({
          siteKey: null,
          secretKey: null,
          isLoaded: true,
          isConfigured: false
        });
        return;
      }

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      // Validation stricte : les deux clés doivent être présentes ET non vides
      const isConfigured = !!(siteKey && secretKey && siteKey.trim().length > 0 && secretKey.trim().length > 0);

      setSettings({
        siteKey: siteKey?.trim() || null,
        secretKey: secretKey?.trim() || null,
        isLoaded: true,
        isConfigured
      });

      console.log('✅ [PRODUCTION] reCAPTCHA settings loaded:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        siteKeyLength: siteKey?.length || 0,
        secretKeyLength: secretKey?.length || 0,
        isConfigured,
        environment: 'PRODUCTION'
      });

      if (!isConfigured) {
        console.warn('⚠️ [PRODUCTION] reCAPTCHA is NOT properly configured - missing or empty keys');
      }

    } catch (error) {
      console.error('❌ [PRODUCTION] Unexpected error loading reCAPTCHA settings:', error);
      setError('Erreur inattendue lors du chargement');
      
      // En cas d'erreur, on bloque l'application
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
    console.log('🔄 [PRODUCTION] Manual refresh of reCAPTCHA settings...');
    loadSettings();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
