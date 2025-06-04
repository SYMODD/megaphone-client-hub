
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Barcode, Upload, Image as ImageIcon } from "lucide-react";
import { BarcodeImageUpload } from "./BarcodeImageUpload";
import { useState } from "react";

interface BarcodeImageSectionProps {
  code_barre: string;
  code_barre_image_url: string;
  onUpdate: (field: string, value: string) => void;
  onImageUploaded?: (imageUrl: string) => void;
}

export const BarcodeImageSection = ({ 
  code_barre, 
  code_barre_image_url, 
  onUpdate,
  onImageUploaded 
}: BarcodeImageSectionProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  console.log("🔍 BarcodeImageSection - État actuel:", {
    code_barre,
    code_barre_image_url,
    url_presente: code_barre_image_url ? "✅ OUI" : "❌ NON",
    url_valide: code_barre_image_url && code_barre_image_url.length > 0
  });

  const handleImageUploaded = (imageUrl: string) => {
    console.log("✅ BarcodeImageSection - Nouvelle image uploadée:", imageUrl);
    onUpdate('code_barre_image_url', imageUrl);
    if (onImageUploaded) {
      onImageUploaded(imageUrl);
    }
    setShowUpload(false);
    setImageError(false);
    setImageLoading(true);
  };

  const handleImageLoad = () => {
    console.log("✅ Image code-barres chargée avec succès:", code_barre_image_url);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error("❌ Erreur chargement image code-barres:", {
      url: code_barre_image_url,
      error: e,
      naturalWidth: e.target?.naturalWidth,
      naturalHeight: e.target?.naturalHeight
    });
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Barcode className="w-5 h-5 text-blue-600" />
        <Label className="text-base font-medium">Code-barres et Image</Label>
      </div>

      {/* Champ code-barres */}
      <div className="space-y-2">
        <Label htmlFor="code_barre" className="text-sm">Code-barres</Label>
        <input
          id="code_barre"
          type="text"
          value={code_barre}
          onChange={(e) => onUpdate('code_barre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez le code-barres"
        />
      </div>

      {/* Section image du code-barres */}
      <div className="space-y-2">
        <Label className="text-sm">Image du code-barres</Label>
        
        {code_barre_image_url ? (
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
                <p className="text-xs text-gray-500 break-all mb-2">{code_barre_image_url}</p>
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
                    onClick={() => setShowUpload(true)}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Remplacer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <img 
                  src={code_barre_image_url} 
                  alt="Image du code-barres"
                  className={`max-w-full h-auto max-h-32 rounded border mx-auto ${imageLoading ? 'hidden' : 'block'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  key={code_barre_image_url} // Force reload si URL change
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Remplacer l'image
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">Aucune image de code-barres</p>
            <Button
              variant="outline"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Ajouter une image
            </Button>
          </div>
        )}

        {/* Debug info en mode développement */}
        {process.env.NODE_ENV === 'development' && code_barre_image_url && (
          <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
            <strong>Debug:</strong> {code_barre_image_url}
          </div>
        )}
      </div>

      {/* Composant d'upload */}
      {showUpload && (
        <BarcodeImageUpload
          currentImageUrl={code_barre_image_url}
          onImageUploaded={handleImageUploaded}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};
