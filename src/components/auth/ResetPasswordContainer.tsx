
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NewPasswordForm } from "./NewPasswordForm";
import { AuthCard } from "./AuthCard";
import { AuthAlert } from "./AuthAlert";
import { useAuthErrorHandling } from "@/hooks/auth/useAuthErrorHandling";
import { useState } from "react";

interface ResetPasswordContainerProps {
  isValidToken: boolean;
  error: string | null;
  success: string | null;
}

export const ResetPasswordContainer = ({ 
  isValidToken, 
  error, 
  success 
}: ResetPasswordContainerProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setError, setSuccess, handleAuthError, showSuccess } = useAuthErrorHandling();

  const handleNewPassword = async (password: string, confirmPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
      console.log("=== PASSWORD UPDATE START ===");
      
      // Vérifier la session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session for password update:", {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id
      });
      
      if (!sessionData.session) {
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
        setIsLoading(false);
        return false;
      } else {
        console.log("Password updated successfully");
        showSuccess("Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion...", "Mot de passe modifié");
        
        // Déconnexion et redirection vers la page de connexion
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate("/auth", { replace: true });
        }, 2000);
        
        console.log("=== PASSWORD UPDATE END (SUCCESS) ===");
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Unexpected error during password update:", error);
      handleAuthError(error, "Une erreur inattendue s'est produite");
      setIsLoading(false);
      return false;
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
        <p className="text-slate-600 mt-2">Réinitialisation du mot de passe</p>
      </div>

      <AuthCard 
        title="Nouveau mot de passe" 
        description="Définissez votre nouveau mot de passe"
      >
        <AuthAlert error={error} success={success} />

        {isValidToken ? (
          <NewPasswordForm
            onNewPassword={handleNewPassword}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Impossible de valider le lien de récupération.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Retour à la page de connexion
            </button>
          </div>
        )}
      </AuthCard>
    </div>
  );
};
