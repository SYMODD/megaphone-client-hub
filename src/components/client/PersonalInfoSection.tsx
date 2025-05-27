
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NationalityCombobox } from "./NationalityCombobox";

interface PersonalInfoSectionProps {
  formData: {
    nom: string;
    prenom: string;
    nationalite: string;
    numero_passeport: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalInfoSection = ({ formData, onInputChange }: PersonalInfoSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => onInputChange("nom", e.target.value)}
            placeholder="Nom de famille"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => onInputChange("prenom", e.target.value)}
            placeholder="Prénom"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationalite">Nationalité *</Label>
          <NationalityCombobox
            value={formData.nationalite}
            onValueChange={(value) => onInputChange("nationalite", value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_passeport">Numéro de passeport *</Label>
          <Input
            id="numero_passeport"
            value={formData.numero_passeport}
            onChange={(e) => onInputChange("numero_passeport", e.target.value)}
            placeholder="Numéro de passeport"
            required
          />
        </div>
      </div>
    </>
  );
};
