
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageSectionProps {
  client: Client;
}

export const BarcodeImageSection = ({ client }: BarcodeImageSectionProps) => {
  console.log('BarcodeImageSection - client data:', {
    id: client.id,
    code_barre: client.code_barre,
    code_barre_image_url: client.code_barre_image_url
  });

  if (!client.code_barre_image_url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Image du code-barres
          </CardTitle>
          <CardDescription>
            {client.code_barre 
              ? "Code-barres présent mais aucune image sauvegardée" 
              : "Aucun code-barres ni image disponible pour ce client"
            }
          </CardDescription>
        </CardHeader>
        {client.code_barre && (
          <CardContent>
            <div className="p-3 bg-gray-50 border rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Code-barres (texte) :</strong> {client.code_barre}
              </p>
            </div>
          </CardContent>
        )}
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
                console.error('Erreur lors du chargement de l\'image:', client.code_barre_image_url);
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<p class="text-red-600 text-sm">Erreur de chargement de l\'image</p>';
                }
              }}
              onLoad={() => {
                console.log('Image du code-barres chargée avec succès:', client.code_barre_image_url);
              }}
            />
          </div>
          
          {client.code_barre && (
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
