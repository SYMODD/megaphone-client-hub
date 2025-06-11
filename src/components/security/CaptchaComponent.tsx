
import { useEffect, useState, useCallback } from "react";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { CaptchaConfigurationError } from "./captcha/CaptchaConfigurationError";
import { CaptchaScriptError } from "./captcha/CaptchaScriptError";
import { CaptchaLoadingState } from "./captcha/CaptchaLoadingState";
import { CaptchaV3Widget } from "./captcha/CaptchaV3Widget";
import { useCaptchaV3Script } from "./captcha/useCaptchaV3Script";

interface CaptchaComponentProps {
  onVerify: (token: string, score?: number) => void;
  onExpire?: () => void;
  action?: string; // Action spécifique pour reCAPTCHA v3
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const CaptchaComponent = ({ 
  onVerify, 
  onExpire, 
  action = 'submit', // Action par défaut
  className = ""
}: CaptchaComponentProps) => {
  const [componentKey, setComponentKey] = useState<number>(0);
  
  const { publicKey, isLoading: settingsLoading, error: settingsError, refetch } = useCaptchaSettings();
  const { isScriptLoaded, scriptError, resetScript } = useCaptchaV3Script({ publicKey });

  // Fonction pour forcer un nouveau rendu du widget
  const forceReset = useCallback(() => {
    console.log('🔄 Force reset du composant CAPTCHA v3');
    setComponentKey(prev => prev + 1);
  }, []);

  // Reset automatique lors des changements de clé publique
  useEffect(() => {
    if (publicKey) {
      forceReset();
    }
  }, [publicKey, forceReset]);

  // État de chargement des paramètres
  if (settingsLoading) {
    return (
      <CaptchaLoadingState 
        message="Chargement de la configuration CAPTCHA..." 
        className={className}
      />
    );
  }

  // Erreur de configuration
  if (settingsError || !publicKey) {
    return (
      <CaptchaConfigurationError
        settingsError={settingsError}
        onRefetch={() => {
          refetch();
          forceReset();
        }}
        className={className}
      />
    );
  }

  // Erreur de chargement du script
  if (scriptError) {
    return (
      <CaptchaScriptError
        onRetry={resetScript}
        className={className}
      />
    );
  }

  // Script en cours de chargement
  if (!isScriptLoaded) {
    return (
      <CaptchaLoadingState 
        message="Chargement du CAPTCHA v3..." 
        className={className}
      />
    );
  }

  return (
    <CaptchaV3Widget
      key={componentKey}
      publicKey={publicKey}
      isScriptLoaded={isScriptLoaded}
      action={action}
      onVerify={onVerify}
      onExpire={onExpire}
      className={className}
    />
  );
};
