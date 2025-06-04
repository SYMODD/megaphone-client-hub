
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Barcode, CheckCircle, AlertCircle } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useState, useEffect } from "react";

interface BarcodeImageSectionProps {
  client: Client;
  onClientUpdated?: () => void;
}

export const BarcodeImageSection = ({ client, onClientUpdated }: BarcodeImageSectionProps) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(client.code_barre_image_url);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Synchroniser l'état local avec les props du client
  useEffect(() => {
    setCurrentImageUrl(client.code_barre_image_url);
    if (client.code_barre_image_url) {
      setImageStatus('loading');
    }
  }, [client.code_barre_image_url]);
  
  console.log('🔍 BarcodeImageSection - Analyse des données client:', {
    id: client.id,
    code_barre: client.code_barre,
    code_barre_image_url: currentImageUrl,
    client_image_url: client.code_barre_image_url,
    nom_prenom: `${client.nom} ${client.prenom}`,
    status: imageStatus
  });

  const hasBarcode = Boolean(client.code_barre?.trim());
  const hasBarcodeImage = Boolean(currentImageUrl?.trim());
  
  // Vérifier si l'image est dans le bon bucket barcode-images
  const isCorrectBucket = currentImageUrl?.includes('barcode-images') || false;

  console.log('📊 BarcodeImageSection - État des données barcode:', { 
    hasBarcode, 
    hasBarcodeImage, 
    isCorrectBucket,
    imageUrl: currentImageUrl,
    imageStatus
  });

  const handleImageLoad = () => {
    console.log('✅ BarcodeImageSection - Image du code-barres chargée avec succès:', currentImageUrl);
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    console.error('❌ ERREUR chargement image code-barres:', currentImageUrl);
    setImageStatus('error');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Barcode className="w-4 h-4" />
          Code-barres du client
          {hasBarcodeImage && imageStatus === 'loaded' && (
            isCorrectBucket ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )
          )}
        </CardTitle>
        <CardDescription>
          {hasBarcodeImage ? (
            imageStatus === 'loaded' ? (
              isCorrectBucket ? 
                'Code-barres avec image scannée (bucket: barcode-images)' : 
                'Code-barres avec image scannée (ancien bucket)'
            ) : imageStatus === 'error' ? 
              'Code-barres avec image (erreur de chargement)' :
              'Code-barres avec image (chargement...)'
          ) : 'Code-barres sans image - Scan automatique lors de l\'ajout du client'}
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
                {imageStatus === 'loading' && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Chargement de l'image...</p>
                  </div>
                )}
                
                {imageStatus === 'error' && (
                  <div className="text-center">
                    <p className="text-red-600 text-sm font-medium">❌ Image non disponible</p>
                    <p className="text-xs text-gray-500 mt-1">URL: {currentImageUrl?.substring(0, 60)}...</p>
                    <p className="text-xs text-gray-500">Bucket correct: {isCorrectBucket ? 'Oui' : 'Non'}</p>
                  </div>
                )}
                
                {hasBarcodeImage && (
                  <img 
                    src={currentImageUrl} 
                    alt="Image du code-barres scanné" 
                    className={`max-w-full max-h-32 object-contain border border-gray-200 rounded ${imageStatus === 'loaded' ? 'block' : 'hidden'}`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    key={currentImageUrl}
                  />
                )}
              </div>
              
              {imageStatus === 'loaded' && (
                <div className="flex items-center gap-2 text-sm justify-center">
                  <Image className="w-4 h-4" />
                  <span className={isCorrectBucket ? "text-green-600" : "text-orange-600"}>
                    {isCorrectBucket ? 
                      "Image sauvegardée dans barcode-images" : 
                      "Image dans un ancien bucket"
                    }
                  </span>
                </div>
              )}

              {/* Informations de débogage pour les admins */}
              {!isCorrectBucket && imageStatus === 'loaded' && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <p className="text-orange-800">
                    <strong>Info technique :</strong> Cette image a été sauvegardée avant la mise à jour du système.
                    Les nouvelles images sont maintenant stockées dans le bucket "barcode-images".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message informatif si code-barres sans image */}
          {hasBarcode && !hasBarcodeImage && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Code-barres enregistré sans image associée
              </p>
              <p className="text-xs text-gray-500 mt-1">
                L'image est automatiquement sauvegardée lors du scan CIN
              </p>
            </div>
          )}

          {/* Message si aucun code-barres */}
          {!hasBarcode && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Aucun code-barres enregistré pour ce client
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Le code-barres est automatiquement extrait lors du scan CIN
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
