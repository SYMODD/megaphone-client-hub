
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

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
    onRecaptchaLoad: () => void;
  }
}

export const CaptchaComponent = ({ 
  onVerify, 
  onExpire, 
  theme = 'light', 
  size = 'normal',
  className = ""
}: CaptchaComponentProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);

  // Clé publique reCAPTCHA (à remplacer par votre vraie clé)
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Clé de test

  useEffect(() => {
    // Charger le script reCAPTCHA si pas déjà chargé
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      
      window.onRecaptchaLoad = () => {
        setIsLoaded(true);
      };
      
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    return () => {
      // Cleanup lors du démontage
      if (widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.warn('Erreur lors du reset du CAPTCHA:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && captchaRef.current && !widgetId) {
      try {
        const id = window.grecaptcha.render(captchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme,
          size,
          callback: (token: string) => {
            console.log('✅ CAPTCHA résolu');
            onVerify(token);
          },
          'expired-callback': () => {
            console.warn('⏰ CAPTCHA expiré');
            onExpire?.();
            toast({
              title: "CAPTCHA expiré",
              description: "Veuillez résoudre à nouveau le CAPTCHA",
              variant: "destructive",
            });
          },
          'error-callback': () => {
            console.error('❌ Erreur CAPTCHA');
            toast({
              title: "Erreur CAPTCHA",
              description: "Une erreur est survenue. Veuillez réessayer.",
              variant: "destructive",
            });
          }
        });
        setWidgetId(id);
      } catch (error) {
        console.error('Erreur lors du rendu CAPTCHA:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger le CAPTCHA",
          variant: "destructive",
        });
      }
    }
  }, [isLoaded, theme, size, onVerify, onExpire]);

  const reset = () => {
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
    }
  };

  // Exposer la méthode reset via une ref
  useEffect(() => {
    if (captchaRef.current) {
      (captchaRef.current as any).reset = reset;
    }
  }, [widgetId]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Chargement du CAPTCHA...</span>
      </div>
    );
  }

  return (
    <div className={`captcha-container ${className}`}>
      <div ref={captchaRef} />
    </div>
  );
};
