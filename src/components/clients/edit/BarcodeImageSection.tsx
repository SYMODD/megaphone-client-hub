
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Upload, Image as ImageIcon } from "lucide-react";
import { BarcodeImageUpload } from "./BarcodeImageUpload";
import { useState } from "react";

interface BarcodeImageSectionProps {
  code_barre: string;
  code_barre_image_url: string;
  onUpdate: (field: string, value: string) => void;
  onImageUploaded: (imageUrl: string) => void;
}

export const BarcodeImageSection = ({ 
  code_barre, 
  code_barre_image_url, 
  onUpdate, 
  onImageUploaded 
}: BarcodeImageSectionProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  console.log("📊 BarcodeImageSection - Données:", {
    code_barre,
    code_barre_image_url,
    url_presente: code_barre_image_url ? "✅ OUI" : "❌ NON"
  });

  const handleImageLoad = () => {
    console.log("✅ Image code-barres chargée avec succès:", code_barre_image_url);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error("❌ Erreur chargement image code-barres:", {
      url: code_barre_image_url,
      error: e
    });
    setImageError(true);
    setImageLoading(false);
  };

  const testImageUrl = () => {
    console.log("🔍 Test de l'URL de l'image code-barres:", code_barre_image_url);
    window.open(code_barre_image_url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="w-5 h-5" />
          Image du Code-barres
        </CardTitle>
        <CardDescription>
          Image scannée du code-barres du document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affichage de l'image actuelle */}
        {code_barre_image_url ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image actuelle</Label>
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
                    <ImageIcon className="w-8 h-8" />
                    <p>Erreur de chargement</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">URL: {code_barre_image_url}</p>
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
                  src={code_barre_image_url} 
                  alt="Image du code-barres"
                  className={`max-w-full h-auto max-h-32 rounded-lg shadow-md mx-auto ${imageLoading ? 'hidden' : 'block'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  key={code_barre_image_url}
                />
              )}
            </div>
            
            {/* Informations de debug */}
            <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
              <strong>URL:</strong> {code_barre_image_url}
              <br />
              <strong>Statut:</strong> {imageError ? "❌ Erreur" : imageLoading ? "⏳ Chargement" : "✅ Chargée"}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <QrCode className="w-8 h-8" />
              <p>Aucune image de code-barres disponible</p>
            </div>
          </div>
        )}

        {/* Section d'upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Upload className="w-4 h-4" />
            {code_barre_image_url ? "Remplacer l'image" : "Ajouter une image"}
          </Label>
          <BarcodeImageUpload 
            code_barre={code_barre}
            onImageUploaded={onImageUploaded}
          />
        </div>
      </CardContent>
    </Card>
  );
};
