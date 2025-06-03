
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Barcode } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";

interface ContactInfoSectionProps {
  formData: {
    numero_telephone: string;
    code_barre: string;
    [key: string]: any;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ContactInfoSection = ({ formData, onInputChange }: ContactInfoSectionProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string) => {
    if (barcode) {
      onInputChange("code_barre", barcode);
    }
    if (phone) {
      onInputChange("numero_telephone", phone);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Informations de contact
        </CardTitle>
        <CardDescription>
          Saisissez les coordonnées du client ou utilisez le scanner automatique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScanned}
          currentBarcode={formData.code_barre}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero_telephone">Numéro de téléphone</Label>
            <Input
              id="numero_telephone"
              value={formData.numero_telephone}
              onChange={(e) => onInputChange("numero_telephone", e.target.value)}
              placeholder="Ex: +212 6 12 34 56 78"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code_barre" className="flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              Code-barres
            </Label>
            <Input
              id="code_barre"
              value={formData.code_barre}
              onChange={(e) => onInputChange("code_barre", e.target.value)}
              placeholder="Code-barres du document"
              className="font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
