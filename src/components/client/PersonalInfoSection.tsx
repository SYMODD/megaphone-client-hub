
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe, FileText } from "lucide-react";
import { NationalityCombobox } from "./NationalityCombobox";
import { getDocumentFieldLabel, getDocumentFieldPlaceholder } from "./DocumentFields";
import { useEffect } from "react";

interface PersonalInfoSectionProps {
  formData: {
    nom: string;
    prenom: string;
    nationalite: string;
    numero_passeport: string;
    document_type?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalInfoSection = ({ formData, onInputChange }: PersonalInfoSectionProps) => {
  const documentType = formData.document_type as any;
  const documentFieldLabel = getDocumentFieldLabel(documentType);
  const documentFieldPlaceholder = getDocumentFieldPlaceholder(documentType);

  // Debug - Log quand les données changent
  useEffect(() => {
    console.log("🔍 PERSONAL INFO SECTION - Données reçues:", {
      nom: formData.nom,
      prenom: formData.prenom,
      nationalite: formData.nationalite,
      numero_passeport: formData.numero_passeport,
      timestamp: new Date().toISOString()
    });
  }, [formData]);

  const handleNationalityChange = (value: string) => {
    console.log("🌍 PERSONAL INFO - Changement nationalité:", {
      ancienne: formData.nationalite,
      nouvelle: value
    });
    onInputChange("nationalite", value);
  };

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <span>Informations Personnelles</span>
          <div className="flex-1" />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nom */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="nom" 
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4 text-blue-500" />
              Nom de famille
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative">
              <Input
                id="nom"
                type="text"
                value={formData.nom}
                onChange={(e) => onInputChange("nom", e.target.value)}
                placeholder="Nom de famille"
                className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Prénom */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="prenom" 
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4 text-green-500" />
              Prénom
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative">
              <Input
                id="prenom"
                type="text"
                value={formData.prenom}
                onChange={(e) => onInputChange("prenom", e.target.value)}
                placeholder="Prénom"
                className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nationalité avec debug */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="nationalite" 
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
            >
              <Globe className="w-4 h-4 text-purple-500" />
              Nationalité
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative">
              <div className="pl-12">
                <NationalityCombobox
                  value={formData.nationalite}
                  onValueChange={handleNationalityChange}
                />
              </div>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Globe className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500">
              Valeur actuelle: "{formData.nationalite}"
            </div>
          </div>
          
          {/* Numéro de document */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="numero_passeport" 
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
            >
              <FileText className="w-4 h-4 text-orange-500" />
              {documentFieldLabel}
              <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="relative">
              <Input
                id="numero_passeport"
                type="text"
                value={formData.numero_passeport}
                onChange={(e) => onInputChange("numero_passeport", e.target.value)}
                placeholder={documentFieldPlaceholder}
                className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Informations essentielles</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">
                Tous les champs marqués d'un astérisque (*) sont obligatoires pour créer le dossier client.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
