import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Building } from "lucide-react";

interface DocumentInfoFieldsProps {
  formData: {
    document_type: string;
    categorie: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export const DocumentInfoFields = ({ formData, onUpdate }: DocumentInfoFieldsProps) => {
  return (
    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-800">Type de Document & Catégorie</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type de Document */}
        <div className="space-y-2">
          <Label htmlFor="document_type" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="w-4 h-4 text-blue-500" />
            Type de Document
          </Label>
          <Select
            value={formData.document_type}
            onValueChange={(value) => onUpdate('document_type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner le type de document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cin">🆔 CIN (Carte d'Identité Nationale)</SelectItem>
              <SelectItem value="passeport_marocain">🇲🇦 Passeport Marocain</SelectItem>
              <SelectItem value="passeport_etranger">🌍 Passeport Étranger</SelectItem>
              <SelectItem value="carte_sejour">🏠 Carte de Séjour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Catégorie */}
        <div className="space-y-2">
          <Label htmlFor="categorie" className="flex items-center gap-2 text-sm font-medium">
            <Building className="w-4 h-4 text-green-500" />
            Catégorie
          </Label>
          <Select
            value={formData.categorie}
            onValueChange={(value) => onUpdate('categorie', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner la catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aeroport">✈️ Aéroport</SelectItem>
              <SelectItem value="navire">🚢 Navire/Port</SelectItem>
              <SelectItem value="agence">🏬 Agence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
        <strong>💡 Note :</strong> Ces champs permettent de corriger les erreurs de classification automatique.
        Utile quand l'agent s'est trompé de scanner (ex: CIN scannée comme passeport étranger).
      </div>
    </div>
  );
}; 