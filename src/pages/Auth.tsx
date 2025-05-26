
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

  // Handle password reset URL parameters
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    console.log("URL parameters:", { type, accessToken: !!accessToken, refreshToken: !!refreshToken });
    
    if (type === 'recovery' && accessToken && refreshToken) {
      console.log("Password recovery detected, setting up session");
      setShowNewPassword(true);
      
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error("Error setting session:", error);
          setError("Erreur lors de la configuration de la session de récupération");
        } else {
          console.log("Session set successfully for password recovery");
        }
      });
    }
  }, [searchParams, setError]);

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
    if (showNewPassword) return "Entrez votre nouveau mot de passe";
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
