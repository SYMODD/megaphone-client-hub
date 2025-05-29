
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
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span>Informations de Contact</span>
          <div className="flex-1" />
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-6 space-y-6">
        {/* Telephone */}
        <div className="space-y-3 group">
          <Label 
            htmlFor="numero_telephone" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
          >
            <Phone className="w-4 h-4 text-teal-500" />
            Numéro de téléphone
            <span className="text-red-500 font-bold">*</span>
          </Label>
          <div className="relative">
            <Input
              id="numero_telephone"
              type="tel"
              value={formData.numero_telephone || ""}
              onChange={(e) => onInputChange("numero_telephone", e.target.value)}
              placeholder="Ex: +212 6 12 34 56 78"
              className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Phone className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-xs text-slate-600 ml-6 font-medium">
            Format international recommandé
          </p>
        </div>

        {/* Email (optionnel) */}
        <div className="space-y-3 group">
          <Label 
            htmlFor="email" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            Adresse email
            <span className="text-xs text-slate-600 font-normal ml-1">(optionnel)</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => onInputChange("email", e.target.value)}
              placeholder="exemple@email.com"
              className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Adresse (optionnel) */}
        <div className="space-y-3 group">
          <Label 
            htmlFor="adresse" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
          >
            <MapPin className="w-4 h-4 text-purple-500" />
            Adresse
            <span className="text-xs text-slate-600 font-normal ml-1">(optionnel)</span>
          </Label>
          <div className="relative">
            <Input
              id="adresse"
              type="text"
              value={formData.adresse || ""}
              onChange={(e) => onInputChange("adresse", e.target.value)}
              placeholder="Adresse complète"
              className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MapPin className="w-4 h-4 text-slate-500" />
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
              <p className="text-sm font-semibold text-blue-800">Information importante</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">
                Le numéro de téléphone est obligatoire pour pouvoir contacter le client. 
                Les autres informations sont optionnelles mais recommandées.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
