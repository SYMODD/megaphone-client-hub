
import { supabase } from '@/integrations/supabase/client';
import { RecaptchaSettings, getGlobalCache, setGlobalCache, getCacheVersion, shouldRefreshCache } from './RecaptchaCache';

export const loadRecaptchaSettings = async (
  currentCacheVersion: number,
  forceRefresh: boolean = false
): Promise<RecaptchaSettings> => {
  const needsRefresh = shouldRefreshCache(currentCacheVersion, forceRefresh);

  console.log('🔑 [FIXED_LOADER] Chargement avec validation stricte:', {
    forceRefresh,
    hasCache: !!getGlobalCache(),
    currentVersion: currentCacheVersion,
    globalVersion: getCacheVersion(),
    needsRefresh,
    decision: needsRefresh ? 'CHARGEMENT_FRAIS' : 'CACHE_VALIDE'
  });

  if (!needsRefresh && getGlobalCache()) {
    console.log('✅ [FIXED_LOADER] Cache valide utilisé:', getGlobalCache());
    return getGlobalCache()!;
  }

  console.log('🔍 [FIXED_LOADER] Chargement FRAIS depuis Supabase avec validation stricte');
  
  // const { data, error } = await supabase
  //   .from('security_settings')
  //   .select('setting_key, setting_value')
  //   .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

  //   console.log("data============", data)

  // if (error) {
  //   console.error('❌ [FIXED_LOADER] Erreur Supabase:', error);
  //   throw new Error('Erreur lors du chargement des paramètres reCAPTCHA');
  // }

  // console.log('📊 [FIXED_LOADER] Données brutes reçues:', data);

  // const siteKey = data?.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || null;
  // const secretKey = data?.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || null;
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const secretKey = import.meta.env.VITE_RECATPCHA_SECRET_KEY

  // VALIDATION STRICTE RENFORCÉE
  const siteKeyValid = !!(siteKey && siteKey.trim() !== '' && siteKey.length > 10 && siteKey.startsWith('6L'));
  const secretKeyValid = !!(secretKey && secretKey.trim() !== '' && secretKey.length > 10 && secretKey.startsWith('6L'));
  const isConfigured = siteKeyValid && secretKeyValid;

  const newSettings: RecaptchaSettings = {
    siteKey,
    secretKey,
    isLoaded: true,
    isConfigured
  };

  console.log('✅ [FIXED_LOADER] VALIDATION STRICTE appliquée:', {
    siteKeyValid: siteKeyValid ? 'VALIDE ✅' : 'INVALIDE ❌',
    secretKeyValid: secretKeyValid ? 'VALIDE ✅' : 'INVALIDE ❌',
    siteKeyLength: siteKey?.length || 0,
    secretKeyLength: secretKey?.length || 0,
    siteKeyStart: siteKey ? siteKey.substring(0, 5) + '...' : 'VIDE',
    secretKeyStart: secretKey ? secretKey.substring(0, 5) + '...' : 'VIDE',
    isConfigured: isConfigured ? 'CONFIGURÉ ✅' : 'NON CONFIGURÉ ❌',
    finalStatus: isConfigured ? 'ACTIF_ET_PRET' : 'CONFIGURATION_REQUISE'
  });

  // Mise à jour du cache avec les nouveaux paramètres validés
  setGlobalCache(newSettings);

  return newSettings;
};
