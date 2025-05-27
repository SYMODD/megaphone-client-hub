
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { AuthAlert } from "@/components/auth/AuthAlert";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  
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
      hasToken: !!token
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
      }
    }
  }, [searchParams, setError, setSuccess]);

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

  if (user && !loading && !showNewPassword) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-slate-600 mt-2">Gestion des clients</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getCardTitle()}</CardTitle>
            <CardDescription>{getCardDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
