
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
      console.log("=== DEBUG LOGIN START ===");
      console.log("Original email:", email);
      console.log("Normalized email:", normalizedEmail);
      console.log("Password length:", password.length);
      
      console.log("Attempting sign in...");
      const { data, error } = await signIn(normalizedEmail, password);
      
      console.log("Sign in result:", { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        errorCode: error?.code,
        errorMessage: error?.message,
        userData: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at
        } : null
      });
      
      if (error) {
        console.error("=== SIGN IN ERROR DETAILS ===");
        console.error("Error object:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error status:", error.status);
        
        // Gestion d'erreurs améliorée pour les cas reCAPTCHA
        let errorMessage = "Email ou mot de passe incorrect";
        
        switch (error.code) {
          case "invalid_credentials":
            // Vérifier si c'est un problème lié à reCAPTCHA
            if (error.message?.includes('recaptcha') || error.message?.includes('verification')) {
              errorMessage = "Erreur de vérification de sécurité. Veuillez réessayer.";
            } else {
              errorMessage = "Les identifiants sont incorrects. Vérifiez votre email et mot de passe.";
            }
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
          case "signup_disabled":
            errorMessage = "Les inscriptions sont désactivées.";
            break;
          default:
            // Pour les erreurs de sécurité/reCAPTCHA non identifiées
            if (error.message?.toLowerCase().includes('security') || 
                error.message?.toLowerCase().includes('verification') ||
                error.message?.toLowerCase().includes('recaptcha')) {
              errorMessage = "Erreur de vérification de sécurité. Vérifiez la configuration reCAPTCHA.";
            } else {
              errorMessage = `Erreur de connexion: ${error.message}`;
            }
        }
        
        handleAuthError(error, errorMessage);
        console.log("=== DEBUG LOGIN END (ERROR) ===");
      } else {
        console.log("=== LOGIN SUCCESS ===");
        console.log("User ID:", data?.user?.id);
        console.log("Session valid:", !!data?.session);
        console.log("Access token present:", !!data?.session?.access_token);
        
        showSuccess("Vous êtes maintenant connecté.", "Connexion réussie");
        setTimeout(() => {
          clearMessages();
        }, 2000);
        
        console.log("=== DEBUG LOGIN END (SUCCESS) ===");
      }
    } catch (error) {
      console.error("=== UNEXPECTED ERROR ===");
      console.error("Caught error:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      
      // Gestion spéciale pour les erreurs reCAPTCHA
      let errorMessage = "Une erreur inattendue s'est produite lors de la connexion";
      if (error instanceof Error) {
        if (error.message?.toLowerCase().includes('recaptcha') ||
            error.message?.toLowerCase().includes('verification') ||
            error.message?.toLowerCase().includes('security')) {
          errorMessage = "Erreur de vérification de sécurité. Vérifiez la configuration reCAPTCHA.";
        }
      }
      
      handleAuthError(error, errorMessage);
      console.log("=== DEBUG LOGIN END (CATCH) ===");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
