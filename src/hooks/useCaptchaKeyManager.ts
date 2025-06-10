
import { useState, useEffect } from "react";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_encrypted: boolean;
  description: string;
  updated_at: string;
  updated_by: string;
}

interface CaptchaFormData {
  public_key: string;
  secret_key: string;
}

export const useCaptchaKeyManager = () => {
  const { loading, getSecuritySettings, upsertSecuritySetting } = useSecuritySettings();
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [formData, setFormData] = useState<CaptchaFormData>({
    public_key: "",
    secret_key: ""
  });

  const fetchSettings = async () => {
    try {
      setFetchLoading(true);
      
      const result = await getSecuritySettings(['recaptcha_public_key', 'recaptcha_secret_key']);
      
      if (result.success && result.data) {
        setSettings(result.data);
        
        // Pré-remplir le formulaire avec les valeurs existantes
        const publicKey = result.data.find((s: SecuritySetting) => s.setting_key === 'recaptcha_public_key')?.setting_value || '';
        const secretKey = result.data.find((s: SecuritySetting) => s.setting_key === 'recaptcha_secret_key')?.setting_value || '';
        
        setFormData({
          public_key: publicKey,
          secret_key: secretKey
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!formData.public_key.trim()) {
      return;
    }

    if (!formData.secret_key.trim()) {
      return;
    }

    try {
      setSaving(true);
      
      // Sauvegarder la clé publique (non chiffrée)
      const publicResult = await upsertSecuritySetting(
        'recaptcha_public_key',
        formData.public_key.trim(),
        false,
        'Clé publique reCAPTCHA pour la vérification côté client'
      );

      if (!publicResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé publique');
      }

      // Sauvegarder la clé secrète (chiffrée)
      const secretResult = await upsertSecuritySetting(
        'recaptcha_secret_key', 
        formData.secret_key.trim(),
        true,
        'Clé secrète reCAPTCHA pour la vérification côté serveur'
      );

      if (!secretResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé secrète');
      }

      // Recharger les paramètres
      await fetchSettings();

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSetting = (key: string) => {
    return settings.find(s => s.setting_key === key);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    formData,
    setFormData,
    fetchLoading,
    saving,
    showSecretKey,
    setShowSecretKey,
    loading,
    saveSettings,
    getCurrentSetting
  };
};
