import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthOperations = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("=== DEBUG LOGIN START ===");
      console.log("Original email:", email);
      console.log("Normalized email:", normalizedEmail);
      console.log("Password length:", password.length);
      
      // Essayer directement la connexion sans vérifier la table profiles d'abord
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
        
        let userFriendlyMessage = "Email ou mot de passe incorrect";
        
        // Messages d'erreur plus spécifiques selon le code d'erreur
        switch (error.code) {
          case "invalid_credentials":
            userFriendlyMessage = "Les identifiants fournis sont incorrects. Vérifiez votre email et mot de passe.";
            break;
          case "account_inactive":
            userFriendlyMessage = error.message;
            break;
          case "email_not_confirmed":
            userFriendlyMessage = "Veuillez confirmer votre email avant de vous connecter.";
            break;
          case "too_many_requests":
            userFriendlyMessage = "Trop de tentatives de connexion. Veuillez attendre quelques minutes.";
            break;
          case "user_not_found":
            userFriendlyMessage = "Aucun compte trouvé avec cet email.";
            break;
          default:
            userFriendlyMessage = `Erreur de connexion: ${error.message}`;
        }
        
        setError(userFriendlyMessage);
        toast({
          title: "Erreur de connexion",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        
        console.log("=== DEBUG LOGIN END (ERROR) ===");
      } else {
        console.log("=== LOGIN SUCCESS ===");
        console.log("User ID:", data?.user?.id);
        console.log("Session valid:", !!data?.session);
        
        setError(null);
        setSuccess("Connexion réussie");
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        
        console.log("=== DEBUG LOGIN END (SUCCESS) ===");
      }
    } catch (error) {
      console.error("=== UNEXPECTED ERROR ===");
      console.error("Caught error:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      
      const errorMessage = "Une erreur inattendue s'est produite lors de la connexion";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.log("=== DEBUG LOGIN END (CATCH) ===");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Erreur de réinitialisation",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const successMessage = "Un lien de réinitialisation a été envoyé à votre adresse email.";
        setSuccess(successMessage);
        toast({
          title: "Email envoyé",
          description: successMessage,
        });
        return true;
      }
    } catch (error) {
      const errorMessage = "Une erreur inattendue s'est produite";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleNewPassword = async (password: string, confirmPassword: string) => {
    setError(null);
    setSuccess(null);
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
        setError(error.message);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Password updated successfully");
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été modifié avec succès.",
        });
        navigate("/", { replace: true });
        return true;
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage = "Une erreur inattendue s'est produite";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    handleLogin,
    handlePasswordReset,
    handleNewPassword,
  };
};
