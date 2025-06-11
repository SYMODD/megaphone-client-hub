
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { useEffect } from "react";

const NewClient = () => {
  // 🧹 Nettoyer les données temporaires au chargement de la page
  useEffect(() => {
    const tempData = localStorage.getItem('temp_document_selection');
    if (tempData) {
      console.log('🧹 [NEW_CLIENT] Nettoyage des données temporaires au chargement:', tempData);
      localStorage.removeItem('temp_document_selection');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* En-tête simple */}
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Nouveau Client
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Enregistrez un nouveau client dans le système Sud Megaphone
            </p>
          </div>

          {/* Formulaire client */}
          <ClientForm />
        </div>
      </main>
    </div>
  );
};

export default NewClient;
