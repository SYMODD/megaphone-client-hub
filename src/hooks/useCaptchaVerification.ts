
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  token?: string;
  score?: number;
}

export const useCaptchaVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyCaptcha = async (token: string): Promise<CaptchaVerificationResult> => {
    console.log('🔐 Début de la vérification CAPTCHA v3 avec token:', token?.substring(0, 20) + '...');
    
    if (!token) {
      const error = "Token CAPTCHA manquant";
      console.error('❌ ' + error);
      return { success: false, error };
    }

    setIsVerifying(true);

    try {
      console.log('📡 Appel de l\'edge function verify-captcha...');
      
      // Appel de l'edge function pour vérifier le token côté serveur
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { captchaToken: token }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'appel à verify-captcha:', error);
        throw new Error(error.message || 'Erreur de communication avec le service de vérification');
      }

      console.log('📊 Résultat de verify-captcha:', data);

      if (data.success) {
        console.log('✅ Vérification CAPTCHA v3 réussie');
        
        if (data.score !== undefined) {
          console.log(`📊 Score CAPTCHA v3: ${data.score}`);
          
          // Vérification du score minimum (0.5 est une valeur raisonnable pour v3)
          const minScore = 0.5;
          if (data.score < minScore) {
            console.warn(`⚠️ Score trop faible: ${data.score} < ${minScore}`);
            setIsVerified(false);
            toast({
              title: "Score de sécurité insuffisant",
              description: `Score obtenu: ${data.score.toFixed(1)}/1.0. Veuillez réessayer.`,
              variant: "destructive",
            });
            return { success: false, error: "Score insuffisant", score: data.score };
          }
        }
        
        setIsVerified(true);
        toast({
          title: "CAPTCHA vérifié",
          description: data.score ? `Vérification réussie (Score: ${data.score.toFixed(1)}/1.0)` : "Vérification de sécurité réussie",
        });

        return { success: true, token, score: data.score };
      } else {
        console.error('❌ Échec de la vérification CAPTCHA:', data.error);
        
        setIsVerified(false);
        toast({
          title: "Échec de la vérification",
          description: data.error || "Impossible de vérifier le CAPTCHA",
          variant: "destructive",
        });

        return { success: false, error: data.error };
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification CAPTCHA v3:', error);
      
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
    console.log('🔄 Reset de la vérification CAPTCHA v3');
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
