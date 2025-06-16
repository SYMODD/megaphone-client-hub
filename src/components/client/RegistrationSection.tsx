
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Clock } from "lucide-react";

interface RegistrationSectionProps {
  formData: {
    date_enregistrement: string;
    observations: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const RegistrationSection = ({ formData, onInputChange }: RegistrationSectionProps) => {
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span>Informations d'Enregistrement</span>
          <div className="flex-1" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-6 space-y-6">
        {/* Date d'enregistrement */}
        <div className="space-y-3 group">
          <Label 
            htmlFor="date_enregistrement" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            Date d'enregistrement
            <span className="text-red-500 font-bold">*</span>
          </Label>
          <div className="relative">
            <Input
              id="date_enregistrement"
              type="date"
              value={formData.date_enregistrement}
              onChange={(e) => onInputChange("date_enregistrement", e.target.value)}
              className="pl-12 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-xs text-slate-600 ml-6 font-medium">
            Date de création du dossier client
          </p>
        </div>

        {/* Observations */}
        <div className="space-y-3 group">
          <Label 
            htmlFor="observations" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-focus-within:text-blue-600 transition-colors"
          >
            <FileText className="w-4 h-4 text-green-500" />
            Observations et commentaires
            <span className="text-xs text-slate-600 font-normal ml-1">(optionnel)</span>
          </Label>
          <div className="relative">
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => onInputChange("observations", e.target.value)}
              placeholder="Notes, commentaires ou informations supplémentaires sur le client..."
              rows={4}
              className="pl-12 pt-4 border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
            />
            <div className="absolute left-4 top-4">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-xs text-slate-600 ml-6 font-medium">
            Informations complémentaires, historique ou notes importantes
          </p>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-purple-100 rounded-full">
              <Clock className="w-3 h-3 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-800">Suivi et traçabilité</p>
              <p className="text-xs text-purple-700 mt-1 font-medium">
                Ces informations permettent le suivi du dossier et facilitent la gestion administrative.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
