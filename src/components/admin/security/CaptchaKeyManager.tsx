
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useCaptchaKeyManager } from "@/hooks/useCaptchaKeyManager";
import { CaptchaStatusAlert } from "./captcha/CaptchaStatusAlert";
import { CaptchaConfigForm } from "./captcha/CaptchaConfigForm";
import { CaptchaSettingsInfo } from "./captcha/CaptchaSettingsInfo";

export const CaptchaKeyManager = () => {
  const {
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
  } = useCaptchaKeyManager();

  if (fetchLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des clés reCAPTCHA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const publicKeySetting = getCurrentSetting('recaptcha_public_key');
  const secretKeySetting = getCurrentSetting('recaptcha_secret_key');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des clés reCAPTCHA
          </CardTitle>
          <CardDescription>
            Configurez les clés publique et secrète pour l'intégration reCAPTCHA.
            La clé secrète est automatiquement chiffrée lors de la sauvegarde.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CaptchaStatusAlert 
            publicKeySetting={publicKeySetting}
            secretKeySetting={secretKeySetting}
          />
          
          <CaptchaConfigForm
            formData={formData}
            setFormData={setFormData}
            showSecretKey={showSecretKey}
            setShowSecretKey={setShowSecretKey}
            saving={saving}
            loading={loading}
            onSave={saveSettings}
          />
        </CardContent>
      </Card>

      <CaptchaSettingsInfo 
        publicKeySetting={publicKeySetting}
        secretKeySetting={secretKeySetting}
      />
    </div>
  );
};
