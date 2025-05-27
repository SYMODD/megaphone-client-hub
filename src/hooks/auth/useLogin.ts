
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
        error: error 
      });
      
      if (error) {
        console.error("=== SIGN IN ERROR DETAILS ===");
        console.error("Error object:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        handleAuthError(error, "Email ou mot de passe incorrect");
        console.log("=== DEBUG LOGIN END (ERROR) ===");
      } else {
        console.log("=== LOGIN SUCCESS ===");
        console.log("User ID:", data?.user?.id);
        console.log("Session valid:", !!data?.session);
        
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
      
      handleAuthError(error, "Une erreur inattendue s'est produite lors de la connexion");
      console.log("=== DEBUG LOGIN END (CATCH) ===");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
