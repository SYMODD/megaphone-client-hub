
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NationalityCombobox } from "./NationalityCombobox";
import { getDocumentFieldLabel, getDocumentFieldPlaceholder } from "./DocumentFields";

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

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Informations personnelles</CardTitle>
        <CardDescription>
          Renseignez les informations du client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              placeholder="Nom de famille"
              value={formData.nom}
              onChange={(e) => onInputChange("nom", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={(e) => onInputChange("prenom", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationalite">Nationalité *</Label>
            <NationalityCombobox
              value={formData.nationalite}
              onValueChange={(value) => onInputChange("nationalite", value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numero_passeport">{documentFieldLabel} *</Label>
            <Input
              id="numero_passeport"
              placeholder={documentFieldPlaceholder}
              value={formData.numero_passeport}
              onChange={(e) => onInputChange("numero_passeport", e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
