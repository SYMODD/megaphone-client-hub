
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { ClientForm } from "@/components/client/ClientForm";

const NewClient = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Link to="/">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Nouveau Client</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Ajouter un nouveau client à la base de données</p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Informations du client</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Remplissez tous les champs obligatoires pour créer un nouveau dossier client
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ClientForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewClient;
