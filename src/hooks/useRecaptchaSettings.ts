
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { recaptchaEventEmitter } from '@/hooks/recaptcha/RecaptchaEventEmitter';
import { loadRecaptchaSettings } from '@/hooks/recaptcha/RecaptchaSettingsLoader';
import { getCacheVersion } from '@/hooks/recaptcha/RecaptchaCache';

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
  const [cacheVersion, setCacheVersion] = useState(getCacheVersion());

  const loadSettings = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔑 [FIXED_HOOK] Chargement reCAPTCHA avec validation stricte', {
        forceRefresh,
        currentCacheVersion: cacheVersion
      });
      
      const newSettings = await loadRecaptchaSettings(cacheVersion, forceRefresh);
      
      // VALIDATION STRICTE ET CORRIGÉE
      const siteKeyValid = !!(newSettings.siteKey && newSettings.siteKey.trim() !== '' && newSettings.siteKey.length > 10);
      const secretKeyValid = !!(newSettings.secretKey && newSettings.secretKey.trim() !== '' && newSettings.secretKey.length > 10);
      const isConfigured = siteKeyValid && secretKeyValid;

      const validatedSettings = {
        ...newSettings,
        isConfigured,
        isLoaded: true
      };

      console.log('✅ [FIXED_HOOK] Configuration STRICTEMENT validée:', {
        siteKeyValid: siteKeyValid ? 'OUI ✅' : 'NON ❌',
        secretKeyValid: secretKeyValid ? 'OUI ✅' : 'NON ❌',
        isConfigured: isConfigured ? 'CONFIGURÉ ✅' : 'NON CONFIGURÉ ❌',
        siteKeyLength: newSettings.siteKey?.length || 0,
        secretKeyLength: newSettings.secretKey?.length || 0,
        siteKeyPreview: newSettings.siteKey ? newSettings.siteKey.substring(0, 15) + '...' : 'VIDE',
        secretKeyPreview: newSettings.secretKey ? newSettings.secretKey.substring(0, 15) + '...' : 'VIDE'
      });

      setSettings(validatedSettings);
      setCacheVersion(getCacheVersion());
      
    } catch (err) {
      console.error('❌ [FIXED_HOOK] Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des paramètres reCAPTCHA');
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

  // Synchronisation automatique avec les événements globaux
  useEffect(() => {
    const unsubscribe = recaptchaEventEmitter.subscribe(() => {
      console.log('🔄 [FIXED_HOOK] Synchronisation automatique détectée');
      loadSettings(true);
    });

    return unsubscribe;
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [FIXED_HOOK] Actualisation manuelle demandée');
    loadSettings(true);
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
