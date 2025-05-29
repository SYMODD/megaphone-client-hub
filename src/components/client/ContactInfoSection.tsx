
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin } from "lucide-react";

interface ContactInfoSectionProps {
  formData: {
    numero_telephone?: string;
    email?: string;
    adresse?: string;
    [key: string]: any;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ContactInfoSection = ({ formData, onInputChange }: ContactInfoSectionProps) => {
  return (
    <Card className="modern-card hover-glow border-0 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10 p-1">
        <CardHeader className="pb-4 bg-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span>Informations de Contact</span>
            <div className="flex-1" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 py-6 bg-white rounded-b-xl space-y-6">
          {/* Telephone */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="numero_telephone" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 group-focus-within:text-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-teal-500" />
              Numéro de téléphone
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="numero_telephone"
                type="tel"
                value={formData.numero_telephone || ""}
                onChange={(e) => onInputChange("numero_telephone", e.target.value)}
                placeholder="Ex: +212 6 12 34 56 78"
                className="pl-12 input-modern focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 ml-6">
              Format international recommandé
            </p>
          </div>

          {/* Email (optionnel) */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="email" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 group-focus-within:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-500" />
              Adresse email
              <span className="text-xs text-slate-400 ml-1">(optionnel)</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => onInputChange("email", e.target.value)}
                placeholder="exemple@email.com"
                className="pl-12 input-modern focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Adresse (optionnel) */}
          <div className="space-y-3 group">
            <Label 
              htmlFor="adresse" 
              className="flex items-center gap-2 text-sm font-medium text-slate-700 group-focus-within:text-blue-600 transition-colors"
            >
              <MapPin className="w-4 h-4 text-purple-500" />
              Adresse
              <span className="text-xs text-slate-400 ml-1">(optionnel)</span>
            </Label>
            <div className="relative">
              <Input
                id="adresse"
                type="text"
                value={formData.adresse || ""}
                onChange={(e) => onInputChange("adresse", e.target.value)}
                placeholder="Adresse complète"
                className="pl-12 input-modern focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <Phone className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Information importante</p>
                <p className="text-xs text-blue-600 mt-1">
                  Le numéro de téléphone est obligatoire pour pouvoir contacter le client. 
                  Les autres informations sont optionnelles mais recommandées.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
