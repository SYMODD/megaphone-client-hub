import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { useAuthErrorHandling } from "@/hooks/auth/useAuthErrorHandling";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { error, success, setError, setSuccess, handleAuthError, showSuccess } = useAuthErrorHandling();

  // Vérification du token de récupération
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      console.log("=== RESET PASSWORD PAGE ===");
      console.log("Current URL:", window.location.href);
      
      // Parse URL fragment (hash) for recovery tokens
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      
      // Get parameters from both search params and hash
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = searchParams.get('type') || hashParams.get('type');
      const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
      
      console.log("Recovery token parameters:", { 
        currentUrl: window.location.href,
        hash: hash,
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasTokenHash: !!tokenHash,
        error,
        errorDescription
      });

      // Gérer les erreurs d'URL
      if (error) {
        console.error("Recovery error in URL:", error, errorDescription);
        setError("Erreur lors de la récupération : " + (errorDescription || error));
        setIsCheckingToken(false);
        return;
      }

      // Si aucun paramètre de récupération n'est trouvé, rediriger vers auth
      if (!type && !tokenHash && !accessToken && !refreshToken) {
        console.log("No recovery parameters found, redirecting to auth");
        navigate("/auth", { replace: true });
        return;
      }

      // Vérifier que c'est bien un lien de récupération
      if (type !== 'recovery' && !tokenHash && !accessToken) {
        console.error("Not a valid recovery link");
        setError("Lien de récupération invalide. Veuillez demander un nouveau lien.");
        setIsCheckingToken(false);
        return;
      }

      try {
        // Traitement pour les différents types de tokens
        if (accessToken && refreshToken) {
          console.log("Setting up session with recovery tokens");
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setError("Le lien de récupération n'est plus valide ou a expiré.");
          } else {
            console.log("Session configured successfully for password recovery");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        } else if (tokenHash) {
          console.log("Verifying recovery token hash...");
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (verifyError) {
            console.error("Error verifying recovery token:", verifyError);
            setError("Le lien de récupération n'est plus valide ou a expiré.");
          } else {
            console.log("Recovery token verified successfully");
            setIsValidToken(true);
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        } else {
          setError("Paramètres de récupération manquants. Veuillez demander un nouveau lien.");
        }
      } catch (error) {
        console.error("Unexpected error during token verification:", error);
        setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      } finally {
        setIsCheckingToken(false);
        
        // Nettoyer l'URL après traitement
        if (hash) {
          window.history.replaceState({}, document.title, "/reset-password");
        }
      }
    };

    verifyRecoveryToken();
  }, [searchParams, setError, setSuccess, navigate]);

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

  // Affichage du loading pendant la vérification
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Vérification du lien de récupération...</p>
        </div>
      </div>
    );
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
    </div>
  );
};

export default ResetPassword;
