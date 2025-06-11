
import { useEffect, useState } from "react";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { CaptchaConfigurationError } from "./captcha/CaptchaConfigurationError";
import { CaptchaScriptError } from "./captcha/CaptchaScriptError";
import { CaptchaLoadingState } from "./captcha/CaptchaLoadingState";
import { CaptchaWidget } from "./captcha/CaptchaWidget";
import { useCaptchaScript } from "./captcha/useCaptchaScript";

interface CaptchaComponentProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
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
  theme = 'light', 
  size = 'normal',
  className = ""
}: CaptchaComponentProps) => {
  const [widgetId, setWidgetId] = useState<number | null>(null);
  
  const { publicKey, isLoading: settingsLoading, error: settingsError, refetch } = useCaptchaSettings();
  const { isScriptLoaded, scriptError, resetScript } = useCaptchaScript({ publicKey });

  // Cleanup lors du démontage
  useEffect(() => {
    return () => {
      if (widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.warn('⚠️ Erreur lors du reset du CAPTCHA:', error);
        }
      }
    };
  }, [widgetId]);

  const reset = () => {
    if (widgetId !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetId);
        console.log('🔄 CAPTCHA reset');
      } catch (error) {
        console.warn('⚠️ Erreur lors du reset:', error);
      }
    }
  };

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
        onRefetch={refetch}
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
        message="Chargement du CAPTCHA..." 
        className={className}
      />
    );
  }

  return (
    <CaptchaWidget
      publicKey={publicKey}
      isScriptLoaded={isScriptLoaded}
      theme={theme}
      size={size}
      onVerify={onVerify}
      onExpire={onExpire}
      onWidgetIdChange={setWidgetId}
      className={className}
    />
  );
};
