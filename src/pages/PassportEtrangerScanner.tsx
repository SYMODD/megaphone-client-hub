
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { PassportEtrangerForm } from "@/components/client/PassportEtrangerForm";

const PassportEtrangerScanner = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/nouveau-client")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Scanner Passeport Étranger</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Scanner et traiter un passeport étranger</p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                🌍 Passeport Étranger
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Scannez le passeport étranger et remplissez les informations du client
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <PassportEtrangerForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PassportEtrangerScanner;
