
import { useState } from "react";
import { CaptchaComponent } from "@/components/security/CaptchaComponent";
import { useCaptchaVerification } from "@/hooks/useCaptchaVerification";
import { Shield, CheckCircle } from "lucide-react";

interface LoginCaptchaSectionProps {
  onVerificationChange: (isVerified: boolean) => void;
  show: boolean;
}

export const LoginCaptchaSection = ({ onVerificationChange, show }: LoginCaptchaSectionProps) => {
  const { isVerifying, isVerified, verifyCaptcha, resetVerification } = useCaptchaVerification();

  const handleCaptchaVerify = async (token: string) => {
    const result = await verifyCaptcha(token);
    onVerificationChange(result.success);
  };

  const handleCaptchaExpire = () => {
    resetVerification();
    onVerificationChange(false);
  };

  if (!show) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Shield className="w-4 h-4" />
        <span>Vérification de sécurité requise</span>
        {isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
      </div>
      
      <div className="flex justify-center">
        <CaptchaComponent
          onVerify={handleCaptchaVerify}
          onExpire={handleCaptchaExpire}
          action="login"
          className="w-full"
        />
      </div>
      
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="text-xs">Vérification...</span>
        </div>
      )}
    </div>
  );
};
