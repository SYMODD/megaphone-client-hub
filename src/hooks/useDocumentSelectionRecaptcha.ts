
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { validateRecaptchaToken, RECAPTCHA_ACTIONS } from "@/services/recaptchaValidation";
import { toast } from "sonner";

export const useDocumentSelectionRecaptcha = () => {
  const { executeRecaptcha, isConfigured } = useRecaptchaV3();

  const validateDocumentSelection = async (): Promise<boolean> => {
    // Si reCAPTCHA n'est pas configuré, permettre l'accès
    if (!isConfigured) {
      console.log("⚠️ reCAPTCHA non configuré pour la sélection de document");
      return true;
    }

    try {
      console.log("🤖 Validation reCAPTCHA pour sélection de document");

      // Exécuter reCAPTCHA
      const token = await executeRecaptcha(RECAPTCHA_ACTIONS.DOCUMENT_SELECTION);
      
      if (!token) {
        console.error("❌ Impossible de générer le token reCAPTCHA");
        toast.error("Erreur de validation de sécurité");
        return false;
      }

      // Valider le token côté serveur
      const validationResult = await validateRecaptchaToken(
        token, 
        RECAPTCHA_ACTIONS.DOCUMENT_SELECTION
      );
      
      if (!validationResult.success) {
        console.error("❌ Validation reCAPTCHA échouée:", validationResult.error);
        toast.error("Validation de sécurité échouée");
        return false;
      }

      console.log(`✅ Sélection de document validée - Score: ${validationResult.score}`);
      return true;

    } catch (error) {
      console.error("❌ Erreur lors de la validation reCAPTCHA:", error);
      toast.error("Erreur de validation de sécurité");
      return false;
    }
  };

  return {
    validateDocumentSelection,
    isRecaptchaConfigured: isConfigured
  };
};
