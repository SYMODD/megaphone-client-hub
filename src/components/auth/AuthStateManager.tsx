
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

  // Handle password reset URL parameters - improved detection
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const tokenHash = searchParams.get('token_hash');
    const token = searchParams.get('token');
    
    console.log("URL parameters detected:", { 
      type, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasTokenHash: !!tokenHash,
      hasToken: !!token,
      fullParams: Object.fromEntries(searchParams.entries())
    });
    
    // Amélioration: détecter différents types de liens de récupération
    const isRecoveryLink = type === 'recovery' || 
                          (accessToken && refreshToken) ||
                          (tokenHash && type === 'recovery') ||
                          (token && type === 'recovery');
    
    if (isRecoveryLink) {
      console.log("Password recovery link detected, setting up new password form");
      setShowNewPassword(true);
      setShowPasswordReset(false);
      
      // Si nous avons les tokens d'accès, configurons la session
      if (accessToken && refreshToken) {
        console.log("Setting up session with tokens from URL");
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
            setError("Erreur lors de la configuration de la session de récupération");
          } else {
            console.log("Session set successfully for password recovery");
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        });
      } else if (tokenHash) {
        // Vérifier le token avec Supabase
        console.log("Verifying recovery token...");
        supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        }).then(({ error }) => {
          if (error) {
            console.error("Error verifying recovery token:", error);
            setError("Le lien de récupération n'est plus valide ou a expiré");
          } else {
            console.log("Recovery token verified successfully");
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        });
      } else if (token) {
        // Essayer de vérifier le token simple
        console.log("Verifying simple recovery token...");
        supabase.auth.verifyOtp({
          token: token,
          type: 'recovery'
        }).then(({ error }) => {
          if (error) {
            console.error("Error verifying simple recovery token:", error);
            setError("Le lien de récupération n'est plus valide ou a expiré");
          } else {
            console.log("Simple recovery token verified successfully");
            setSuccess("Veuillez définir votre nouveau mot de passe ci-dessous");
          }
        });
      }
      
      // Nettoyer l'URL après traitement
      const newUrl = window.location.pathname;
      navigate(newUrl, { replace: true });
    }
  }, [searchParams, setError, setSuccess, navigate]);

  // Clear errors and success messages when user changes between forms
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [showPasswordReset, showNewPassword, setError, setSuccess]);

  // Clear any lingering messages when component mounts
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [setError, setSuccess]);

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
