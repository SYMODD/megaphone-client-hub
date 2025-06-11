
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { DocumentTypeSelector } from "@/components/client/DocumentTypeSelector";
import { DocumentType } from "@/types/documentTypes";
import { useNavigate } from "react-router-dom";

const NewClient = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

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

  const handleDocumentTypeSelect = (documentType: DocumentType) => {
    console.log('🔍 Navigation vers:', documentType);
    switch (documentType) {
      case 'cin':
        navigate('/scanner-cin');
        break;
      case 'passeport_marocain':
        navigate('/scanner-passeport-marocain');
        break;
      case 'passeport_etranger':
        navigate('/scanner-passeport-etranger');
        break;
      case 'carte_sejour':
        navigate('/scanner-carte-sejour');
        break;
      default:
        console.warn('Type de document non reconnu:', documentType);
    }
  };

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
              Choisissez le type de document d'identité à scanner
            </p>
          </div>

          <DocumentTypeSelector
            selectedType={null}
            onTypeSelect={handleDocumentTypeSelect}
            allowNavigation={true}
          />
        </div>
      </main>
    </div>
  );
};

export default NewClient;
