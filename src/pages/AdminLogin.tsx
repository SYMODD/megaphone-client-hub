
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { useEffect, useState } from "react";

const AdminLogin = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const {
    error,
    success,
    isLoading,
    handleLogin,
    setError,
  } = useAuthOperations();

  useEffect(() => {
    if (user && profile && !loading) {
      // Vérifier si le rôle correspond à la page de connexion
      if (profile.role !== "admin") {
        // Déconnecter l'utilisateur et afficher une erreur
        signOut().then(() => {
          setRoleError(`Accès refusé. Cette page est réservée aux administrateurs. Vous êtes connecté en tant que ${profile.role}.`);
        });
      } else {
        setShouldRedirect(true);
      }
    }
  }, [user, profile, loading, signOut]);

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
          <p className="text-slate-600">Connexion Administrateur</p>
        </div>

        <AuthAlert error={error || roleError} success={success} />

        <RoleSpecificLogin
          role="admin"
          onLogin={handleLogin}
          onShowPasswordReset={() => {}} // Pas de reset pour admin via ce flow
          isLoading={isLoading}
          hidePasswordReset={false} // Admin garde l'option
        />
      </div>
    </div>
  );
};

export default AdminLogin;
