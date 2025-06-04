
import { useState, useEffect } from "react";

interface UseBarcodeImageStateProps {
  code_barre_image_url: string;
}

export const useBarcodeImageState = ({ code_barre_image_url }: UseBarcodeImageStateProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  console.log("📊 useBarcodeImageState - Données reçues:", {
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

  const hasValidImageUrl = currentImageUrl && currentImageUrl.trim() !== "";

  return {
    imageError,
    imageLoading,
    showUpload,
    currentImageUrl,
    hasValidImageUrl,
    setCurrentImageUrl,
    setShowUpload,
    setImageError,
    setImageLoading,
    handleImageLoad,
    handleImageError,
    retryImageLoad,
    testImageUrl
  };
};
