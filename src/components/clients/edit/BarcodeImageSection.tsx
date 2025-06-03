
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
  });

  // CORRECTION: Vérifications améliorées pour l'affichage de l'image
  const hasBarcode = client.code_barre && client.code_barre.trim() !== '';
  const hasBarcodeImage = client.code_barre_image_url && 
                          client.code_barre_image_url.trim() !== '' && 
                          client.code_barre_image_url !== 'undefined' &&
                          client.code_barre_image_url !== 'null' &&
                          client.code_barre_image_url.startsWith('http');

  console.log('Barcode check détaillé:', { 
    hasBarcode, 
    hasBarcodeImage, 
    rawUrl: client.code_barre_image_url,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Barcode className="w-4 h-4" />
          Code-barres du client
        </CardTitle>
        <CardDescription>
          {hasBarcodeImage ? 'Image du code-barres scannée automatiquement' : 'Informations du code-barres'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Affichage du code-barres texte */}
          {hasBarcode && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Code-barres (texte) :</strong> {client.code_barre}
              </p>
            </div>
          )}

          {/* CORRECTION: Affichage de l'image avec vérifications strictes */}
          {hasBarcodeImage ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center p-4 bg-gray-50 border rounded-lg min-h-[120px]">
                <img 
                  src={client.code_barre_image_url} 
                  alt="Code-barres scanné" 
                  className="max-w-full max-h-32 object-contain border"
                  onError={(e) => {
                    console.error('❌ ERREUR chargement image code-barres:', client.code_barre_image_url);
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center">
                          <p class="text-red-600 text-sm font-medium">❌ Erreur de chargement</p>
                          <p class="text-xs text-gray-500 mt-1">URL: ${client.code_barre_image_url}</p>
                        </div>
                      `;
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Image du code-barres chargée avec succès:', client.code_barre_image_url);
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Image className="w-4 h-4" />
                <span>Image sauvegardée lors du scan automatique</span>
              </div>
            </div>
          ) : (
            /* Message informatif quand pas d'image */
            <div className="p-4 bg-gray-50 border rounded-lg text-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {hasBarcode ? "Code-barres textuel disponible" : "Aucun code-barres détecté"}
                </p>
                <p className="text-xs text-gray-500">
                  {hasBarcode 
                    ? "Aucune image sauvegardée pour ce code-barres" 
                    : "Scannez un document pour extraire automatiquement le code-barres"
                  }
                </p>
              </div>
            </div>
          )}

          {/* Conseil pour les futurs scans */}
          {!hasBarcode && !hasBarcodeImage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                💡 <strong>Conseil :</strong> Utilisez le scanner automatique lors de la création/modification d'un client pour capturer automatiquement l'image du code-barres.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
