
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaptchaComponent } from "@/components/security/CaptchaComponent";
import { useCaptchaVerification } from "@/hooks/useCaptchaVerification";
import { Shield, CheckCircle, XCircle } from "lucide-react";

interface CaptchaSectionProps {
  onVerificationChange: (isVerified: boolean) => void;
  required?: boolean;
}

export const CaptchaSection = ({ onVerificationChange, required = true }: CaptchaSectionProps) => {
  const { isVerifying, isVerified, verifyCaptcha, resetVerification } = useCaptchaVerification();
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const handleCaptchaVerify = async (token: string) => {
    setCurrentToken(token);
    const result = await verifyCaptcha(token);
    onVerificationChange(result.success);
  };

  const handleCaptchaExpire = () => {
    setCurrentToken(null);
    resetVerification();
    onVerificationChange(false);
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Vérification de sécurité
              {required && <span className="text-red-500 text-sm">*</span>}
              {isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
              {currentToken && !isVerified && <XCircle className="w-4 h-4 text-red-600" />}
            </CardTitle>
            <CardDescription className="text-slate-600">
              Veuillez compléter la vérification CAPTCHA pour continuer
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <CaptchaComponent
            onVerify={handleCaptchaVerify}
            onExpire={handleCaptchaExpire}
            theme="light"
            size="normal"
            className="mx-auto"
          />
          
          {isVerifying && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Vérification en cours...</span>
            </div>
          )}
          
          {isVerified && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Vérification réussie</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
