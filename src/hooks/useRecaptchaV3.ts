
import { useState, useEffect, useCallback } from "react";
import { useRecaptchaSettings } from "./useRecaptchaSettings";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const useRecaptchaV3 = () => {
  const { settings, loading: settingsLoading } = useRecaptchaSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger le script reCAPTCHA v3
  const loadRecaptchaScript = useCallback(() => {
    if (!settings.siteKey || !settings.isLoaded) {
      console.log("⚠️ reCAPTCHA: Clés non configurées, script non chargé");
      return;
    }

    if (window.grecaptcha || document.querySelector('script[src*="recaptcha"]')) {
      console.log("✅ reCAPTCHA: Script déjà chargé");
      setIsLoaded(true);
      return;
    }

    console.log("📥 reCAPTCHA: Chargement du script...");
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${settings.siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ reCAPTCHA: Script chargé avec succès");
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error("❌ reCAPTCHA: Erreur lors du chargement du script");
      setIsLoaded(false);
    };

    document.head.appendChild(script);
  }, [settings.siteKey, settings.isLoaded]);

  // Exécuter reCAPTCHA pour une action donnée
  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha || !settings.siteKey) {
      console.log("⚠️ reCAPTCHA: Non disponible pour l'action", action);
      return null;
    }

    try {
      setLoading(true);
      console.log(`🔄 reCAPTCHA: Exécution pour l'action "${action}"`);
      
      const token = await window.grecaptcha.execute(settings.siteKey, { action });
      
      console.log(`✅ reCAPTCHA: Token généré pour "${action}"`);
      return token;
    } catch (error) {
      console.error(`❌ reCAPTCHA: Erreur lors de l'exécution pour "${action}":`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoaded, settings.siteKey]);

  // Charger le script quand les paramètres sont prêts
  useEffect(() => {
    if (!settingsLoading && settings.isLoaded) {
      loadRecaptchaScript();
    }
  }, [settingsLoading, settings.isLoaded, loadRecaptchaScript]);

  return {
    isLoaded: isLoaded && settings.isLoaded,
    loading,
    executeRecaptcha,
    isConfigured: settings.isLoaded
  };
};
