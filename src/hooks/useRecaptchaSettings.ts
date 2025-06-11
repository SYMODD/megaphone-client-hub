
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

// Event system pour la synchronisation entre hooks
class RecaptchaSettingsEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit() {
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

// Cache global pour éviter les requêtes répétées
let globalCache: RecaptchaSettings | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10000; // Réduit à 10 secondes pour une meilleure réactivité

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

      console.log('🔑 [DEBUG] Début du chargement des paramètres reCAPTCHA:', {
        forceRefresh,
        hasCache: !!globalCache,
        cacheAge: Date.now() - lastCacheTime,
        cacheDuration: CACHE_DURATION,
        isMounted: isMountedRef.current
      });

      // Utiliser le cache si disponible et récent (sauf si refresh forcé)
      if (!forceRefresh && globalCache && (Date.now() - lastCacheTime) < CACHE_DURATION) {
        console.log('✅ [DEBUG] Utilisation du cache reCAPTCHA:', globalCache);
        if (isMountedRef.current) {
          setSettings(globalCache);
          setIsLoading(false);
        }
        return;
      }

      console.log('🔍 [DEBUG] Chargement depuis Supabase...');
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ [DEBUG] Erreur Supabase:', error);
        if (isMountedRef.current) {
          setError('Erreur lors du chargement des paramètres reCAPTCHA');
        }
        return;
      }

      console.log('📊 [DEBUG] Données reçues de Supabase:', data);

      const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
      const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;

      // Validation stricte : les deux clés doivent être présentes ET non vides
      const isConfigured = !!(siteKey && secretKey && siteKey.trim() !== '' && secretKey.trim() !== '');

      const newSettings: RecaptchaSettings = {
        siteKey,
        secretKey,
        isLoaded: true,
        isConfigured
      };

      console.log('✅ [DEBUG] Paramètres reCAPTCHA traités:', {
        hasSiteKey: !!siteKey,
        hasSecretKey: !!secretKey,
        siteKeyLength: siteKey?.length || 0,
        secretKeyLength: secretKey?.length || 0,
        isConfigured,
        environment: 'PRODUCTION'
      });

      // Mettre à jour le cache global
      globalCache = newSettings;
      lastCacheTime = Date.now();

      if (isMountedRef.current) {
        setSettings(newSettings);
      }

    } catch (error) {
      console.error('❌ [DEBUG] Erreur inattendue:', error);
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
    console.log('🔄 [DEBUG] Refresh forcé des paramètres reCAPTCHA');
    // Invalider le cache
    globalCache = null;
    lastCacheTime = 0;
    hasLoadedRef.current = false;
    loadSettings(true);
    
    // Notifier les autres instances
    recaptchaEventEmitter.emit();
  };

  // Fonction utilitaire pour vider le cache (pour les tests)
  const clearCache = () => {
    console.log('🧹 [DEBUG] Nettoyage du cache reCAPTCHA');
    globalCache = null;
    lastCacheTime = 0;
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings,
    clearCache
  };
};

// Export de l'émetteur d'événements pour usage externe
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [NOTIFY] Notification de mise à jour des paramètres reCAPTCHA');
  globalCache = null;
  lastCacheTime = 0;
  recaptchaEventEmitter.emit();
};
