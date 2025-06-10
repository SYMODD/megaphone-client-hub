
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorHandling } from "./useAuthErrorHandling";

export const useLogin = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false); // 🔒 NOUVEAU
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false); // 🔒 NOUVEAU
  const { handleAuthError, showSuccess, clearMessages } = useAuthErrorHandling();

  const handleLogin = async (email: string, password: string) => {
    clearMessages();
    
    // 🔒 VÉRIFICATION CAPTCHA POUR CERTAINS RÔLES
    const emailLower = email.toLowerCase().trim();
    const isAdminOrSuperviseur = emailLower.includes('admin') || emailLower.includes('superviseur') || emailLower === 'essbane.salim@gmail.com';
    
    if (isAdminOrSuperviseur && !isCaptchaVerified) {
      setRequiresCaptcha(true);
      handleAuthError({ code: 'captcha_required' }, "Veuillez compléter la vérification CAPTCHA pour ce type de compte");
      return;
    }
    
    setIsLoading(true);

    try {
      const normalizedEmail = emailLower;
      console.log("=== DEBUG LOGIN START ===");
      console.log("Original email:", email);
      console.log("Normalized email:", normalizedEmail);
      console.log("Password length:", password.length);
      console.log("CAPTCHA verified:", isCaptchaVerified);
      console.log("Requires CAPTCHA:", isAdminOrSuperviseur);
      
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
        console.log("=== DEBUG LOGIN END (ERROR) ===");
      } else {
        console.log("=== LOGIN SUCCESS ===");
        console.log("User ID:", data?.user?.id);
        console.log("Session valid:", !!data?.session);
        
        showSuccess("Vous êtes maintenant connecté.", "Connexion réussie");
        setTimeout(() => {
          clearMessages();
        }, 2000);
        
        // 🔒 Reset CAPTCHA state après succès
        setRequiresCaptcha(false);
        setIsCaptchaVerified(false);
        
        console.log("=== DEBUG LOGIN END (SUCCESS) ===");
      }
    } catch (error) {
      console.error("=== UNEXPECTED ERROR ===");
      console.error("Caught error:", error);
      
      handleAuthError(error, "Une erreur inattendue s'est produite lors de la connexion");
      console.log("=== DEBUG LOGIN END (CATCH) ===");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔒 NOUVEAU: Handler pour CAPTCHA
  const handleCaptchaVerification = (isVerified: boolean) => {
    setIsCaptchaVerified(isVerified);
    if (isVerified) {
      clearMessages(); // Clear l'erreur CAPTCHA si vérification réussie
    }
  };

  return { 
    handleLogin, 
    isLoading,
    requiresCaptcha, // 🔒 NOUVEAU
    isCaptchaVerified, // 🔒 NOUVEAU
    handleCaptchaVerification // 🔒 NOUVEAU
  };
};
