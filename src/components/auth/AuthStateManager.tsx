
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { LoginForm } from "./LoginForm";
import { PasswordResetForm } from "./PasswordResetForm";
import { NewPasswordForm } from "./NewPasswordForm";
import { AuthAlert } from "./AuthAlert";
import { AuthCard } from "./AuthCard";

export const AuthStateManager = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [hasProcessedRecovery, setHasProcessedRecovery] = useState(false);
  
  const {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    handleLogin,
    handlePasswordReset,
    handleNewPassword,
  } = useAuthOperations();

  // Améliorer la détection des liens de récupération de mot de passe
  useEffect(() => {
    if (hasProcessedRecovery) return;

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const tokenHash = searchParams.get('token_hash');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log("AuthStateManager - URL parameters detected:", { 
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      error,
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    // Gérer les erreurs d'abord
    if (error) {
      console.error("Auth error in URL:", error, errorDescription);
      setError("Erreur lors de la récupération : " + (errorDescription || error));
      setHasProcessedRecovery(true);
      // Nettoyer l'URL
      navigate("/auth", { replace: true });
      return;
    }
    
    // Détecter les liens de récupération de mot de passe
    const isRecoveryLink = type === 'recovery' || 
                          (accessToken && refreshToken && type !== 'signup') ||
                          tokenHash;
    
    if (isRecoveryLink) {
      console.log("Password recovery link detected, setting up new password form");
      setShowNewPassword(true);
      setShowPasswordReset(false);
      setHasProcessedRecovery(true);
      
      // Gérer les différents types de tokens de récupération
      if (accessToken && refreshToken) {
        console.log("Setting up session with access/refresh tokens");
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
            setError("Erreur lors de la configuration de la session. Veuillez recommencer la procédure.");
          } else {
            console.log("Session set successfully for password recovery");
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        });
      } else if (tokenHash) {
        console.log("Verifying recovery token hash...");
        supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        }).then(({ error }) => {
          if (error) {
            console.error("Error verifying recovery token:", error);
            setError("Le lien de récupération n'est plus valide ou a expiré. Veuillez demander un nouveau lien.");
          } else {
            console.log("Recovery token verified successfully");
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        });
      }
      
      // Nettoyer l'URL après traitement mais garder la page auth
      navigate("/auth", { replace: true });
    }
  }, [searchParams, setError, setSuccess, navigate, hasProcessedRecovery]);

  // Clear errors and success messages when user changes between forms
  useEffect(() => {
    if (!hasProcessedRecovery) return; // Ne pas clear pendant le traitement initial
    setError(null);
    setSuccess(null);
  }, [showPasswordReset, hasProcessedRecovery, setError, setSuccess]);

  const handleShowPasswordReset = () => {
    setShowPasswordReset(true);
    setShowNewPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setError(null);
    setSuccess(null);
  };

  const getCardTitle = () => {
    if (showNewPassword) return "Nouveau mot de passe";
    if (showPasswordReset) return "Réinitialiser le mot de passe";
    return "Connexion";
  };

  const getCardDescription = () => {
    if (showNewPassword) return "Définissez votre nouveau mot de passe";
    if (showPasswordReset) return "Entrez votre email pour recevoir un lien de réinitialisation";
    return "Connectez-vous à votre compte";
  };

  return (
    <AuthCard title={getCardTitle()} description={getCardDescription()}>
      <AuthAlert error={error} success={success} />

      {showNewPassword ? (
        <NewPasswordForm
          onNewPassword={handleNewPassword}
          isLoading={isLoading}
        />
      ) : showPasswordReset ? (
        <PasswordResetForm
          onPasswordReset={handlePasswordReset}
          onCancel={handleCancelPasswordReset}
          isLoading={isLoading}
        />
      ) : (
        <LoginForm
          onLogin={handleLogin}
          onShowPasswordReset={handleShowPasswordReset}
          isLoading={isLoading}
        />
      )}
    </AuthCard>
  );
};
