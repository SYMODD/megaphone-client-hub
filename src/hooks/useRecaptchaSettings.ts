
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

// Event system pour synchronisation globale IMMÉDIATE
class RecaptchaSettingsEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    console.log('📢 [EVENT_EMITTER] Nouvel abonné, total:', this.listeners.length);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📢 [EVENT_EMITTER] Désabonnement, restant:', this.listeners.length);
    };
  }

  emit() {
    console.log('📢 [EVENT_EMITTER] DIFFUSION IMMÉDIATE à', this.listeners.length, 'listeners');
    this.listeners.forEach((callback, index) => {
      try {
        console.log(`📢 [EVENT_EMITTER] Notification listener ${index + 1}`);
        callback();
      } catch (error) {
        console.error(`❌ [EVENT_EMITTER] Erreur listener ${index + 1}:`, error);
      }
    });
  }
}

const recaptchaEventEmitter = new RecaptchaSettingsEventEmitter();

// Cache global avec invalidation IMMÉDIATE et FORCÉE
let globalCache: RecaptchaSettings | null = null;
let cacheVersion = 0; // Version du cache pour forcer les mises à jour

// Fonction pour invalider IMMÉDIATEMENT le cache
const forceInvalidateCache = () => {
  console.log('🗑️ [CACHE] INVALIDATION IMMÉDIATE ET FORCÉE');
  globalCache = null;
  cacheVersion++;
  console.log('🗑️ [CACHE] Nouvelle version du cache:', cacheVersion);
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
  const currentCacheVersionRef = useRef(0);

  const loadSettings = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const needsRefresh = forceRefresh || 
                          !globalCache || 
                          currentCacheVersionRef.current !== cacheVersion;

      console.log('🔑 [SETTINGS] État de chargement:', {
        forceRefresh,
        hasCache: !!globalCache,
        currentVersion: currentCacheVersionRef.current,
        globalVersion: cacheVersion,
        needsRefresh,
        decision: needsRefresh ? 'CHARGEMENT FRAIS' : 'CACHE HIT'
      });

      if (!needsRefresh && globalCache) {
        console.log('✅ [SETTINGS] Cache HIT valide:', globalCache);
        if (isMountedRef.current) {
          setSettings(globalCache);
          setIsLoading(false);
        }
        return;
      }

      console.log('🔍 [SETTINGS] CHARGEMENT FRAIS depuis Supabase');
      
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

      // Validation stricte avec logging détaillé
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
        siteKeyPreview: siteKey ? siteKey.substring(0, 10) + '...' : 'VIDE',
        secretKeyPreview: secretKey ? secretKey.substring(0, 10) + '...' : 'VIDE',
        isConfigured,
        status: isConfigured ? 'CONFIGURÉ ✅' : 'NON CONFIGURÉ ❌',
        timestamp: new Date().toISOString()
      });

      // Mise à jour IMMÉDIATE du cache avec nouvelle version
      globalCache = newSettings;
      currentCacheVersionRef.current = cacheVersion;

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
      console.log('🚀 [SETTINGS] Chargement initial');
      loadSettings();
    }

    // S'abonner aux événements de mise à jour avec refresh FORCÉ
    const unsubscribe = recaptchaEventEmitter.subscribe(() => {
      console.log('🔄 [EVENT] RÉCEPTION mise à jour - REFRESH IMMÉDIAT FORCÉ');
      hasLoadedRef.current = false;
      
      // Triple notification pour s'assurer de la synchronisation
      setTimeout(() => loadSettings(true), 10);
      setTimeout(() => loadSettings(true), 100);
      setTimeout(() => loadSettings(true), 300);
    });

    // Cleanup
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const refreshSettings = () => {
    console.log('🔄 [SETTINGS] REFRESH MANUEL DÉCLENCHÉ');
    forceInvalidateCache();
    hasLoadedRef.current = false;
    loadSettings(true);
  };

  const clearCache = () => {
    console.log('🧹 [SETTINGS] NETTOYAGE CACHE MANUEL');
    forceInvalidateCache();
  };

  return {
    ...settings,
    isLoading,
    error,
    refreshSettings,
    clearCache
  };
};

// Export fonction pour notifier les mises à jour avec INVALIDATION FORCÉE
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [NOTIFY] INVALIDATION + NOTIFICATION IMMÉDIATE');
  forceInvalidateCache();
  
  // Triple émission pour garantir la réception
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 1/3');
    recaptchaEventEmitter.emit();
  }, 10);
  
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 2/3');
    recaptchaEventEmitter.emit();
  }, 100);
  
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 3/3');
    recaptchaEventEmitter.emit();
  }, 300);
};
