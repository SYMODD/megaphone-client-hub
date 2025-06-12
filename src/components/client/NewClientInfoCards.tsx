
import { Card, CardContent } from "@/components/ui/card";
import { Scan, FileText, Shield, Zap, CheckCircle, Lock } from "lucide-react";

export const NewClientInfoCards = () => {
  return (
    <>
      {/* Cartes d'information en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Scanner OCR</h3>
              <p className="text-sm text-blue-600">Extraction automatique</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Multi-documents</h3>
              <p className="text-sm text-green-600">Passeport, CIN, Séjour</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800">IA Intégrée</h3>
              <p className="text-sm text-purple-600">Détection intelligente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte d'information principale */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Informations du client</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Remplissez les champs obligatoires pour créer un nouveau dossier client. Utilisez notre scanner OCR pour une saisie automatique des données.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
