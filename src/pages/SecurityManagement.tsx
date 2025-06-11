
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { SecurityManagement } from "@/components/admin/security/SecurityManagement";
import { CaptchaTestInterface } from "@/components/admin/security/CaptchaTestInterface";
import { CaptchaValidationTest } from "@/components/admin/security/CaptchaValidationTest";
import { CaptchaDetailedDebug } from "@/components/debug/CaptchaDetailedDebug";

const SecurityManagementPage = () => {
  const { user, profile, loading } = useAuth();

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

  if (!user || !profile) {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Gestion de la sécurité
            </h1>
            <p className="text-slate-600">
              Configuration des paramètres de sécurité et des clés d'API
            </p>
          </div>

          {/* Outils de test et diagnostic CAPTCHA */}
          <div className="grid gap-6">
            <CaptchaTestInterface />
            <CaptchaValidationTest />
            <CaptchaDetailedDebug />
          </div>

          {/* Gestion principale de la sécurité */}
          <SecurityManagement />
        </div>
      </main>
    </div>
  );
};

export default SecurityManagementPage;
