
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { useEffect, useState } from "react";

const AgentLogin = () => {
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
      if (profile.role === "agent") {
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

  // Redirect agent to their dashboard
  if (shouldRedirect && profile?.role === "agent") {
    return <Navigate to="/nouveau-client" replace />;
  }

  // Les Agents se connectent SANS reCAPTCHA (contrairement aux Admin/Superviseur)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Sud Megaphone</h1>
          <p className="text-slate-600">Connexion Agent</p>
        </div>

        <AuthAlert error={error} success={success} />

        <RoleSpecificLogin
          role="agent"
          onLogin={handleLogin}
          onShowPasswordReset={() => {}} // Pas utilisé
          isLoading={isLoading}
          hidePasswordReset={true} // Masquer pour agent
        />
      </div>
    </div>
  );
};

export default AgentLogin;
