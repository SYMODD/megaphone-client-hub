
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
  const [isLoading, setIsLoading] = useState(true);

  // IMPORTANT: Remplacez cette clé par votre vraie clé publique reCAPTCHA
  // Vous pouvez l'obtenir sur https://www.google.com/recaptcha/admin
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Clé de test - À REMPLACER

  useEffect(() => {
    // Éviter de charger le script plusieurs fois
    if (document.querySelector('script[src*="recaptcha"]')) {
      if (window.grecaptcha) {
        setIsLoaded(true);
        setIsLoading(false);
      }
      return;
    }

    // Charger le script reCAPTCHA
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
    script.async = true;
    script.defer = true;
    
    window.onRecaptchaLoad = () => {
      console.log('📋 Script reCAPTCHA chargé');
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('❌ Erreur lors du chargement du script reCAPTCHA');
      setIsLoading(false);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le service CAPTCHA",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup lors du démontage
      if (widgetId !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.warn('⚠️ Erreur lors du reset du CAPTCHA:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && captchaRef.current && !widgetId && window.grecaptcha) {
      try {
        console.log('🔧 Rendu du widget reCAPTCHA...');
        const id = window.grecaptcha.render(captchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme,
          size,
          callback: (token: string) => {
            console.log('✅ CAPTCHA résolu avec succès');
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
        console.log('✅ Widget reCAPTCHA rendu avec l\'ID:', id);
      } catch (error) {
        console.error('❌ Erreur lors du rendu CAPTCHA:', error);
        toast({
          title: "Erreur de rendu",
          description: "Impossible d'afficher le CAPTCHA",
          variant: "destructive",
        });
      }
    }
  }, [isLoaded, theme, size, onVerify, onExpire]);

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

  // Exposer la méthode reset via une ref
  useEffect(() => {
    if (captchaRef.current) {
      (captchaRef.current as any).reset = reset;
    }
  }, [widgetId]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 font-medium">Chargement du CAPTCHA...</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <span className="text-sm text-red-700 font-medium">Erreur de chargement du CAPTCHA</span>
          <p className="text-xs text-red-600 mt-1">Veuillez recharger la page</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`captcha-container flex justify-center ${className}`}>
      <div ref={captchaRef} />
    </div>
  );
};
