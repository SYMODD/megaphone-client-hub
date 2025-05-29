
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
      setShouldRedirect(true);
    }
  }, [user, profile, loading]);

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

  // Redirect based on role after authentication
  if (shouldRedirect) {
    // Si l'utilisateur n'est pas agent, le rediriger vers sa page de connexion appropriée
    if (profile?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (profile?.role === "superviseur") {
      return <Navigate to="/superviseur" replace />;
    } else if (profile?.role === "agent") {
      return <Navigate to="/nouveau-client" replace />;
    }
    return <Navigate to="/nouveau-client" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-slate-600 mt-2">Connexion Agent</p>
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
