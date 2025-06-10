
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CaptchaConfigurationErrorProps {
  settingsError: string | null;
  onRefetch: () => void;
  className?: string;
}

export const CaptchaConfigurationError = ({ 
  settingsError, 
  onRefetch, 
  className = "" 
}: CaptchaConfigurationErrorProps) => {
  const navigate = useNavigate();

  const handleConfigurationClick = () => {
    // Rediriger vers la page de gestion de la sécurité
    navigate('/security-management');
  };

  return (
    <div className={`p-6 bg-orange-50 rounded-lg border border-orange-200 ${className}`}>
      <Alert className="border-orange-200 bg-transparent">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-3">
            <div>
              <strong>Configuration CAPTCHA requise</strong>
              <p className="text-sm mt-1">
                {settingsError || "Les clés reCAPTCHA ne sont pas configurées correctement."}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefetch}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleConfigurationClick}
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
};
