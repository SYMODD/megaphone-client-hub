
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

      console.log('🔑 Loading reCAPTCHA settings from Supabase...');
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ Error loading reCAPTCHA settings:', error);
        setError('Erreur lors du chargement des paramètres reCAPTCHA');
        return;
      }

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      const isConfigured = !!(siteKey && secretKey);

      setSettings({
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      });

      console.log('✅ reCAPTCHA settings loaded:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        isConfigured
      });

    } catch (error) {
      console.error('❌ Unexpected error loading reCAPTCHA settings:', error);
      setError('Erreur inattendue lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = () => {
    console.log('🔄 Refreshing reCAPTCHA settings...');
    loadSettings();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
