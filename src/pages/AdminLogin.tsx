
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { RecaptchaStatusIndicator } from "@/components/recaptcha/RecaptchaStatusIndicator";
import { RecaptchaDebugInfo } from "@/components/recaptcha/RecaptchaDebugInfo";
import { useEffect, useState } from "react";

const AdminLogin = () => {
  const { user, profile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    error,
    success,
    isLoading,
    handleLogin,
  } = useAuthOperations();

  useEffect(() => {
    if (user && profile && !loading) {
      // Si l'utilisateur est déjà connecté avec le bon rôle, rediriger
      if (profile.role === "admin") {
        setShouldRedirect(true);
      }
      // Si l'utilisateur est connecté avec un autre rôle, ne pas déconnecter automatiquement
      // Laisser l'utilisateur voir qu'il doit se connecter avec le bon compte
    }
  }, [user, profile, loading]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect admin to their dashboard
  if (shouldRedirect && profile?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Sud Megaphone</h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-slate-600">Connexion Administrateur</p>
            <RecaptchaStatusIndicator context="login" size="sm" />
          </div>
        </div>

        <AuthAlert error={error} success={success} />

        <RoleSpecificLogin
          role="admin"
          onLogin={handleLogin}
          onShowPasswordReset={() => {}} // Pas de reset pour admin via ce flow
          isLoading={isLoading}
          hidePasswordReset={false} // Admin garde l'option
        />

        {/* Informations de debug pour les admins */}
        <RecaptchaDebugInfo />
      </div>
    </div>
  );
};

export default AdminLogin;
