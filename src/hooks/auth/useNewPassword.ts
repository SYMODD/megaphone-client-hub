
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

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return false;
    }

    // Validation de la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins : 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial (@$!%*?&)");
      setIsLoading(false);
      return false;
    }

    try {
      console.log("=== PASSWORD UPDATE START ===");
      
      // Vérifier d'abord si nous avons une session active
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session:", {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id
      });
      
      if (!sessionData.session) {
        console.error("No active session for password update");
        setError("Session expirée. Veuillez recommencer la procédure de récupération.");
        setIsLoading(false);
        return false;
      }

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
        
        // Attendre un peu plus longtemps pour que l'utilisateur voie le message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
        
        console.log("=== PASSWORD UPDATE END (SUCCESS) ===");
        return true;
      }
    } catch (error) {
      console.error("=== PASSWORD UPDATE UNEXPECTED ERROR ===");
      console.error("Unexpected error:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
    
    console.log("=== PASSWORD UPDATE END (FAILURE) ===");
    return false;
  };

  return { handleNewPassword, isLoading };
};
