
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { CaptchaDetailedDebug } from "@/components/debug/CaptchaDetailedDebug";

const NewClient = () => {
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
    return <Navigate to="/agent" replace />;
  }

  if (profile.role !== "agent") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Enregistrement d'un nouveau client
            </h1>
            <p className="text-slate-600">
              Ajoutez les informations du client et scannez son document d'identité
            </p>
          </div>

          <CaptchaDetailedDebug />

          <ClientForm />
        </div>
      </main>
    </div>
  );
};

export default NewClient;
