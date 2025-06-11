
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface UseCaptchaV3ScriptProps {
  publicKey: string | null;
}

declare global {
  interface Window {
    onRecaptchaV3Load: () => void;
    grecaptcha: any;
  }
}

export const useCaptchaV3Script = ({ publicKey }: UseCaptchaV3ScriptProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!publicKey || scriptError) return;

    // Vérifier si le script est déjà chargé
    if (document.querySelector('script[src*="recaptcha"]')) {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setIsScriptLoaded(true);
        });
      }
      return;
    }

    console.log('📋 Chargement du script reCAPTCHA v3 avec la clé:', publicKey);

    const script = document.createElement('script');
    // Pour reCAPTCHA v3, on charge le script avec la clé publique directement
    script.src = `https://www.google.com/recaptcha/api.js?render=${publicKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('✅ Script reCAPTCHA v3 chargé avec succès');
          setIsScriptLoaded(true);
          setScriptError(false);
        });
      }
    };

    script.onerror = () => {
      console.error('❌ Erreur lors du chargement du script reCAPTCHA v3');
      setScriptError(true);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le service CAPTCHA v3",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // On ne supprime pas le script car il pourrait être utilisé ailleurs
    };
  }, [publicKey, scriptError]);

  const resetScript = () => {
    setScriptError(false);
    window.location.reload();
  };

  return {
    isScriptLoaded,
    scriptError,
    resetScript
  };
};
