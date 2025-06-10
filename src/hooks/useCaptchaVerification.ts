
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  score?: number;
}

export const useCaptchaVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyCaptcha = async (token: string): Promise<CaptchaVerificationResult> => {
    if (!token) {
      return { success: false, error: "Token CAPTCHA manquant" };
    }

    setIsVerifying(true);
    
    try {
      console.log('🔒 Envoi du token CAPTCHA pour vérification...');
      
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { captchaToken: token }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'invocation de la function:', error);
        throw error;
      }

      console.log('📋 Réponse de vérification CAPTCHA:', data);

      if (data?.success) {
        setIsVerified(true);
        toast({
          title: "Vérification réussie",
          description: "CAPTCHA vérifié avec succès",
        });
        return { success: true, score: data.score };
      } else {
        setIsVerified(false);
        const errorMessage = data?.error || "Échec de la vérification CAPTCHA";
        toast({
          title: "Vérification échouée",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }

    } catch (error) {
      console.error('🚨 Erreur lors de la vérification CAPTCHA:', error);
      setIsVerified(false);
      const errorMessage = "Erreur lors de la vérification CAPTCHA";
      toast({
        title: "Erreur de vérification",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setIsVerified(false);
  };

  return {
    isVerifying,
    isVerified,
    verifyCaptcha,
    resetVerification
  };
};
