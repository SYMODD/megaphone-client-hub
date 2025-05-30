
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useContractManagement } from "@/hooks/useContractManagement";
import { PDFContractGenerator } from "@/components/contracts/PDFContractGenerator";

const Contracts = () => {
  const { profile } = useAuth();
  const {
    clients,
    loading,
  } = useContractManagement();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Génération de Contrats PDF</h1>
            <p className="text-sm sm:text-base text-slate-600">
              Créez des contrats PDF personnalisés pour vos clients
            </p>
          </div>

          <PDFContractGenerator clients={clients} />
        </div>
      </main>
    </div>
  );
};

export default Contracts;
