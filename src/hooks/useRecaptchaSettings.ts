
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

      console.log('🔑 [CORRECTED_HOOK] Chargement des paramètres reCAPTCHA', {
        forceRefresh,
        currentCacheVersion: cacheVersion
      });
      
      const newSettings = await loadRecaptchaSettings(cacheVersion, forceRefresh);
      
      // LOGIQUE CORRIGÉE : Validation stricte avec trim
      const hasSiteKey = !!(newSettings.siteKey && newSettings.siteKey.trim() !== '');
      const hasSecretKey = !!(newSettings.secretKey && newSettings.secretKey.trim() !== '');
      const isConfigured = hasSiteKey && hasSecretKey;

      const correctedSettings = {
        ...newSettings,
        isConfigured
      };

      console.log('✅ [CORRECTED_HOOK] Configuration CORRIGÉE:', {
        hasSiteKey,
        hasSecretKey,
        isConfigured: isConfigured ? 'OUI ✅' : 'NON ❌',
        siteKeyPreview: newSettings.siteKey ? newSettings.siteKey.substring(0, 15) + '...' : 'VIDE',
        secretKeyPreview: newSettings.secretKey ? newSettings.secretKey.substring(0, 15) + '...' : 'VIDE'
      });

      setSettings(correctedSettings);
      setCacheVersion(getCacheVersion());
      
    } catch (err) {
      console.error('❌ [CORRECTED_HOOK] Erreur:', err);
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

  // Synchronisation automatique avec les événements globaux
  useEffect(() => {
    const unsubscribe = recaptchaEventEmitter.subscribe(() => {
      console.log('🔄 [CORRECTED_HOOK] Synchronisation automatique détectée');
      loadSettings(true);
    });

    return unsubscribe;
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [CORRECTED_HOOK] Actualisation manuelle demandée');
    loadSettings(true);
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings
  };
};
