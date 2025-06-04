
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useState } from "react";

interface ClientPhotoSectionProps {
  client: Client;
}

export const ClientPhotoSection = ({ client }: ClientPhotoSectionProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  console.log("📷 ClientPhotoSection - Données client:", {
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    photo_url: client.photo_url,
    photo_url_present: client.photo_url ? "✅ OUI" : "❌ NON"
  });

  if (!client.photo_url) {
    console.log("❌ ClientPhotoSection - Aucune photo_url disponible");
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm">
          <Image className="w-4 h-4" />
          Photo scannée
        </Label>
        <div className="border rounded-lg p-4 bg-gray-50 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Image className="w-8 h-8" />
            <p>Aucune photo disponible</p>
          </div>
        </div>
      </div>
    );
  }

  const handleImageLoad = () => {
    console.log("✅ Image chargée avec succès:", client.photo_url);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error("❌ Erreur chargement image:", {
      url: client.photo_url,
      error: e,
      naturalWidth: e.target?.naturalWidth,
      naturalHeight: e.target?.naturalHeight
    });
    setImageError(true);
    setImageLoading(false);
  };

  const testImageUrl = () => {
    console.log("🔍 Test de l'URL de l'image:", client.photo_url);
    window.open(client.photo_url, '_blank');
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Image className="w-4 h-4" />
        Photo scannée
      </Label>
      <div className="border rounded-lg p-4 bg-gray-50">
        {imageLoading && !imageError && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement de l'image...</p>
          </div>
        )}
        
        {imageError ? (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
              <Image className="w-8 h-8" />
              <p>Erreur de chargement de l'image</p>
            </div>
            <p className="text-xs text-gray-500 mb-2">URL: {client.photo_url}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Réessayer
              </button>
              <button
                onClick={testImageUrl}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Tester l'URL
              </button>
            </div>
          </div>
        ) : (
          <img 
            src={client.photo_url} 
            alt="Photo du client"
            className={`max-w-full h-auto max-h-48 rounded-lg shadow-md mx-auto ${imageLoading ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            key={client.photo_url}
          />
        )}
      </div>
      
      {/* Informations de debug */}
      <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
        <strong>URL:</strong> {client.photo_url}
        <br />
        <strong>Statut:</strong> {imageError ? "❌ Erreur" : imageLoading ? "⏳ Chargement" : "✅ Chargée"}
      </div>
    </div>
  );
};
