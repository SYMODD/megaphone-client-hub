
export interface RecaptchaSettings {
  siteKey: string | null;
  secretKey: string | null;
  isLoaded: boolean;
  isConfigured: boolean;
}

// Cache global avec invalidation IMMÉDIATE et FORCÉE
let globalCache: RecaptchaSettings | null = null;
let cacheVersion = 0; // Version du cache pour forcer les mises à jour

// Fonction pour invalider IMMÉDIATEMENT le cache
export const forceInvalidateCache = () => {
  console.log('🗑️ [CACHE] INVALIDATION IMMÉDIATE ET FORCÉE');
  globalCache = null;
  cacheVersion++;
  console.log('🗑️ [CACHE] Nouvelle version du cache:', cacheVersion);
};

export const getGlobalCache = () => globalCache;

export const setGlobalCache = (settings: RecaptchaSettings) => {
  globalCache = settings;
};

export const getCacheVersion = () => cacheVersion;

export const shouldRefreshCache = (currentVersion: number, forceRefresh: boolean = false) => {
  return forceRefresh || !globalCache || currentVersion !== cacheVersion;
};
