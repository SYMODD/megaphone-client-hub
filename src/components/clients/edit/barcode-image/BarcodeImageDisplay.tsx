
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
  if (imageLoading && !imageError) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Chargement de l'image...</p>
      </div>
    );
  }

  if (imageError) {
    return null; // Error handled by BarcodeImageError component
  }

  return (
    <img 
      src={currentImageUrl} 
      alt="Image du code-barres"
      className={`max-w-full h-auto max-h-32 rounded-lg shadow-md mx-auto ${imageLoading ? 'hidden' : 'block'}`}
      onLoad={onLoad}
      onError={onError}
      key={currentImageUrl}
    />
  );
};
