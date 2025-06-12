
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { NewClientInfoCards } from "@/components/client/NewClientInfoCards";
import { ClientFormFooterCards } from "@/components/client/ClientFormFooterCards";
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

  console.log('🔍 [NEW_CLIENT] Rendu de la page Nouveau Client (version unifiée)');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* En-tête simple */}
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Nouveau Client ✨
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Créez un nouveau dossier client en quelques étapes simples. Notre système intelligent vous guide pour une saisie rapide et précise.
            </p>
          </div>

          {/* Cartes d'information en haut */}
          <NewClientInfoCards />

          {/* UN SEUL COMPOSANT : ClientForm */}
          <ClientForm />

          {/* Cartes d'information en bas */}
          <ClientFormFooterCards />
        </div>
      </main>
    </div>
  );
};

export default NewClient;
