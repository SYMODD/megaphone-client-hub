
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { AuthStateManager } from "@/components/auth/AuthStateManager";
import { RoleLoginLinks } from "@/components/auth/RoleLoginLinks";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { useEffect, useState } from "react";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const roleParam = searchParams.get('role');
  const generalParam = searchParams.get('general');
  const showRoleSelection = !roleParam && !generalParam;

  // Validate role parameter to ensure it's a valid role type
  const validRoles = ['admin', 'superviseur', 'agent'] as const;
  type ValidRole = typeof validRoles[number];
  const validatedRole: ValidRole | null = roleParam && validRoles.includes(roleParam as ValidRole) 
    ? roleParam as ValidRole 
    : null;

  const {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    handleLogin,
    handlePasswordReset,
  } = useAuthOperations();

  useEffect(() => {
    // Vérifier si nous sommes dans un flux de récupération
    const checkRecoveryFlow = () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      // Aussi vérifier dans le hash pour les tokens
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');
      
      console.log("=== RECOVERY FLOW CHECK ===");
      console.log("URL params:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
      console.log("Hash params:", { hashAccessToken: !!hashAccessToken, hashRefreshToken: !!hashRefreshToken, hashType });
      
      // Détecter si c'est un flux de récupération
      const isRecovery = (accessToken && refreshToken && type === 'recovery') || 
                        (hashAccessToken && hashRefreshToken && hashType === 'recovery') ||
                        (hashAccessToken && hashType === 'recovery');
      
      if (isRecovery) {
        console.log("Recovery flow detected!");
        setIsRecoveryFlow(true);
        return true;
      }
      
      return false;
    };

    const isRecovery = checkRecoveryFlow();
    
    // Si ce n'est pas un flux de récupération et qu'on a un utilisateur, 
    // alors on peut rediriger vers le dashboard
    if (!isRecovery && user && !loading) {
      setShouldRedirectToDashboard(true);
    }
  }, [searchParams, user, loading]);

  // Clear errors and success messages when user changes between forms
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

  // Show loading while checking auth state
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

  // Si c'est un flux de récupération, rediriger vers la page de reset
  if (isRecoveryFlow) {
    console.log("Redirecting to reset password page");
    return <Navigate to="/reset-password" replace />;
  }

  // Rediriger vers le dashboard seulement si ce n'est pas un flux de récupération
  if (shouldRedirectToDashboard) {
    console.log("User authenticated - redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-slate-600 mt-2">Gestion des clients</p>
        </div>

        <AuthAlert error={error} success={success} />

        {showPasswordReset ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-center mb-4">
                Réinitialiser le mot de passe
              </h2>
              <p className="text-slate-600 text-center mb-6">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
              <PasswordResetForm
                onPasswordReset={handlePasswordReset}
                onCancel={handleCancelPasswordReset}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : showRoleSelection ? (
          <RoleLoginLinks />
        ) : validatedRole ? (
          <div className="max-w-md mx-auto">
            <RoleSpecificLogin
              role={validatedRole}
              onLogin={handleLogin}
              onShowPasswordReset={handleShowPasswordReset}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <AuthStateManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
