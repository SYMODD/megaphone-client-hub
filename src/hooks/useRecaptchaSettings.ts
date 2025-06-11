
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

// Event system pour synchronisation globale
class RecaptchaSettingsEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit() {
    console.log('📢 [EVENT_EMITTER] Notification IMMÉDIATE à', this.listeners.length, 'listeners');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ [EVENT_EMITTER] Erreur callback:', error);
      }
    });
  }
}

const recaptchaEventEmitter = new RecaptchaSettingsEventEmitter();

// Cache global avec invalidation IMMÉDIATE
let globalCache: RecaptchaSettings | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 500; // 500ms seulement pour forcer les refreshs

// Fonction pour invalider le cache - CORRECTION MAJEURE
const invalidateGlobalCache = () => {
  console.log('🗑️ [CACHE] INVALIDATION FORCÉE du cache global');
  globalCache = null;
  lastCacheTime = 0;
  // Forcer aussi la notification immédiate
  setTimeout(() => {
    recaptchaEventEmitter.emit();
  }, 10);
};

export const useRecaptchaSettings = () => {
  const [settings, setSettings] = useState<RecaptchaSettings>({
    siteKey: null,
    secretKey: null,
    isLoaded: false,
    isConfigured: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const loadSettings = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔑 [SETTINGS] Chargement reCAPTCHA:', {
        forceRefresh,
        hasCache: !!globalCache,
        cacheAge: Date.now() - lastCacheTime,
        cacheDuration: CACHE_DURATION,
        shouldUseCache: !forceRefresh && globalCache && (Date.now() - lastCacheTime) < CACHE_DURATION
      });

      // CORRECTION : Cache plus agressif, mais bypass si force refresh
      if (!forceRefresh && globalCache && (Date.now() - lastCacheTime) < CACHE_DURATION) {
        console.log('✅ [SETTINGS] Cache HIT:', globalCache);
        if (isMountedRef.current) {
          setSettings(globalCache);
          setIsLoading(false);
        }
        return;
      }

      console.log('🔍 [SETTINGS] Chargement FRAIS depuis Supabase (force:', forceRefresh, ')');
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ [SETTINGS] Erreur Supabase:', error);
        if (isMountedRef.current) {
          setError('Erreur lors du chargement des paramètres reCAPTCHA');
        }
        return;
      }

      console.log('📊 [SETTINGS] Données FRAÎCHES reçues:', data);

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      // CORRECTION : Validation stricte ET logging détaillé
      const hasSiteKey = !!(siteKey && siteKey.trim() !== '');
      const hasSecretKey = !!(secretKey && secretKey.trim() !== '');
      const isConfigured = hasSiteKey && hasSecretKey;

      const newSettings: RecaptchaSettings = {
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      };

      console.log('✅ [SETTINGS] NOUVEAU STATUT reCAPTCHA:', {
        hasSiteKey,
        hasSecretKey,
        siteKeyLength: siteKey?.length || 0,
        secretKeyLength: secretKey?.length || 0,
        isConfigured,
        status: isConfigured ? 'CONFIGURÉ ✅' : 'NON CONFIGURÉ ❌',
        timestamp: new Date().toISOString()
      });

      // CORRECTION : Mise à jour IMMÉDIATE du cache
      globalCache = newSettings;
      lastCacheTime = Date.now();

      if (isMountedRef.current) {
        setSettings(newSettings);
      }

    } catch (error) {
      console.error('❌ [SETTINGS] Erreur inattendue:', error);
      if (isMountedRef.current) {
        setError('Erreur inattendue lors du chargement');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Chargement initial
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSettings();
    }

    // S'abonner aux événements de mise à jour
    const unsubscribe = recaptchaEventEmitter.subscribe(() => {
      console.log('🔄 [EVENT] RÉCEPTION mise à jour reCAPTCHA - REFRESH FORCÉ');
      hasLoadedRef.current = false;
      loadSettings(true); // Force refresh
    });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [SETTINGS] REFRESH MANUEL FORCÉ');
    invalidateGlobalCache();
    hasLoadedRef.current = false;
    loadSettings(true);
  };

  const clearCache = () => {
    console.log('🧹 [SETTINGS] NETTOYAGE CACHE MANUEL');
    invalidateGlobalCache();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings,
    clearCache
  };
};

// CORRECTION : Export fonction pour notifier les mises à jour IMMÉDIATEMENT
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [NOTIFY] NOTIFICATION IMMÉDIATE de mise à jour reCAPTCHA');
  invalidateGlobalCache();
};
