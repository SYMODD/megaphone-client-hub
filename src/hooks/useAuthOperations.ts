
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
      const { error } = await signIn(email, password);
      if (error) {
        setError("Email ou mot de passe incorrect");
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      } else {
        // Clear any previous errors on successful login
        setError(null);
        setSuccess("Connexion réussie");
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
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
