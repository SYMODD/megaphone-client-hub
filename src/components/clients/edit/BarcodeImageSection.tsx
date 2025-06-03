
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageSectionProps {
  client: Client;
}

export const BarcodeImageSection = ({ client }: BarcodeImageSectionProps) => {
  console.log('BARCODE IMAGE DEBUG:', {
    id: client.id,
    code_barre: client.code_barre,
    code_barre_image_url: client.code_barre_image_url,
  });

  const hasBarcode = client.code_barre && client.code_barre.trim() !== '';
  
  // Amélioration de la validation de l'URL de l'image
  const hasBarcodeImage = client.code_barre_image_url && 
                          client.code_barre_image_url.trim() !== '' && 
                          client.code_barre_image_url !== 'undefined' &&
                          client.code_barre_image_url !== 'null' &&
                          (client.code_barre_image_url.includes('http') || 
                           client.code_barre_image_url.includes('supabase'));

  console.log('IMAGE CHECK:', { hasBarcode, hasBarcodeImage, url: client.code_barre_image_url });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Barcode className="w-4 h-4" />
          Code-barres du client
        </CardTitle>
        <CardDescription>
          {hasBarcodeImage ? 'Image du code-barres disponible' : 'Code-barres textuel uniquement'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hasBarcode && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Code-barres :</strong> {client.code_barre}
              </p>
            </div>
          )}

          {hasBarcodeImage ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center p-4 bg-gray-50 border rounded-lg min-h-[120px]">
                <img 
                  src={client.code_barre_image_url} 
                  alt="Code-barres scanné" 
                  className="max-w-full max-h-32 object-contain border rounded shadow-sm"
                  onError={(e) => {
                    console.error('ERREUR IMAGE:', client.code_barre_image_url);
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center text-red-600 p-4">
                          <p class="font-medium">❌ Erreur chargement image</p>
                          <p class="text-sm mt-1 text-gray-500">URL: ${client.code_barre_image_url}</p>
                        </div>
                      `;
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ IMAGE CHARGÉE:', client.code_barre_image_url);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Image sauvegardée automatiquement lors du scan
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border rounded-lg text-center">
              <p className="text-sm text-gray-600">
                {hasBarcode ? "Aucune image sauvegardée pour ce code-barres" : "Aucun code-barres enregistré"}
              </p>
              {!hasBarcode && (
                <p className="text-xs text-gray-400 mt-1">
                  Utilisez le scanner de code-barres pour capturer automatiquement les données
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
