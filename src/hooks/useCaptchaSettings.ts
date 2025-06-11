
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
      console.log('🔄 [V1] Chargement des paramètres CAPTCHA...');
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Récupérer uniquement la clé publique pour simplifier
      const result = await getSecuritySettings(['recaptcha_public_key']);
      
      console.log('📋 [V1] Résultat complet:', result);
      
      if (!result.success) {
        console.error('❌ [V1] Échec de récupération:', result.error);
        setSettings({
          publicKey: null,
          isLoading: false,
          error: `Erreur de récupération: ${result.error || 'Raison inconnue'}`
        });
        return;
      }

      // Vérifier si on a des données
      if (!result.data || !Array.isArray(result.data)) {
        console.warn('⚠️ [V1] Pas de données ou format invalide:', result.data);
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Aucune donnée retournée"
        });
        return;
      }

      console.log('📋 [V1] Nombre d\'éléments trouvés:', result.data.length);
      console.log('📋 [V1] Éléments:', result.data.map(item => ({ key: item.setting_key, value_length: item.setting_value?.length })));

      if (result.data.length === 0) {
        console.warn('⚠️ [V1] Aucune clé CAPTCHA trouvée');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Aucune clé CAPTCHA configurée - utilisez l'interface de test pour en ajouter"
        });
        return;
      }

      // Chercher la clé publique
      const publicKeySetting = result.data.find((s: any) => s.setting_key === 'recaptcha_public_key');
      
      if (!publicKeySetting) {
        console.warn('⚠️ [V1] Clé publique non trouvée dans les résultats');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique reCAPTCHA non configurée"
        });
        return;
      }

      // Valider la valeur
      const publicKeyValue = publicKeySetting.setting_value;
      
      if (!publicKeyValue || typeof publicKeyValue !== 'string') {
        console.warn('⚠️ [V1] Valeur de clé publique invalide:', publicKeyValue);
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Valeur de clé publique invalide"
        });
        return;
      }

      const trimmedValue = publicKeyValue.trim();
      
      if (trimmedValue === '' || trimmedValue === '[ENCRYPTED]') {
        console.warn('⚠️ [V1] Clé publique vide ou incorrectement chiffrée');
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Clé publique vide ou incorrectement configurée"
        });
        return;
      }

      // Succès !
      console.log('✅ [V1] Clé publique CAPTCHA récupérée avec succès:', trimmedValue.substring(0, 20) + '...');
      setSettings({
        publicKey: trimmedValue,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      console.error('❌ [V1] Erreur lors du chargement des paramètres CAPTCHA:', error);
      setSettings({
        publicKey: null,
        isLoading: false,
        error: `Erreur: ${error.message}`
      });
    }
  };

  useEffect(() => {
    fetchCaptchaSettings();
  }, []);

  const refetch = () => {
    console.log('🔄 [V1] Rechargement manuel des paramètres CAPTCHA');
    fetchCaptchaSettings();
  };

  return {
    ...settings,
    refetch
  };
};
