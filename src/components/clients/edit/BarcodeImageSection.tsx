
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode, CheckCircle, AlertCircle } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { BarcodeImageUpload } from "./BarcodeImageUpload";
import { useState, useEffect } from "react";

interface BarcodeImageSectionProps {
  client: Client;
  onClientUpdated?: () => void;
}

export const BarcodeImageSection = ({ client, onClientUpdated }: BarcodeImageSectionProps) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(client.code_barre_image_url);
  
  // Synchroniser l'état local avec les props du client
  useEffect(() => {
    setCurrentImageUrl(client.code_barre_image_url);
  }, [client.code_barre_image_url]);
  
  console.log('🔍 BarcodeImageSection - Analyse des données client:', {
    id: client.id,
    code_barre: client.code_barre,
    code_barre_image_url: currentImageUrl,
    client_image_url: client.code_barre_image_url,
    nom_prenom: `${client.nom} ${client.prenom}`
  });

  const hasBarcode = Boolean(client.code_barre?.trim());
  const hasBarcodeImage = Boolean(currentImageUrl?.trim());
  
  // Vérifier si l'image est dans le bon bucket barcode-images
  const isCorrectBucket = currentImageUrl?.includes('barcode-images') || false;

  console.log('📊 BarcodeImageSection - État des données barcode:', { 
    hasBarcode, 
    hasBarcodeImage, 
    isCorrectBucket,
    imageUrl: currentImageUrl 
  });

  const handleImageUploaded = (newImageUrl: string) => {
    console.log("🔄 BarcodeImageSection - Nouvelle image uploadée:", {
      url: newImageUrl,
      bucket: newImageUrl.includes('barcode-images') ? 'barcode-images' : 'autre'
    });
    
    // Mise à jour immédiate de l'état local
    setCurrentImageUrl(newImageUrl);
    
    // Appeler le callback pour rafraîchir les données du client parent
    if (onClientUpdated) {
      console.log("📞 BarcodeImageSection - Appel du callback onClientUpdated");
      onClientUpdated();
    }
  };

  // Si aucune donnée de code-barres
  if (!hasBarcode && !hasBarcodeImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Barcode className="w-4 h-4" />
            Code-barres
          </CardTitle>
          <CardDescription>
            Aucun code-barres ni image disponible pour ce client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarcodeImageUpload 
            clientId={client.id} 
            onImageUploaded={handleImageUploaded}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Barcode className="w-4 h-4" />
          Code-barres du client
          {hasBarcodeImage && (
            isCorrectBucket ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )
          )}
        </CardTitle>
        <CardDescription>
          {hasBarcodeImage ? (
            isCorrectBucket ? 
              'Code-barres avec image scannée (bucket: barcode-images)' : 
              'Code-barres avec image scannée (ancien bucket)'
          ) : 'Code-barres sans image'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Affichage du code-barres texte */}
          {hasBarcode && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-mono">
                <strong>Code-barres :</strong> {client.code_barre}
              </p>
            </div>
          )}

          {/* Affichage de l'image du code-barres */}
          {hasBarcodeImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg min-h-[140px]">
                <img 
                  src={currentImageUrl} 
                  alt="Image du code-barres scanné" 
                  className="max-w-full max-h-32 object-contain border border-gray-200 rounded"
                  onError={(e) => {
                    console.error('❌ ERREUR chargement image code-barres:', currentImageUrl);
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center">
                          <p class="text-red-600 text-sm font-medium">❌ Image non disponible</p>
                          <p class="text-xs text-gray-500 mt-1">URL: ${currentImageUrl}</p>
                          <p class="text-xs text-gray-500">Bucket correct: ${isCorrectBucket ? 'Oui' : 'Non'}</p>
                        </div>
                      `;
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ BarcodeImageSection - Image du code-barres chargée avec succès:', currentImageUrl);
                    console.log(`📁 Bucket utilisé: ${isCorrectBucket ? 'barcode-images (correct)' : 'autre bucket'}`);
                  }}
                  // Ajouter une clé pour forcer le rechargement de l'image
                  key={currentImageUrl}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm justify-center">
                <Image className="w-4 h-4" />
                <span className={isCorrectBucket ? "text-green-600" : "text-orange-600"}>
                  {isCorrectBucket ? 
                    "Image sauvegardée dans barcode-images" : 
                    "Image dans un ancien bucket"
                  }
                </span>
              </div>

              {/* Informations de débogage pour les admins */}
              {!isCorrectBucket && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <p className="text-orange-800">
                    <strong>Info technique :</strong> Cette image a été sauvegardée avant la mise à jour du système.
                    Les nouvelles images sont maintenant stockées dans le bucket "barcode-images".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload d'image si pas d'image ou pour remplacer */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {hasBarcodeImage ? "Remplacer l'image" : "Ajouter une image"}
              </span>
            </div>
            <BarcodeImageUpload 
              clientId={client.id} 
              onImageUploaded={handleImageUploaded}
            />
          </div>

          {/* Message informatif si code-barres sans image */}
          {hasBarcode && !hasBarcodeImage && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Code-barres enregistré sans image associée
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
