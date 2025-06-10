
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";

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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const [scriptError, setScriptError] = useState(false);
  
  const { publicKey, isLoading: settingsLoading, error: settingsError, refetch } = useCaptchaSettings();

  // Charger le script reCAPTCHA une seule fois
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
  }, [publicKey, scriptError]);

  // Rendre le widget une fois que le script est chargé et qu'on a la clé
  useEffect(() => {
    if (isScriptLoaded && captchaRef.current && !widgetId && window.grecaptcha && publicKey) {
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
  }, [isScriptLoaded, publicKey, theme, size, onVerify, onExpire]);

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

  // État de chargement des paramètres
  if (settingsLoading) {
    return (
      <div className={`flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 font-medium">Chargement de la configuration CAPTCHA...</span>
        </div>
      </div>
    );
  }

  // Erreur de configuration
  if (settingsError || !publicKey) {
    return (
      <div className={`p-6 bg-orange-50 rounded-lg border border-orange-200 ${className}`}>
        <Alert className="border-orange-200 bg-transparent">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-3">
              <div>
                <strong>Configuration CAPTCHA requise</strong>
                <p className="text-sm mt-1">
                  {settingsError || "Les clés reCAPTCHA ne sont pas configurées."}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/security-management'}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Erreur de chargement du script
  if (scriptError) {
    return (
      <div className={`p-6 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <Alert className="border-red-200 bg-transparent">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <div>
                <strong>Erreur de chargement du service CAPTCHA</strong>
                <p className="text-sm mt-1">
                  Impossible de charger le service Google reCAPTCHA. Veuillez vérifier votre connexion internet.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setScriptError(false);
                  window.location.reload();
                }}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recharger la page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Script en cours de chargement
  if (!isScriptLoaded) {
    return (
      <div className={`flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 font-medium">Chargement du CAPTCHA...</span>
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
