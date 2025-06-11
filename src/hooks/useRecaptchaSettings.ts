
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { RecaptchaSettings, getCacheVersion, forceInvalidateCache } from './recaptcha/RecaptchaCache';
import { loadRecaptchaSettings } from './recaptcha/RecaptchaSettingsLoader';
import { recaptchaEventEmitter } from './recaptcha/RecaptchaEventEmitter';

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

  const performLoad = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const newSettings = await loadRecaptchaSettings(currentCacheVersionRef.current, forceRefresh);
      currentCacheVersionRef.current = getCacheVersion();

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
      performLoad();
    }

    // S'abonner aux événements de mise à jour avec refresh FORCÉ
    const unsubscribe = recaptchaEventEmitter.subscribe(() => {
      console.log('🔄 [EVENT] RÉCEPTION mise à jour - REFRESH IMMÉDIAT FORCÉ');
      hasLoadedRef.current = false;
      
      // Triple notification pour s'assurer de la synchronisation
      setTimeout(() => performLoad(true), 10);
      setTimeout(() => performLoad(true), 100);
      setTimeout(() => performLoad(true), 300);
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
    performLoad(true);
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

// Re-export the notification function for backward compatibility
export { notifyRecaptchaSettingsUpdate } from './recaptcha/RecaptchaNotifications';
