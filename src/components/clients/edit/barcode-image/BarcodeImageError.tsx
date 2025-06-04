
import React from "react";
import { ImageIcon, RefreshCw } from "lucide-react";

interface BarcodeImageErrorProps {
  currentImageUrl: string;
  onRetry: () => void;
  onTest: () => void;
}

export const BarcodeImageError = ({ currentImageUrl, onRetry, onTest }: BarcodeImageErrorProps) => {
  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
        <ImageIcon className="w-8 h-8" />
        <p>Erreur de chargement</p>
      </div>
      <p className="text-xs text-gray-500 mb-2 break-all">URL: {currentImageUrl}</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Réessayer
        </button>
        <button
          onClick={onTest}
          className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Tester l'URL
        </button>
      </div>
    </div>
  );
};
