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
      
      {/* Main content - Mobile optimisé */}
      <main className="smart-container py-3 sm:py-4 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header - Mobile responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto responsive-button"
              onClick={() => navigate("/nouveau-client")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="responsive-title font-bold text-slate-800">
                🌍 Scanner Passeport Étranger
              </h1>
              <p className="responsive-subtitle text-slate-600 mt-1">
                Scanner et traiter un passeport étranger
              </p>
            </div>
          </div>

          {/* Card content - Mobile first */}
          <Card className="shadow-lg border-0 responsive-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="responsive-subtitle flex items-center gap-2">
                🌍 Passeport Étranger
              </CardTitle>
              <CardDescription className="responsive-body">
                Scannez le passeport étranger et remplissez les informations du client
              </CardDescription>
            </CardHeader>
            <CardContent className="responsive-p">
              <PassportEtrangerForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PassportEtrangerScanner;
