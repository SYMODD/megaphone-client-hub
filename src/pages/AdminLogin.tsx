
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { useEffect, useState } from "react";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { toast } from "sonner";

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

  // Gestionnaire de login avec reCAPTCHA
  const handleLoginWithRecaptcha = async (recaptchaToken: string) => {
    console.log('🔒 reCAPTCHA token reçu pour login Admin:', recaptchaToken.substring(0, 20) + '...');
    
    // Récupérer les données du formulaire depuis le localStorage temporaire
    const loginData = localStorage.getItem('temp_login_data');
    if (!loginData) {
      toast.error('Données de connexion manquantes');
      return;
    }

    try {
      const { email, password } = JSON.parse(loginData);
      console.log('📝 Tentative de connexion Admin avec reCAPTCHA validé');
      
      // Effectuer la connexion
      await handleLogin(email, password);
      
      // Nettoyer les données temporaires
      localStorage.removeItem('temp_login_data');
    } catch (error) {
      console.error('❌ Erreur lors de la connexion Admin:', error);
      toast.error('Erreur lors de la connexion');
      localStorage.removeItem('temp_login_data');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ Erreur reCAPTCHA Admin login:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_login_data');
  };

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

        <AuthAlert error={error} success={success} />

        <RecaptchaVerification
          action="admin_login"
          onSuccess={handleLoginWithRecaptcha}
          onError={handleRecaptchaError}
        >
          <RoleSpecificLogin
            role="admin"
            onLogin={handleLogin}
            onShowPasswordReset={() => {}} // Pas de reset pour admin via ce flow
            isLoading={isLoading}
            hidePasswordReset={false} // Admin garde l'option
          />
        </RecaptchaVerification>
      </div>
    </div>
  );
};

export default AdminLogin;
