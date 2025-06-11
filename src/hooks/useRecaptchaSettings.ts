
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

// Event system amélioré pour la synchronisation entre hooks
class RecaptchaSettingsEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit() {
    console.log('📢 [EVENT_EMITTER] Notification de mise à jour envoyée à', this.listeners.length, 'listeners');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ [EVENT_EMITTER] Erreur lors de l\'appel du callback:', error);
      }
    });
  }
}

const recaptchaEventEmitter = new RecaptchaSettingsEventEmitter();

// Cache global amélioré avec gestion d'invalidation
let globalCache: RecaptchaSettings | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // Réduit à 5 secondes pour une meilleure réactivité

// Fonction pour invalider le cache globalement
const invalidateGlobalCache = () => {
  console.log('🗑️ [CACHE] Invalidation du cache global');
  globalCache = null;
  lastCacheTime = 0;
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

      console.log('🔑 [SETTINGS] Chargement des paramètres reCAPTCHA:', {
        forceRefresh,
        hasCache: !!globalCache,
        cacheAge: Date.now() - lastCacheTime,
        cacheDuration: CACHE_DURATION,
        isMounted: isMountedRef.current
      });

      // Utiliser le cache si disponible et récent (sauf si refresh forcé)
      if (!forceRefresh && globalCache && (Date.now() - lastCacheTime) < CACHE_DURATION) {
        console.log('✅ [SETTINGS] Utilisation du cache:', globalCache);
        if (isMountedRef.current) {
          setSettings(globalCache);
          setIsLoading(false);
        }
        return;
      }

      console.log('🔍 [SETTINGS] Chargement depuis Supabase...');
      
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

      console.log('📊 [SETTINGS] Données reçues de Supabase:', data);

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      // CORRECTION : Validation stricte mais plus permissive pour le développement
      const isConfigured = !!(siteKey && secretKey && siteKey.trim() !== '' && secretKey.trim() !== '');

      const newSettings: RecaptchaSettings = {
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      };

      console.log('✅ [SETTINGS] Paramètres reCAPTCHA traités:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        siteKeyLength: siteKey?.length || 0,
        secretKeyLength: secretKey?.length || 0,
        isConfigured,
        status: isConfigured ? 'CONFIGURÉ' : 'NON CONFIGURÉ'
      });

      // Mettre à jour le cache global
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
      console.log('🔄 [EVENT] Réception d\'un événement de mise à jour reCAPTCHA');
      hasLoadedRef.current = false;
      loadSettings(true);
    });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [SETTINGS] Refresh forcé des paramètres reCAPTCHA');
    // Invalider le cache
    invalidateGlobalCache();
    hasLoadedRef.current = false;
    loadSettings(true);
    
    // Notifier les autres instances avec un délai
    setTimeout(() => {
      recaptchaEventEmitter.emit();
    }, 100);
  };

  // Fonction utilitaire pour vider le cache (pour les tests)
  const clearCache = () => {
    console.log('🧹 [SETTINGS] Nettoyage du cache reCAPTCHA');
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

// Export de la fonction pour notifier les mises à jour
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [NOTIFY] Notification de mise à jour des paramètres reCAPTCHA');
  invalidateGlobalCache();
  setTimeout(() => {
    recaptchaEventEmitter.emit();
  }, 100);
};
