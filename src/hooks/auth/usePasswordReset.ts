
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
      const redirectUrl = `${window.location.origin}/auth?type=recovery`;
      console.log("Sending password reset email with redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Password reset error:", error);
        handleAuthError(error, "Erreur lors de l'envoi de l'email de réinitialisation");
      } else {
        const successMessage = "Un lien de réinitialisation a été envoyé à votre adresse email. Cliquez sur le lien pour définir votre nouveau mot de passe.";
        showSuccess(successMessage, "Email envoyé");
        return true;
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return { handlePasswordReset, isLoading };
};
