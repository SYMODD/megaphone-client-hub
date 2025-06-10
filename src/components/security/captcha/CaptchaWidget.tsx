
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

  useEffect(() => {
    if (isScriptLoaded && captchaRef.current && window.grecaptcha && publicKey) {
      try {
        console.log('🔧 Rendu du widget reCAPTCHA avec la clé:', publicKey);
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
        onWidgetIdChange(id);
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
  }, [isScriptLoaded, publicKey, theme, size, onVerify, onExpire, onWidgetIdChange]);

  return (
    <div className={`captcha-container flex justify-center ${className}`}>
      <div ref={captchaRef} />
    </div>
  );
};
