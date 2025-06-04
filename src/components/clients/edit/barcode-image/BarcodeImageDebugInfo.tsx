
import React from "react";

interface BarcodeImageDebugInfoProps {
  currentImageUrl: string;
  imageError: boolean;
  imageLoading: boolean;
}

export const BarcodeImageDebugInfo = ({ currentImageUrl, imageError, imageLoading }: BarcodeImageDebugInfoProps) => {
  const urlStatus = !currentImageUrl ? "❌ Vide" : 
                   currentImageUrl === "null" ? "❌ String 'null'" :
                   currentImageUrl === "undefined" ? "❌ String 'undefined'" :
                   currentImageUrl.trim() === "" ? "❌ String vide" :
                   "✅ URL valide";

  return (
    <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
      <strong>URL:</strong> {currentImageUrl || "AUCUNE"}
      <br />
      <strong>Statut URL:</strong> {urlStatus}
      <br />
      <strong>État image:</strong> {imageError ? "❌ Erreur" : imageLoading ? "⏳ Chargement" : "✅ Prête"}
      <br />
      <strong>Longueur:</strong> {currentImageUrl?.length || 0} caractères
      <br />
      <strong>Test URL:</strong> 
      {currentImageUrl && (
        <button 
          onClick={() => window.open(currentImageUrl, '_blank')}
          className="ml-1 text-blue-600 underline text-xs"
        >
          Ouvrir dans nouvel onglet
        </button>
      )}
    </div>
  );
};
