
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

interface ContactInfoSectionProps {
  formData: {
    numero_telephone?: string;
    [key: string]: any;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ContactInfoSection = ({ formData, onInputChange }: ContactInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="w-5 h-5" />
          Informations de Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="numero_telephone">Numéro de téléphone</Label>
          <Input
            id="numero_telephone"
            type="tel"
            value={formData.numero_telephone || ""}
            onChange={(e) => onInputChange("numero_telephone", e.target.value)}
            placeholder="Ex: +212 6 12 34 56 78"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
