
import React from "react";

interface BarcodeImageDisplayProps {
  currentImageUrl: string;
  imageLoading: boolean;
  imageError: boolean;
  onLoad: () => void;
  onError: (e: any) => void;
}

export const BarcodeImageDisplay = ({ 
  currentImageUrl, 
  imageLoading, 
  imageError, 
  onLoad, 
  onError 
}: BarcodeImageDisplayProps) => {
  console.log("🖼️ BarcodeImageDisplay - RENDU:", {
    currentImageUrl,
    imageLoading,
    imageError,
    url_valide: !!(currentImageUrl && currentImageUrl.trim() !== "")
  });

  if (imageError) {
    return null; // Error handled by BarcodeImageError component
  }

  if (!currentImageUrl || currentImageUrl.trim() === "") {
    console.log("⚠️ BarcodeImageDisplay - URL vide, pas d'affichage");
    return null;
  }

  return (
    <div className="text-center space-y-2">
      {imageLoading && (
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-1 text-xs text-gray-600">Chargement...</p>
        </div>
      )}
      <img 
        src={currentImageUrl} 
        alt="Image du code-barres"
        className="max-w-full h-auto max-h-48 rounded-lg shadow-md mx-auto border"
        onLoad={() => {
          console.log("✅ BarcodeImageDisplay - Image chargée avec succès");
          onLoad();
        }}
        onError={(e) => {
          console.error("❌ BarcodeImageDisplay - Erreur chargement:", e);
          onError(e);
        }}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
      {!imageLoading && (
        <p className="text-xs text-gray-500">
          Image du code-barres scanné
        </p>
      )}
    </div>
  );
};
