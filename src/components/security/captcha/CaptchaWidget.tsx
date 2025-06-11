
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface CaptchaWidgetProps {
  publicKey: string;
  isScriptLoaded: boolean;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onWidgetIdChange: (id: number | null) => void;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const CaptchaWidget = ({
  publicKey,
  isScriptLoaded,
  theme = 'light',
  size = 'normal',
  onVerify,
  onExpire,
  onWidgetIdChange,
  className = ""
}: CaptchaWidgetProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isRenderedRef = useRef<boolean>(false);

  // Fonction pour nettoyer le widget existant
  const cleanupWidget = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        console.log('🧹 Nettoyage du widget reCAPTCHA existant:', widgetIdRef.current);
        window.grecaptcha.reset(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderedRef.current = false;
        onWidgetIdChange(null);
      } catch (error) {
        console.warn('⚠️ Erreur lors du nettoyage du widget:', error);
      }
    }
  };

  // Fonction pour vider le conteneur DOM
  const clearContainer = () => {
    if (captchaRef.current) {
      captchaRef.current.innerHTML = '';
    }
  };

  useEffect(() => {
    if (isScriptLoaded && captchaRef.current && window.grecaptcha && publicKey && !isRenderedRef.current) {
      try {
        console.log('🔧 Rendu du widget reCAPTCHA avec la clé:', publicKey);
        
        // S'assurer que le conteneur est vide avant le rendu
        clearContainer();
        
        const id = window.grecaptcha.render(captchaRef.current, {
          sitekey: publicKey,
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
        
        widgetIdRef.current = id;
        isRenderedRef.current = true;
        onWidgetIdChange(id);
        console.log('✅ Widget reCAPTCHA rendu avec l\'ID:', id);
        
      } catch (error) {
        console.error('❌ Erreur lors du rendu CAPTCHA:', error);
        
        // Si l'erreur indique que le widget est déjà rendu, essayer de nettoyer et re-rendre
        if (error.message && error.message.includes('already been rendered')) {
          console.log('🔄 Tentative de nettoyage et nouveau rendu...');
          clearContainer();
          isRenderedRef.current = false;
          
          // Réessayer après un court délai
          setTimeout(() => {
            if (captchaRef.current && !isRenderedRef.current) {
              try {
                const id = window.grecaptcha.render(captchaRef.current, {
                  sitekey: publicKey,
                  theme,
                  size,
                  callback: onVerify,
                  'expired-callback': onExpire,
                  'error-callback': () => {
                    toast({
                      title: "Erreur CAPTCHA",
                      description: "Une erreur est survenue. Veuillez réessayer.",
                      variant: "destructive",
                    });
                  }
                });
                widgetIdRef.current = id;
                isRenderedRef.current = true;
                onWidgetIdChange(id);
                console.log('✅ Widget reCAPTCHA re-rendu avec succès:', id);
              } catch (retryError) {
                console.error('❌ Échec du nouveau rendu:', retryError);
                toast({
                  title: "Erreur de rendu",
                  description: "Impossible d'afficher le CAPTCHA",
                  variant: "destructive",
                });
              }
            }
          }, 100);
        } else {
          toast({
            title: "Erreur de rendu",
            description: "Impossible d'afficher le CAPTCHA",
            variant: "destructive",
          });
        }
      }
    }

    // Cleanup lors du démontage ou des changements de dépendances
    return () => {
      cleanupWidget();
    };
  }, [isScriptLoaded, publicKey, theme, size]);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      cleanupWidget();
      clearContainer();
    };
  }, []);

  return (
    <div className={`captcha-container flex justify-center ${className}`}>
      <div ref={captchaRef} />
    </div>
  );
};
