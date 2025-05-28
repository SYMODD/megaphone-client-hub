
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/auth/LoadingState";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { useAuthErrorHandling } from "@/hooks/auth/useAuthErrorHandling";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { error, success, setError, setSuccess, handleAuthError, showSuccess } = useAuthErrorHandling();

  useEffect(() => {
    const processRecoverySession = async () => {
      console.log("=== PROCESSING RECOVERY SESSION ===");
      console.log("Current URL:", window.location.href);
      
      try {
        // Récupérer les tokens depuis l'URL ou le hash
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        
        // Si pas dans les params, vérifier dans le hash
        if (!accessToken || !refreshToken) {
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          
          console.log("Checking hash for tokens:", { 
            hasAccessTokenInHash: !!accessToken, 
            hasRefreshTokenInHash: !!refreshToken,
            fullHash: hash
          });
        }

        console.log("Tokens found:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        if (accessToken && refreshToken) {
          console.log("Setting session with recovery tokens...");
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            setError("Lien de récupération invalide ou expiré. Veuillez demander un nouveau lien.");
          } else if (data.session) {
            console.log("Recovery session established successfully");
            setIsValidSession(true);
            setSuccess("Vous pouvez maintenant définir votre nouveau mot de passe.");
          } else {
            console.error("No session created");
            setError("Impossible d'établir la session de récupération.");
          }
        } else {
          // Vérifier s'il y a déjà une session active
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Session error:", sessionError);
            setError("Erreur lors de la vérification de la session.");
          } else if (session?.user) {
            console.log("Valid session found");
            setIsValidSession(true);
            setSuccess("Vous pouvez maintenant définir votre nouveau mot de passe.");
          } else {
            console.log("No valid recovery session found");
            setError("Lien de récupération invalide ou expiré. Veuillez demander un nouveau lien.");
          }
        }
      } catch (error) {
        console.error("Unexpected error processing recovery session:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setIsCheckingSession(false);
      }
    };

    processRecoverySession();
  }, [searchParams, setError, setSuccess]);

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

  // Affichage du loading pendant la vérification
  if (isCheckingSession) {
    return <LoadingState message="Vérification du lien de récupération..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
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

          {isValidSession ? (
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
    </div>
  );
};

export default ResetPassword;
