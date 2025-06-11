
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

      console.log('🔑 [PRODUCTION] Chargement OBLIGATOIRE des clés reCAPTCHA...');
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ [PRODUCTION CRITICAL] Erreur chargement reCAPTCHA:', error);
        setError('Erreur critique lors du chargement des paramètres reCAPTCHA');
        
        // SÉCURITÉ : En cas d'erreur, BLOQUER l'application
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

      // VALIDATION STRICTE RENFORCÉE : les deux clés doivent être présentes ET valides
      const isConfigured = !!(
        siteKey && 
        secretKey && 
        siteKey.trim().length > 30 && 
        secretKey.trim().length > 30 &&
        siteKey.startsWith('6L') // Format Google reCAPTCHA
      );

      setSettings({
        siteKey: siteKey?.trim() || null,
        secretKey: secretKey?.trim() || null,
        isLoaded: true,
        isConfigured
      });

      console.log('🔒 [PRODUCTION] État reCAPTCHA:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        siteKeyValid: siteKey?.startsWith('6L') && siteKey.length > 30,
        secretKeyValid: secretKey && secretKey.length > 30,
        isConfigured,
        environment: 'PRODUCTION'
      });

      if (!isConfigured) {
        console.error('🚨 [PRODUCTION SECURITY] reCAPTCHA MAL CONFIGURÉ - APPLICATION BLOQUÉE');
        toast.error('Configuration de sécurité incomplète. Contactez l\'administrateur.');
      } else {
        console.log('✅ [PRODUCTION] reCAPTCHA correctement configuré et opérationnel');
      }

    } catch (error) {
      console.error('❌ [PRODUCTION CRITICAL] Erreur inattendue reCAPTCHA:', error);
      setError('Erreur critique du système de sécurité');
      
      // SÉCURITÉ : Bloquer l'application en cas d'erreur critique
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
    console.log('🔄 [PRODUCTION] Actualisation manuelle des paramètres reCAPTCHA...');
    loadSettings();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
