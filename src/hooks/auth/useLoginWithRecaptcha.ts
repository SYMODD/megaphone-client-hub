
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorHandling } from "./useAuthErrorHandling";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { validateRecaptchaToken, RECAPTCHA_ACTIONS, RecaptchaAction } from "@/services/recaptchaValidation";

interface UseLoginWithRecaptchaProps {
  role: 'admin' | 'superviseur';
}

export const useLoginWithRecaptcha = ({ role }: UseLoginWithRecaptchaProps) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { handleAuthError, showSuccess, clearMessages } = useAuthErrorHandling();
  const { executeRecaptcha, isConfigured } = useRecaptchaV3();

  const handleLogin = async (email: string, password: string) => {
    clearMessages();
    setIsLoading(true);

    try {
      console.log(`🔐 Début connexion ${role} avec reCAPTCHA`);

      // Déterminer l'action reCAPTCHA selon le rôle
      const recaptchaAction: RecaptchaAction = role === 'admin' 
        ? RECAPTCHA_ACTIONS.LOGIN_ADMIN 
        : RECAPTCHA_ACTIONS.LOGIN_SUPERVISEUR;

      // Vérifier si reCAPTCHA est configuré
      if (!isConfigured) {
        console.warn("⚠️ reCAPTCHA non configuré, connexion sans validation");
        // Continuer sans reCAPTCHA si non configuré
      } else {
        // Exécuter reCAPTCHA
        console.log(`🤖 Exécution reCAPTCHA pour: ${recaptchaAction}`);
        const token = await executeRecaptcha(recaptchaAction);
        
        if (!token) {
          console.error("❌ Impossible de générer le token reCAPTCHA");
          handleAuthError(
            { message: "Erreur de validation de sécurité. Veuillez réessayer." },
            "Erreur reCAPTCHA"
          );
          return;
        }

        // Valider le token côté serveur
        console.log("🔍 Validation du token reCAPTCHA côté serveur");
        const validationResult = await validateRecaptchaToken(token, recaptchaAction);
        
        if (!validationResult.success) {
          console.error("❌ Validation reCAPTCHA échouée:", validationResult.error);
          handleAuthError(
            { message: validationResult.error || "Validation de sécurité échouée" },
            "Erreur de sécurité"
          );
          return;
        }

        console.log(`✅ reCAPTCHA validé avec succès - Score: ${validationResult.score}`);
      }

      // Procéder à la connexion normale
      console.log("🔑 Tentative de connexion Supabase");
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error } = await signIn(normalizedEmail, password);
      
      if (error) {
        console.error("❌ Erreur de connexion:", error);
        handleAuthError(error, "Erreur de connexion");
      } else {
        console.log(`✅ Connexion ${role} réussie`);
        showSuccess("Vous êtes maintenant connecté.", "Connexion réussie");
        setTimeout(() => {
          clearMessages();
        }, 2000);
      }

    } catch (error) {
      console.error("❌ Erreur inattendue lors de la connexion:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    handleLogin, 
    isLoading,
    isRecaptchaConfigured: isConfigured
  };
};
