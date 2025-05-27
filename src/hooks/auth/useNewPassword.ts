
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthErrorHandling } from "./useAuthErrorHandling";

export const useNewPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { handleAuthError, showSuccess, setError, clearMessages } = useAuthErrorHandling();

  const handleNewPassword = async (password: string, confirmPassword: string) => {
    clearMessages();
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return false;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return false;
    }

    try {
      console.log("Updating password...");
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password update error:", error);
        handleAuthError(error, "Erreur lors de la mise à jour du mot de passe");
      } else {
        console.log("Password updated successfully");
        showSuccess("Votre mot de passe a été modifié avec succès. Vous allez être redirigé.", "Mot de passe modifié");
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
        
        return true;
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return { handleNewPassword, isLoading };
};
