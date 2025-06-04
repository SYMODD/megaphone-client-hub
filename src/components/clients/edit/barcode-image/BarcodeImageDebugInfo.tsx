
import React from "react";

interface BarcodeImageDebugInfoProps {
  currentImageUrl: string;
  imageError: boolean;
  imageLoading: boolean;
}

export const BarcodeImageDebugInfo = ({ currentImageUrl, imageError, imageLoading }: BarcodeImageDebugInfoProps) => {
  return (
    <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
      <strong>URL:</strong> {currentImageUrl}
      <br />
      <strong>Statut:</strong> {imageError ? "❌ Erreur" : imageLoading ? "⏳ Chargement" : "✅ Chargée"}
      <br />
      <strong>Correction:</strong> ✅ Synchronisation directe sans validation excessive
    </div>
  );
};
