
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Upload, Image as ImageIcon, RefreshCw } from "lucide-react";
import { BarcodeImageUpload } from "./BarcodeImageUpload";
import { useState, useEffect } from "react";

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
  const [showUpload, setShowUpload] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  console.log("📊 BarcodeImageSection - Données reçues:", {
    code_barre,
    code_barre_image_url,
    currentImageUrl,
    url_presente: currentImageUrl ? "✅ OUI" : "❌ NON"
  });

  // 🎯 SYNCHRONISATION SIMPLIFIÉE - Accepter toute URL non-null
  useEffect(() => {
    const incomingUrl = code_barre_image_url || "";
    
    if (incomingUrl !== currentImageUrl) {
      console.log("🔄 Mise à jour URL image:", {
        ancienne: currentImageUrl,
        nouvelle: incomingUrl,
        source: code_barre_image_url
      });
      setCurrentImageUrl(incomingUrl);
      setImageError(false);
      setImageLoading(!!incomingUrl);
    }
  }, [code_barre_image_url, currentImageUrl]);

  // Vérifier si nous avons une URL d'image valide
  const hasValidImageUrl = currentImageUrl && currentImageUrl.trim() !== "";

  const handleImageLoad = () => {
    console.log("✅ Image code-barres chargée avec succès:", currentImageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error("❌ Erreur chargement image code-barres:", {
      url: currentImageUrl,
      error: e
    });
    setImageError(true);
    setImageLoading(false);
  };

  const retryImageLoad = () => {
    console.log("🔄 Retry chargement image:", currentImageUrl);
    setImageError(false);
    setImageLoading(true);
    const urlWithTimestamp = currentImageUrl + (currentImageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    setCurrentImageUrl(urlWithTimestamp);
  };

  const testImageUrl = () => {
    console.log("🔍 Test de l'URL de l'image code-barres:", currentImageUrl);
    window.open(currentImageUrl, '_blank');
  };

  const handleImageUploaded = (imageUrl: string) => {
    console.log("✅ Nouvelle image uploadée:", imageUrl);
    setCurrentImageUrl(imageUrl);
    onImageUploaded(imageUrl);
    setShowUpload(false);
    setImageError(false);
    setImageLoading(true);
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
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
        {hasValidImageUrl ? (
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
                  <p className="text-xs text-gray-500 mb-2 break-all">URL: {currentImageUrl}</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <button
                      onClick={retryImageLoad}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
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
                  src={currentImageUrl} 
                  alt="Image du code-barres"
                  className={`max-w-full h-auto max-h-32 rounded-lg shadow-md mx-auto ${imageLoading ? 'hidden' : 'block'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  key={currentImageUrl}
                />
              )}
            </div>
            
            {/* Informations de debug */}
            <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
              <strong>URL:</strong> {currentImageUrl}
              <br />
              <strong>Statut:</strong> {imageError ? "❌ Erreur" : imageLoading ? "⏳ Chargement" : "✅ Chargée"}
              <br />
              <strong>Correction:</strong> ✅ Synchronisation directe sans validation excessive
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
              <QrCode className="w-8 h-8" />
              <p>Aucune image de code-barres disponible</p>
            </div>
            <p className="text-xs text-gray-400">
              URL reçue: {code_barre_image_url || "aucune"}
            </p>
          </div>
        )}

        {/* Section d'upload */}
        {!showUpload ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Upload className="w-4 h-4" />
              {hasValidImageUrl ? "Remplacer l'image" : "Ajouter une image"}
            </button>
          </div>
        ) : (
          <BarcodeImageUpload 
            currentImageUrl={currentImageUrl}
            onImageUploaded={handleImageUploaded}
            onCancel={handleCancelUpload}
          />
        )}
      </CardContent>
    </Card>
  );
};
