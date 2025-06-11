
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { toast } from "@/hooks/use-toast";

interface CaptchaSettings {
  publicKey: string | null;
  isLoading: boolean;
  error: string | null;
  debugInfo?: any; // Informations de debug temporaires
}

export const useCaptchaSettingsV2 = () => {
  const { getSecuritySettings } = useSecuritySettings();
  const [settings, setSettings] = useState<CaptchaSettings>({
    publicKey: null,
    isLoading: true,
    error: null
  });

  const fetchCaptchaSettings = async () => {
    try {
      console.log('🔄 [V2] DEBUT - Chargement des paramètres CAPTCHA...');
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      // ÉTAPE 1: Vérifier la fonction getSecuritySettings
      console.log('🔍 [V2] ÉTAPE 1: Test de la fonction getSecuritySettings');
      if (typeof getSecuritySettings !== 'function') {
        throw new Error('getSecuritySettings n\'est pas une fonction');
      }
      console.log('✅ [V2] getSecuritySettings est bien une fonction');

      // ÉTAPE 2: Appeler la fonction avec les paramètres CAPTCHA
      console.log('🔍 [V2] ÉTAPE 2: Appel de getSecuritySettings avec les clés CAPTCHA');
      const result = await getSecuritySettings(['recaptcha_public_key', 'recaptcha_secret_key']);
      
      console.log('📋 [V2] ÉTAPE 3: Analyse du résultat brut');
      console.log('📋 [V2] Type du résultat:', typeof result);
      console.log('📋 [V2] Résultat complet:', result);
      
      // ÉTAPE 3: Vérifications de base
      if (!result) {
        throw new Error('Aucun résultat retourné par getSecuritySettings');
      }

      if (typeof result !== 'object') {
        throw new Error(`Type de résultat inattendu: ${typeof result}`);
      }

      console.log('🔍 [V2] ÉTAPE 4: Vérification de result.success');
      console.log('📋 [V2] result.success:', result.success);
      console.log('📋 [V2] Type de result.success:', typeof result.success);

      if (result.success !== true) {
        console.warn('⚠️ [V2] result.success n\'est pas true:', result.success);
        throw new Error(`Échec de getSecuritySettings: ${result.error || 'Raison inconnue'}`);
      }

      console.log('🔍 [V2] ÉTAPE 5: Vérification de result.data');
      console.log('📋 [V2] result.data:', result.data);
      console.log('📋 [V2] Type de result.data:', typeof result.data);
      console.log('📋 [V2] Est un array:', Array.isArray(result.data));
      console.log('📋 [V2] Longueur:', result.data?.length);

      if (!result.data) {
        throw new Error('result.data est null ou undefined');
      }

      if (!Array.isArray(result.data)) {
        throw new Error(`result.data n'est pas un array: ${typeof result.data}`);
      }

      if (result.data.length === 0) {
        console.warn('⚠️ [V2] Aucun paramètre de sécurité trouvé');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Aucun paramètre CAPTCHA configuré",
          debugInfo: { step: 'no_data', result }
        });
        return;
      }

      console.log('🔍 [V2] ÉTAPE 6: Recherche de la clé publique');
      console.log('📋 [V2] Données disponibles:', result.data.map((item: any) => ({
        key: item.setting_key,
        valueLength: item.setting_value?.length,
        valueStart: item.setting_value?.substring(0, 20),
        isEncrypted: item.is_encrypted
      })));

      const publicKeySetting = result.data.find((s: any) => {
        console.log('🔍 [V2] Vérification:', s.setting_key, '===', 'recaptcha_public_key');
        return s.setting_key === 'recaptcha_public_key';
      });
      
      console.log('🔑 [V2] ÉTAPE 7: Analyse de la clé publique trouvée');
      console.log('📋 [V2] publicKeySetting:', publicKeySetting);

      if (!publicKeySetting) {
        console.warn('⚠️ [V2] Clé publique reCAPTCHA non trouvée dans les données');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA non configurée",
          debugInfo: { step: 'no_public_key', result, availableKeys: result.data.map((s: any) => s.setting_key) }
        });
        return;
      }

      console.log('🔍 [V2] ÉTAPE 8: Validation de la valeur de la clé publique');
      console.log('📋 [V2] setting_value brut:', publicKeySetting.setting_value);
      console.log('📋 [V2] Type:', typeof publicKeySetting.setting_value);
      console.log('📋 [V2] Longueur:', publicKeySetting.setting_value?.length);
      console.log('📋 [V2] Est vide après trim:', !publicKeySetting.setting_value?.trim());

      if (!publicKeySetting.setting_value) {
        throw new Error('La clé publique existe mais sa valeur est null/undefined');
      }

      if (typeof publicKeySetting.setting_value !== 'string') {
        throw new Error(`La valeur de la clé publique n'est pas une string: ${typeof publicKeySetting.setting_value}`);
      }

      const trimmedValue = publicKeySetting.setting_value.trim();
      
      if (trimmedValue === '') {
        console.warn('⚠️ [V2] Clé publique reCAPTCHA vide après trim');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA vide",
          debugInfo: { step: 'empty_value', publicKeySetting }
        });
        return;
      }

      if (trimmedValue === '[ENCRYPTED]') {
        console.warn('⚠️ [V2] Clé publique marquée comme chiffrée');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique incorrectement chiffrée",
          debugInfo: { step: 'encrypted_value', publicKeySetting }
        });
        return;
      }

      // SUCCÈS !
      console.log('✅ [V2] ÉTAPE 9: SUCCÈS - Clé publique CAPTCHA configurée');
      console.log('✅ [V2] Valeur finale:', trimmedValue);
      
      setSettings({
        publicKey: trimmedValue,
        isLoading: false,
        error: null,
        debugInfo: { step: 'success', publicKeySetting, finalValue: trimmedValue }
      });

    } catch (error: any) {
      console.error('❌ [V2] ERREUR lors du chargement des paramètres CAPTCHA:', error);
      console.error('❌ [V2] Stack trace:', error.stack);
      
      setSettings({
        publicKey: null,
        isLoading: false,
        error: `Erreur de chargement: ${error.message}`,
        debugInfo: { step: 'error', error: error.message, stack: error.stack }
      });
    }
  };

  useEffect(() => {
    fetchCaptchaSettings();
  }, []);

  const refetch = () => {
    console.log('🔄 [V2] Rechargement manuel des paramètres CAPTCHA');
    toast({
      title: "Rechargement V2",
      description: "Rechargement des paramètres CAPTCHA avec debug détaillé...",
    });
    fetchCaptchaSettings();
  };

  return {
    ...settings,
    refetch
  };
};
