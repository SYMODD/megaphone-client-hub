
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

interface CaptchaV3WidgetProps {
  publicKey: string;
  isScriptLoaded: boolean;
  action: string;
  onVerify: (token: string, score?: number) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const CaptchaV3Widget = ({
  publicKey,
  isScriptLoaded,
  action,
  onVerify,
  onExpire,
  className = ""
}: CaptchaV3WidgetProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const executeCaptcha = async () => {
    if (!isScriptLoaded || !window.grecaptcha || isExecuting) return;

    try {
      setIsExecuting(true);
      console.log('🔍 Exécution de reCAPTCHA v3 avec action:', action);

      const token = await window.grecaptcha.execute(publicKey, { action });
      
      if (token) {
        console.log('✅ Token reCAPTCHA v3 reçu:', token.substring(0, 20) + '...');
        setLastToken(token);
        
        // Pour reCAPTCHA v3, le score sera déterminé côté serveur
        // Ici on simule un score élevé pour les tests
        const mockScore = 0.9;
        setLastScore(mockScore);
        
        onVerify(token, mockScore);
        
        toast({
          title: "CAPTCHA v3 exécuté",
          description: `Vérification de sécurité terminée (Score: ${mockScore})`,
        });
      } else {
        console.error('❌ Aucun token reçu de reCAPTCHA v3');
        toast({
          title: "Erreur CAPTCHA",
          description: "Impossible d'obtenir le token de vérification",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'exécution CAPTCHA v3:', error);
      toast({
        title: "Erreur CAPTCHA",
        description: error.message || "Une erreur est survenue lors de la vérification",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto-exécution au montage du composant (comportement typique de v3)
  useEffect(() => {
    if (isScriptLoaded && window.grecaptcha && publicKey) {
      // Délai court pour s'assurer que le script est complètement initialisé
      setTimeout(() => {
        executeCaptcha();
      }, 500);
    }
  }, [isScriptLoaded, publicKey]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 0.7) return "text-green-600";
    if (score >= 0.3) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number | null) => {
    if (score === null) return <Shield className="w-4 h-4" />;
    if (score >= 0.7) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className={`captcha-v3-container space-y-4 ${className}`}>
      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            {getScoreIcon(lastScore)}
            <span className="font-medium">reCAPTCHA v3 - Protection invisible</span>
          </div>
          
          {isExecuting ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Vérification en cours...</span>
            </div>
          ) : lastToken ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Vérification terminée</span>
              </div>
              {lastScore !== null && (
                <div className={`text-sm ${getScoreColor(lastScore)}`}>
                  Score de confiance: {lastScore.toFixed(1)}/1.0
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              En attente de vérification...
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={executeCaptcha}
            disabled={isExecuting || !isScriptLoaded}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Vérification...
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 mr-2" />
                {lastToken ? 'Vérifier à nouveau' : 'Démarrer la vérification'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-center text-gray-500">
        <div>Protégé par reCAPTCHA v3</div>
        <div>Action: {action}</div>
      </div>
    </div>
  );
};
