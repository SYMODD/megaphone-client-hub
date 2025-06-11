
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { toast } from "@/hooks/use-toast";

interface CaptchaSettings {
  publicKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCaptchaSettings = () => {
  const { getSecuritySettings } = useSecuritySettings();
  const [settings, setSettings] = useState<CaptchaSettings>({
    publicKey: null,
    isLoading: true,
    error: null
  });

  const fetchCaptchaSettings = async () => {
    try {
      console.log('🔄 Chargement des paramètres CAPTCHA...');
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Récupérer les clés CAPTCHA
      const result = await getSecuritySettings(['recaptcha_public_key', 'recaptcha_secret_key']);
      
      console.log('📋 Résultat des paramètres CAPTCHA:', result);
      
      // Vérifier que la requête a réussi
      if (!result.success) {
        console.error('❌ Échec de récupération des paramètres:', result.error);
        throw new Error(`Échec de getSecuritySettings: ${result.error || 'Raison inconnue'}`);
      }

      // Vérifier que nous avons des données
      if (!result.data || !Array.isArray(result.data)) {
        console.error('❌ Données invalides:', result.data);
        throw new Error('Données invalides retournées par getSecuritySettings');
      }

      if (result.data.length === 0) {
        console.warn('⚠️ Aucun paramètre CAPTCHA trouvé');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Aucun paramètre CAPTCHA configuré"
        });
        return;
      }

      // Chercher la clé publique
      const publicKeySetting = result.data.find((s: any) => s.setting_key === 'recaptcha_public_key');
      
      console.log('🔑 Clé publique trouvée:', publicKeySetting);
      
      if (!publicKeySetting) {
        console.warn('⚠️ Clé publique reCAPTCHA non trouvée');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA non configurée"
        });
        return;
      }

      // Vérifier la valeur de la clé publique
      if (!publicKeySetting.setting_value || typeof publicKeySetting.setting_value !== 'string') {
        console.warn('⚠️ Valeur de clé publique invalide:', publicKeySetting.setting_value);
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA invalide"
        });
        return;
      }

      const trimmedValue = publicKeySetting.setting_value.trim();
      
      if (trimmedValue === '') {
        console.warn('⚠️ Clé publique reCAPTCHA vide');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA vide"
        });
        return;
      }

      if (trimmedValue === '[ENCRYPTED]') {
        console.warn('⚠️ Clé publique marquée comme chiffrée (erreur de configuration)');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique incorrectement chiffrée"
        });
        return;
      }

      // Succès !
      console.log('✅ Clé publique CAPTCHA configurée:', trimmedValue);
      setSettings({
        publicKey: trimmedValue,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des paramètres CAPTCHA:', error);
      setSettings({
        publicKey: null,
        isLoading: false,
        error: `Erreur de chargement: ${error.message}`
      });
    }
  };

  useEffect(() => {
    fetchCaptchaSettings();
  }, []);

  const refetch = () => {
    console.log('🔄 Rechargement manuel des paramètres CAPTCHA');
    toast({
      title: "Rechargement",
      description: "Rechargement des paramètres CAPTCHA...",
    });
    fetchCaptchaSettings();
  };

  return {
    ...settings,
    refetch
  };
};
