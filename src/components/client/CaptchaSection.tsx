
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaptchaComponent } from "@/components/security/CaptchaComponent";
import { useCaptchaVerification } from "@/hooks/useCaptchaVerification";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CaptchaSectionProps {
  onVerificationChange: (isVerified: boolean) => void;
  required?: boolean;
}

export const CaptchaSection = ({ onVerificationChange, required = true }: CaptchaSectionProps) => {
  const { isVerifying, isVerified, verifyCaptcha, resetVerification } = useCaptchaVerification();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  const handleCaptchaVerify = async (token: string, score?: number) => {
    setCurrentToken(token);
    setCurrentScore(score || null);
    
    // Pour reCAPTCHA v3, on accepte généralement un score > 0.5
    const minScore = 0.5;
    const isScoreValid = !score || score >= minScore;
    
    if (!isScoreValid) {
      console.warn(`⚠️ Score CAPTCHA v3 trop faible: ${score} < ${minScore}`);
      resetVerification();
      onVerificationChange(false);
      return;
    }
    
    const result = await verifyCaptcha(token);
    onVerificationChange(result.success);
  };

  const handleCaptchaExpire = () => {
    setCurrentToken(null);
    setCurrentScore(null);
    resetVerification();
    onVerificationChange(false);
  };

  const getScoreDisplay = () => {
    if (currentScore === null) return null;
    
    const scoreColor = currentScore >= 0.7 ? "text-green-600" : 
                     currentScore >= 0.3 ? "text-orange-600" : "text-red-600";
    
    return (
      <div className={`text-xs ${scoreColor} flex items-center gap-1`}>
        {currentScore >= 0.7 ? <CheckCircle className="w-3 h-3" /> : 
         currentScore >= 0.3 ? <AlertTriangle className="w-3 h-3" /> : 
         <XCircle className="w-3 h-3" />}
        Score: {currentScore.toFixed(1)}/1.0
      </div>
    );
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
              Vérification de sécurité v3
              {required && <span className="text-red-500 text-sm">*</span>}
              {isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
              {currentToken && !isVerified && <XCircle className="w-4 h-4 text-red-600" />}
            </CardTitle>
            <CardDescription className="text-slate-600">
              Protection automatique contre les robots (reCAPTCHA v3)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <CaptchaComponent
            onVerify={handleCaptchaVerify}
            onExpire={handleCaptchaExpire}
            action="form_submit"
            className="w-full"
          />
          
          {isVerifying && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Vérification côté serveur...</span>
            </div>
          )}
          
          {isVerified && (
            <div className="flex flex-col items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Vérification réussie</span>
              </div>
              {getScoreDisplay()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
