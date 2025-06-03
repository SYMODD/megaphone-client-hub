
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Barcode } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";
import { formatBarcodeForDisplay } from "@/utils/barcodeUtils";

interface ContactInfoSectionProps {
  formData: {
    numero_telephone: string;
    code_barre: string;
    code_barre_image_url?: string;
    [key: string]: any;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ContactInfoSection = ({ formData, onInputChange }: ContactInfoSectionProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("📤 ContactInfoSection - Données reçues:", { barcode, phone, barcodeImageUrl });
    
    if (barcode) {
      onInputChange("code_barre", barcode);
    }
    if (phone) {
      onInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      onInputChange("code_barre_image_url", barcodeImageUrl);
    }
  };

  const displayBarcode = formatBarcodeForDisplay(formData.code_barre);

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
        {/* Scanner en premier */}
        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScanned}
          currentBarcode={formData.code_barre}
        />
        
        {/* Champs de saisie avec un meilleur alignement */}
        <div className="space-y-4">
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
              value={displayBarcode}
              onChange={(e) => {
                // Si l'utilisateur modifie manuellement, garder la valeur telle qu'elle est
                onInputChange("code_barre", e.target.value);
              }}
              placeholder="Code-barres du document"
              className="font-mono"
            />
            {displayBarcode !== formData.code_barre && formData.code_barre && (
              <p className="text-xs text-gray-500">
                Valeur complète stockée : {formData.code_barre}
              </p>
            )}
          </div>

          {formData.code_barre_image_url && (
            <div className="space-y-2">
              <Label>Image du code-barres scanné</Label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <img 
                  src={formData.code_barre_image_url} 
                  alt="Image du code-barres" 
                  className="max-w-full max-h-32 object-contain mx-auto"
                />
                <p className="text-xs text-green-600 mt-2 text-center">
                  ✅ Image sauvegardée automatiquement
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
