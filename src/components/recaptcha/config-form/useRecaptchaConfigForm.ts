
import { useState, useEffect } from 'react';
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useRecaptchaManagement } from "@/hooks/useRecaptchaManagement";

export const useRecaptchaConfigForm = () => {
  const { siteKey, secretKey, isConfigured } = useRecaptchaSettings();
  const { saving, saveSettings, clearSettings } = useRecaptchaManagement();
  
  const [formData, setFormData] = useState({
    siteKey: '',
    secretKey: ''
  });
  const [showSecrets, setShowSecrets] = useState(false);

  // Charger les valeurs existantes au premier rendu
  useEffect(() => {
    if (siteKey || secretKey) {
      setFormData({
        siteKey: siteKey || '',
        secretKey: secretKey || ''
      });
    }
  }, [siteKey, secretKey]);

  const handleSave = () => {
    saveSettings(formData);
  };

  const handleClear = async () => {
    await clearSettings();
    setFormData({ siteKey: '', secretKey: '' });
  };

  const updateFormData = (field: 'siteKey' | 'secretKey', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    showSecrets,
    isConfigured,
    saving,
    setShowSecrets,
    updateFormData,
    handleSave,
    handleClear
  };
};
