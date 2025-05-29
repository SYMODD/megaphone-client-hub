
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";

const NewClient = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-teal-50/50" />
        <div className="container-modern relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="no-print">
                <Button variant="outline" size="lg" className="group hover-lift bg-white/80 backdrop-blur-sm border-white/30 shadow-md hover:shadow-lg">
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
                  <h1 className="heading-primary text-gradient flex items-center gap-2">
                    Nouveau Client
                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </h1>
                  <p className="text-subtle max-w-2xl">
                    Créez un nouveau dossier client en quelques étapes simples. Notre système intelligent vous guide pour une saisie rapide et précise.
                  </p>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="glass-card p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Scanner OCR</p>
                      <p className="text-xs text-slate-500">Extraction automatique</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Multi-documents</p>
                      <p className="text-xs text-slate-500">Passeport, CIN, Séjour</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">IA Intégrée</p>
                      <p className="text-xs text-slate-500">Détection intelligente</p>
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
          <Card className="modern-card shadow-xl border-0 overflow-hidden fade-in">
            <div className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 p-1">
              <CardHeader className="pb-6 bg-white rounded-t-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="heading-secondary mb-1">
                      Informations du client
                    </CardTitle>
                    <CardDescription className="text-subtle">
                      Remplissez tous les champs obligatoires pour créer un nouveau dossier client. 
                      Utilisez notre scanner OCR pour une saisie automatique des données.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 sm:px-8 py-6 bg-white rounded-b-xl">
                <div className="slide-up">
                  <ClientForm />
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Help Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Scanner intelligent</h3>
                  <p className="text-sm text-slate-600">
                    Notre technologie OCR extrait automatiquement les informations de vos documents
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Gestion complète</h3>
                  <p className="text-sm text-slate-600">
                    Gérez tous vos clients depuis une interface unifiée et intuitive
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Sécurisé & Rapide</h3>
                  <p className="text-sm text-slate-600">
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
