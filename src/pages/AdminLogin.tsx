
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { RoleSpecificLogin } from "@/components/auth/RoleSpecificLogin";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { useEffect, useState } from "react";
import { initializeCaptchaKeys } from "@/utils/initializeCaptcha";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const { user, profile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    error,
    success,
    isLoading,
    handleLogin,
    requiresCaptcha,
    isCaptchaVerified,
    handleCaptchaVerification
  } = useAuthOperations();

  // Initialiser les clés reCAPTCHA au chargement
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        console.log('🔧 Tentative d\'initialisation des clés reCAPTCHA...');
        const result = await initializeCaptchaKeys();
        
        if (result.success) {
          console.log('✅ Configuration reCAPTCHA réussie');
          if (result.message !== 'Les clés sont déjà configurées') {
            toast({
              title: "Configuration reCAPTCHA",
              description: "Les clés reCAPTCHA ont été configurées automatiquement",
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'initialisation des clés reCAPTCHA:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeKeys();
  }, []);

  useEffect(() => {
    if (user && profile && !loading) {
      if (profile.role === "admin" || user.email === "essbane.salim@gmail.com") {
        setShouldRedirect(true);
      }
    }
  }, [user, profile, loading]);

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">
            {isInitializing ? "Configuration du système..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  if (shouldRedirect && (profile?.role === "admin" || user?.email === "essbane.salim@gmail.com")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Ne pas exiger le CAPTCHA pour l'admin principal lors de la configuration initiale
  const shouldRequireCaptcha = requiresCaptcha && user?.email !== "essbane.salim@gmail.com";

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

        <RoleSpecificLogin
          role="admin"
          onLogin={handleLogin}
          onShowPasswordReset={() => {}}
          isLoading={isLoading}
          hidePasswordReset={false}
          requiresCaptcha={shouldRequireCaptcha}
          isCaptchaVerified={isCaptchaVerified}
          onCaptchaVerificationChange={handleCaptchaVerification}
        />
      </div>
    </div>
  );
};

export default AdminLogin;
