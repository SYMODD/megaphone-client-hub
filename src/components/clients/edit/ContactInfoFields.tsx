
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Barcode } from "lucide-react";

interface ContactInfoFieldsProps {
  formData: {
    numero_telephone: string;
    code_barre: string;
    date_enregistrement: string;
    observations: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export const ContactInfoFields = ({ formData, onUpdate }: ContactInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_telephone" className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4" />
            Numéro de téléphone
          </Label>
          <Input
            id="numero_telephone"
            value={formData.numero_telephone}
            onChange={(e) => onUpdate('numero_telephone', e.target.value)}
            placeholder="Ex: +212 6 12 34 56 78"
            className="text-sm font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code_barre" className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Code-barres
          </Label>
          <Input
            id="code_barre"
            value={formData.code_barre}
            onChange={(e) => onUpdate('code_barre', e.target.value)}
            placeholder="Code-barres du document"
            className="text-sm font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_enregistrement" className="text-sm">Date d'enregistrement</Label>
        <Input
          id="date_enregistrement"
          type="date"
          value={formData.date_enregistrement}
          onChange={(e) => onUpdate('date_enregistrement', e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations" className="text-sm">Observations</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => onUpdate('observations', e.target.value)}
          placeholder="Observations (optionnel)"
          rows={3}
          className="text-sm resize-none"
        />
      </div>
    </>
  );
};
