
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageSectionProps {
  client: Client;
}

export const BarcodeImageSection = ({ client }: BarcodeImageSectionProps) => {
  if (!client.code_barre_image_url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Image du code-barres
          </CardTitle>
          <CardDescription>
            Aucune image de code-barres disponible pour ce client
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Barcode className="w-4 h-4" />
          Image du code-barres
        </CardTitle>
        <CardDescription>
          Image du code-barres scannée automatiquement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-4 bg-gray-50 border rounded-lg">
          <img 
            src={client.code_barre_image_url} 
            alt="Code-barres scanné" 
            className="max-w-full max-h-32 object-contain"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Image className="w-4 h-4" />
          <span>Image sauvegardée lors du scan automatique</span>
        </div>
      </CardContent>
    </Card>
  );
};
