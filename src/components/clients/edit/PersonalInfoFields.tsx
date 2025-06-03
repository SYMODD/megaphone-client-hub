
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  formData: {
    prenom: string;
    nom: string;
    nationalite: string;
    numero_passeport: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export const PersonalInfoFields = ({ formData, onUpdate }: PersonalInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-sm">Prénom</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => onUpdate('prenom', e.target.value)}
            placeholder="Prénom"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-sm">Nom</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => onUpdate('nom', e.target.value)}
            placeholder="Nom"
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationalite" className="text-sm">Nationalité</Label>
        <Input
          id="nationalite"
          value={formData.nationalite}
          onChange={(e) => onUpdate('nationalite', e.target.value)}
          placeholder="Nationalité"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numero_passeport" className="text-sm">Numéro de passeport</Label>
        <Input
          id="numero_passeport"
          value={formData.numero_passeport}
          onChange={(e) => onUpdate('numero_passeport', e.target.value)}
          placeholder="Numéro de passeport"
          className="text-sm font-mono"
        />
      </div>
    </>
  );
};
