import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { CaptchaDebugInfo } from "@/components/debug/CaptchaDebugInfo";
import { useCaptchaSettingsV2 } from "@/hooks/useCaptchaSettingsV2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewClient = () => {
  const { user, profile, loading } = useAuth();
  
  const captchaV2 = useCaptchaSettingsV2();

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

          <div className="space-y-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">🔧 Debug CAPTCHA V2 (Temporaire)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>État V2:</strong> {captchaV2.isLoading ? 'Chargement...' : 'Terminé'}</div>
                  <div><strong>Clé publique V2:</strong> {captchaV2.publicKey || '[AUCUNE]'}</div>
                  <div><strong>Erreur V2:</strong> {captchaV2.error || '[AUCUNE]'}</div>
                  {captchaV2.debugInfo && (
                    <div><strong>Debug info:</strong> {JSON.stringify(captchaV2.debugInfo, null, 2)}</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <CaptchaDebugInfo />
          </div>

          <ClientForm />
        </div>
      </main>
    </div>
  );
};

export default NewClient;
