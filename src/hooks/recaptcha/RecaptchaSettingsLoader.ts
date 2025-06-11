
import { supabase } from '@/integrations/supabase/client';
import { RecaptchaSettings, getGlobalCache, setGlobalCache, getCacheVersion, shouldRefreshCache } from './RecaptchaCache';

export const loadRecaptchaSettings = async (
  currentCacheVersion: number,
  forceRefresh: boolean = false
): Promise<RecaptchaSettings> => {
  const needsRefresh = shouldRefreshCache(currentCacheVersion, forceRefresh);

  console.log('🔑 [SETTINGS] État de chargement:', {
    forceRefresh,
    hasCache: !!getGlobalCache(),
    currentVersion: currentCacheVersion,
    globalVersion: getCacheVersion(),
    needsRefresh,
    decision: needsRefresh ? 'CHARGEMENT FRAIS' : 'CACHE HIT'
  });

  if (!needsRefresh && getGlobalCache()) {
    console.log('✅ [SETTINGS] Cache HIT valide:', getGlobalCache());
    return getGlobalCache()!;
  }

  console.log('🔍 [SETTINGS] CHARGEMENT FRAIS depuis Supabase');
  
  const { data, error } = await supabase
    .from('security_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

  if (error) {
    console.error('❌ [SETTINGS] Erreur Supabase:', error);
    throw new Error('Erreur lors du chargement des paramètres reCAPTCHA');
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
  setGlobalCache(newSettings);

  return newSettings;
};
