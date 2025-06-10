
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface CaptchaScriptErrorProps {
  onRetry: () => void;
  className?: string;
}

export const CaptchaScriptError = ({ onRetry, className = "" }: CaptchaScriptErrorProps) => {
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
              onClick={onRetry}
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
};
