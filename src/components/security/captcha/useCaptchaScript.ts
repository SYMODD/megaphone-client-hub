
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface UseCaptchaScriptProps {
  publicKey: string | null;
}

declare global {
  interface Window {
    onRecaptchaLoad: () => void;
    grecaptcha: any;
  }
}

export const useCaptchaScript = ({ publicKey }: UseCaptchaScriptProps) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!publicKey || scriptError) return;

    // Éviter de charger le script plusieurs fois
    if (document.querySelector('script[src*="recaptcha"]')) {
      if (window.grecaptcha) {
        setIsScriptLoaded(true);
      }
      return;
    }

    console.log('📋 Chargement du script reCAPTCHA avec la clé:', publicKey);

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;
    
    window.onRecaptchaLoad = () => {
      console.log('✅ Script reCAPTCHA chargé avec succès');
      setIsScriptLoaded(true);
      setScriptError(false);
    };

    script.onerror = () => {
      console.error('❌ Erreur lors du chargement du script reCAPTCHA');
      setScriptError(true);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le service CAPTCHA",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);
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
