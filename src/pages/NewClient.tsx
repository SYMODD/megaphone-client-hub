
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";

const NewClient = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-teal-50/80" />
        <div className="container-modern relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="no-print">
                <Button variant="outline" size="lg" className="group hover-lift bg-white border-slate-300 shadow-md hover:shadow-lg text-slate-700 hover:text-slate-900">
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Retour
                </Button>
              </Link>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    Nouveau Client
                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </h1>
                  <p className="text-slate-700 max-w-2xl font-medium">
                    Créez un nouveau dossier client en quelques étapes simples. Notre système intelligent vous guide pour une saisie rapide et précise.
                  </p>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Scanner OCR</p>
                      <p className="text-xs text-slate-600 font-medium">Extraction automatique</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Multi-documents</p>
                      <p className="text-xs text-slate-600 font-medium">Passeport, CIN, Séjour</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">IA Intégrée</p>
                      <p className="text-xs text-slate-600 font-medium">Détection intelligente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-modern pb-12">
        <div className="max-w-5xl mx-auto">
          <Card className="border border-slate-200 shadow-lg bg-white overflow-hidden fade-in">
            <CardHeader className="pb-6 bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl lg:text-2xl font-semibold text-slate-800 mb-1">
                    Informations du client
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Remplissez tous les champs obligatoires pour créer un nouveau dossier client. 
                    Utilisez notre scanner OCR pour une saisie automatique des données.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 sm:px-8 py-6 bg-white">
              <div className="slide-up">
                <ClientForm />
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Scanner intelligent</h3>
                  <p className="text-sm text-slate-700 font-medium">
                    Notre technologie OCR extrait automatiquement les informations de vos documents
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Gestion complète</h3>
                  <p className="text-sm text-slate-700 font-medium">
                    Gérez tous vos clients depuis une interface unifiée et intuitive
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Sécurisé & Rapide</h3>
                  <p className="text-sm text-slate-700 font-medium">
                    Vos données sont protégées avec un stockage cloud sécurisé
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewClient;
