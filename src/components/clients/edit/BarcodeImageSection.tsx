
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageSectionProps {
  client: Client;
}

export const BarcodeImageSection = ({ client }: BarcodeImageSectionProps) => {
  console.log('BarcodeImageSection - données client:', {
    id: client.id,
    code_barre: client.code_barre,
    code_barre_image_url: client.code_barre_image_url,
    photo_url: client.photo_url
  });

  // CORRECTION: Vérification améliorée de l'image du code-barres
  const hasBarcode = client.code_barre && client.code_barre.trim() !== '';
  const hasBarcodeImage = client.code_barre_image_url && client.code_barre_image_url.trim() !== '';

  if (!hasBarcode && !hasBarcodeImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Image du code-barres
          </CardTitle>
          <CardDescription>
            Aucun code-barres ni image disponible pour ce client
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasBarcode && !hasBarcodeImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Image du code-barres
          </CardTitle>
          <CardDescription>
            Code-barres présent mais aucune image sauvegardée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Code-barres (texte) :</strong> {client.code_barre}
            </p>
          </div>
        </CardContent>
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
        <div className="space-y-3">
          <div className="flex items-center justify-center p-4 bg-gray-50 border rounded-lg">
            <img 
              src={client.code_barre_image_url} 
              alt="Code-barres scanné" 
              className="max-w-full max-h-32 object-contain"
              onError={(e) => {
                console.error('ERREUR chargement image code-barres:', client.code_barre_image_url);
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<p class="text-red-600 text-sm">❌ Erreur de chargement de l\'image</p>';
                }
              }}
              onLoad={() => {
                console.log('✅ Image du code-barres chargée avec succès:', client.code_barre_image_url);
              }}
            />
          </div>
          
          {hasBarcode && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Code-barres (texte) :</strong> {client.code_barre}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Image className="w-4 h-4" />
            <span>Image sauvegardée lors du scan automatique</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
