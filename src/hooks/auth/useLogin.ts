
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorHandling } from "./useAuthErrorHandling";

export const useLogin = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { handleAuthError, showSuccess, clearMessages } = useAuthErrorHandling();

  const handleLogin = async (email: string, password: string) => {
    clearMessages();
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await signIn(normalizedEmail, password);
      
      if (error) {
        
        // Gestion d'erreurs améliorée
        let errorMessage = "Email ou mot de passe incorrect";
        
        switch (error.code) {
          case "invalid_credentials":
            errorMessage = "Les identifiants sont incorrects. Vérifiez votre email et mot de passe.";
            break;
          case "email_not_confirmed":
            errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
            break;
          case "too_many_requests":
            errorMessage = "Trop de tentatives de connexion. Veuillez attendre quelques minutes.";
            break;
          case "account_inactive":
            errorMessage = error.message;
            break;
          default:
            errorMessage = `Erreur de connexion: ${error.message}`;
        }
        
        handleAuthError(error, errorMessage);
      } else {
        showSuccess("Vous êtes maintenant connecté.", "Connexion réussie");
        setTimeout(() => {
          clearMessages();
        }, 1000);
      }
    } catch (error) {
      handleAuthError(error, "Une erreur inattendue s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
