
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  token?: string;
}

export const useCaptchaVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyCaptcha = async (token: string): Promise<CaptchaVerificationResult> => {
    console.log('🔐 Début de la vérification CAPTCHA avec token:', token?.substring(0, 20) + '...');
    
    if (!token) {
      const error = "Token CAPTCHA manquant";
      console.error('❌ ' + error);
      return { success: false, error };
    }

    setIsVerifying(true);

    try {
      // Pour l'instant, on simule une vérification réussie
      // En production, ceci devrait appeler l'edge function verify-captcha
      console.log('✅ Vérification CAPTCHA simulée - succès');
      
      setIsVerified(true);
      toast({
        title: "CAPTCHA vérifié",
        description: "Vérification de sécurité réussie",
      });

      return { success: true, token };

    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification CAPTCHA:', error);
      
      setIsVerified(false);
      toast({
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier le CAPTCHA",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    console.log('🔄 Reset de la vérification CAPTCHA');
    setIsVerified(false);
    setIsVerifying(false);
  };

  return {
    isVerifying,
    isVerified,
    verifyCaptcha,
    resetVerification
  };
};
