
import { useEffect, useState, useCallback } from "react";
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
  const [componentKey, setComponentKey] = useState<number>(0);
  
  const { publicKey, isLoading: settingsLoading, error: settingsError, refetch } = useCaptchaSettings();
  const { isScriptLoaded, scriptError, resetScript } = useCaptchaScript({ publicKey });

  // Fonction pour forcer un nouveau rendu du widget
  const forceReset = useCallback(() => {
    console.log('🔄 Force reset du composant CAPTCHA');
    setWidgetId(null);
    setComponentKey(prev => prev + 1);
  }, []);

  // Reset automatique lors des changements de clé publique
  useEffect(() => {
    if (publicKey) {
      forceReset();
    }
  }, [publicKey, forceReset]);

  // Cleanup lors du démontage
  useEffect(() => {
    return () => {
      if (widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.warn('⚠️ Erreur lors du reset final du CAPTCHA:', error);
        }
      }
    };
  }, [widgetId]);

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
        message="Chargement du CAPTCHA..." 
        className={className}
      />
    );
  }

  return (
    <CaptchaWidget
      key={componentKey} // Force un nouveau rendu à chaque reset
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
