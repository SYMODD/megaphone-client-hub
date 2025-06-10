
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";

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
      setSettings(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await getSecuritySettings(['recaptcha_public_key']);
      
      if (result.success && result.data) {
        const publicKeySetting = result.data.find((s: any) => s.setting_key === 'recaptcha_public_key');
        
        if (publicKeySetting && publicKeySetting.setting_value) {
          setSettings({
            publicKey: publicKeySetting.setting_value,
            isLoading: false,
            error: null
          });
        } else {
          setSettings({
            publicKey: null,
            isLoading: false,
            error: "Clé publique reCAPTCHA non configurée"
          });
        }
      } else {
        setSettings({
          publicKey: null,
          isLoading: false,
          error: "Impossible de charger les paramètres CAPTCHA"
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres CAPTCHA:', error);
      setSettings({
        publicKey: null,
        isLoading: false,
        error: "Erreur lors du chargement des paramètres CAPTCHA"
      });
    }
  };

  useEffect(() => {
    fetchCaptchaSettings();
  }, []);

  return {
    ...settings,
    refetch: fetchCaptchaSettings
  };
};
