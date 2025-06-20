import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, FileText, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { Badge } from "@/components/ui/badge";

const NewClient = () => {
  const navigate = useNavigate();

  const handleWorkflowSelect = (workflowType: string) => {
    const routes = {
      'cin': '/workflow/cin',
      'passeport_marocain': '/workflow/passeport-marocain',
      'passeport_etranger': '/workflow/passeport-etranger',
      'carte_sejour': '/workflow/carte-sejour'
    };
    
    const route = routes[workflowType as keyof typeof routes];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-2 sm:py-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-teal-50/80" />
        <div className="container-modern relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2 flex items-center gap-2 break-words">
                    <span className="break-words">Nouveau Client</span>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse flex-shrink-0" />
                  </h1>
                  <p className="text-slate-700 text-sm sm:text-base font-medium break-words leading-relaxed">
                    Créez un nouveau dossier client en quelques étapes simples. Notre système intelligent vous guide pour une saisie rapide et précise.
                  </p>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-3 sm:p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 break-words">Scanner OCR</p>
                      <p className="text-xs text-slate-600 font-medium break-words">Extraction automatique</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-3 sm:p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 break-words">Multi-documents</p>
                      <p className="text-xs text-slate-600 font-medium break-words">Passeport, CIN, Séjour</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-3 sm:p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 break-words">IA Intégrée</p>
                      <p className="text-xs text-slate-600 font-medium break-words">Détection intelligente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-modern pb-4 sm:pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border border-slate-200 shadow-xl bg-white overflow-hidden fade-in">
            <CardHeader className="pb-4 sm:pb-6 bg-white">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 mb-1 break-words">
                    🚀 Workflows Intelligents - Traitement Guidé
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium text-sm sm:text-base break-words leading-relaxed">
                    Choisissez le type de document pour démarrer un traitement étape par étape avec détection automatique et validation intelligente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white">
              {/* 4 Cartes Workflows Améliorées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* CIN Workflow */}
                <Card 
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
                  onClick={() => handleWorkflowSelect('cin')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      🆔
                    </div>
                    <h3 className="responsive-title font-bold text-blue-900 mb-2">
                      CIN Marocaine
                    </h3>
                    <p className="responsive-body text-blue-700 mb-3">
                      Scanner et traiter une Carte d'Identité Nationale
                    </p>
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                      OCR Avancé
                    </Badge>
                  </CardContent>
                </Card>

                {/* Passeport Marocain Workflow */}
                <Card 
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200"
                  onClick={() => handleWorkflowSelect('passeport_marocain')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      📗
                    </div>
                    <h3 className="responsive-title font-bold text-green-900 mb-2">
                      Passeport Marocain
                    </h3>
                    <p className="responsive-body text-green-700 mb-3">
                      Scanner avec lecture automatique MRZ
                    </p>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      MRZ Ready
                    </Badge>
                  </CardContent>
                </Card>

                {/* Passeport Étranger Workflow */}
                <Card 
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200"
                  onClick={() => handleWorkflowSelect('passeport_etranger')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      🌍
                    </div>
                    <h3 className="responsive-title font-bold text-purple-900 mb-2">
                      Passeport Étranger
                    </h3>
                    <p className="responsive-body text-purple-700 mb-3">
                      Traitement des passeports internationaux
                    </p>
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
                      Multi-Pays
                    </Badge>
                  </CardContent>
                </Card>

                {/* Carte de Séjour Workflow */}
                <Card 
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200"
                  onClick={() => handleWorkflowSelect('carte_sejour')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      🏛️
                    </div>
                    <h3 className="responsive-title font-bold text-orange-900 mb-2">
                      Carte de Séjour
                    </h3>
                    <p className="responsive-body text-orange-700 mb-3">
                      Titre de séjour et cartes de résidence
                    </p>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                      Résidence
                    </Badge>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-slate-700 font-medium break-words">
                    ✨ Nouveau : Traitement étape par étape avec validation automatique
                  </p>
                </div>
              </div>

              <div className="slide-up">
                <ClientForm />
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 hover-lift">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base break-words">Scanner intelligent</h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium break-words leading-relaxed">
                    Notre technologie OCR extrait automatiquement les informations de vos documents
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 hover-lift">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base break-words">Gestion complète</h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium break-words leading-relaxed">
                    Suivi complet des clients avec historique et gestion des documents
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 hover-lift">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base break-words">Interface moderne</h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium break-words leading-relaxed">
                    Interface responsive et intuitive optimisée pour tous les appareils
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
