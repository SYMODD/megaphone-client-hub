
import { supabase } from "@/integrations/supabase/client";

interface RecaptchaValidationResult {
  success: boolean;
  score?: number;
  error?: string;
}

export const validateRecaptchaToken = async (
  token: string, 
  action: string
): Promise<RecaptchaValidationResult> => {
  try {
    console.log(`🔍 Validation reCAPTCHA pour l'action: ${action}`);

    const { data, error } = await supabase.functions.invoke('validate-recaptcha', {
      body: { token, action }
    });

    if (error) {
      console.error("❌ Erreur lors de la validation reCAPTCHA:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Validation reCAPTCHA réussie - Score: ${data.score}`);
    return {
      success: data.success,
      score: data.score
    };
  } catch (error) {
    console.error("❌ Erreur validation reCAPTCHA:", error);
    return { 
      success: false, 
      error: "Erreur lors de la validation du captcha" 
    };
  }
};

export const RECAPTCHA_ACTIONS = {
  LOGIN_ADMIN: 'login_admin',
  LOGIN_SUPERVISEUR: 'login_superviseur', 
  DOCUMENT_SELECTION: 'document_selection'
} as const;

export type RecaptchaAction = typeof RECAPTCHA_ACTIONS[keyof typeof RECAPTCHA_ACTIONS];
