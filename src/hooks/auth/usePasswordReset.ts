
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthErrorHandling } from "./useAuthErrorHandling";

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleAuthError, showSuccess, clearMessages } = useAuthErrorHandling();

  const handlePasswordReset = async (email: string) => {
    clearMessages();
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Utiliser l'URL de production déployée pour la redirection
      const redirectUrl = "https://sudmegaphone.netlify.app/reset-password";
      
      console.log("=== PASSWORD RESET START ===");
      console.log("Email:", normalizedEmail);
      console.log("Redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        handleAuthError(error, "Erreur lors de l'envoi de l'email de réinitialisation");
      } else {
        const successMessage = "Un lien de réinitialisation a été envoyé à votre adresse email. Cliquez sur le lien pour définir votre nouveau mot de passe.";
        showSuccess(successMessage, "Email envoyé");
        console.log("=== PASSWORD RESET SUCCESS ===");
        return true;
      }
    } catch (error) {
      console.error("=== PASSWORD RESET UNEXPECTED ERROR ===");
      console.error("Unexpected error during password reset:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
    
    console.log("=== PASSWORD RESET END ===");
    return false;
  };

  return { handlePasswordReset, isLoading };
};
