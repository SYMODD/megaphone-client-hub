
import { Card, CardContent } from "@/components/ui/card";
import { Zap, CheckCircle, Lock } from "lucide-react";

export const ClientFormFooterCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-800 text-sm">Scanner intelligent</h3>
              <p className="text-xs text-orange-600 mt-1">
                Notre OCR détecte et extrait automatiquement les informations de vos documents
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800 text-sm">Gestion complète</h3>
              <p className="text-xs text-green-600 mt-1">
                Gérez tous vos clients depuis une interface unifiée et intuitive
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800 text-sm">Sécurité & Rapidité</h3>
              <p className="text-xs text-purple-600 mt-1">
                Vos données sont protégées avec un stockage cloud sécurisé
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
