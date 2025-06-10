
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
      
      const result = await getSecuritySettings(['recaptcha_public_key']);
      
      console.log('📋 Résultat des paramètres CAPTCHA:', result);
      
      if (result.success && result.data) {
        const publicKeySetting = result.data.find((s: any) => s.setting_key === 'recaptcha_public_key');
        
        console.log('🔑 Clé publique trouvée:', publicKeySetting);
        
        if (publicKeySetting && publicKeySetting.setting_value && publicKeySetting.setting_value !== '[ENCRYPTED]') {
          console.log('✅ Clé publique CAPTCHA configurée');
          setSettings({
            publicKey: publicKeySetting.setting_value,
            isLoading: false,
            error: null
          });
        } else {
          console.warn('⚠️ Clé publique CAPTCHA non trouvée ou vide');
          setSettings({
            publicKey: null,
            isLoading: false,
            error: "Clé publique reCAPTCHA non configurée"
          });
        }
      } else {
        console.error('❌ Erreur lors du chargement des paramètres CAPTCHA:', result);
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
