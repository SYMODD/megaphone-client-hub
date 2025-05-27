
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RegistrationSectionProps {
  formData: {
    date_enregistrement: string;
    observations: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const RegistrationSection = ({ formData, onInputChange }: RegistrationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date_enregistrement" className="text-sm font-medium">Date d'enregistrement</Label>
        <Input
          id="date_enregistrement"
          type="date"
          value={formData.date_enregistrement}
          onChange={(e) => onInputChange("date_enregistrement", e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations" className="text-sm font-medium">Observations</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => onInputChange("observations", e.target.value)}
          placeholder="Notes, commentaires ou informations supplémentaires..."
          rows={4}
          className="text-sm resize-none"
        />
      </div>
    </div>
  );
};
