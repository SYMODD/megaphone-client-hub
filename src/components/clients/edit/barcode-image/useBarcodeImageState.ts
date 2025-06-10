
import { useState, useEffect } from "react";

interface UseBarcodeImageStateProps {
  code_barre_image_url: string;
}

export const useBarcodeImageState = ({ code_barre_image_url }: UseBarcodeImageStateProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  console.log("📊 useBarcodeImageState - INITIALISATION:", {
    props_url: code_barre_image_url,
    current_url: currentImageUrl,
    type_props: typeof code_barre_image_url,
    type_current: typeof currentImageUrl
  });

  // Synchronisation directe et simplifiée
  useEffect(() => {
    console.log("🔄 useBarcodeImageState - SYNCHRONISATION:", {
      url_entrante: code_barre_image_url,
      url_actuelle: currentImageUrl,
      different: code_barre_image_url !== currentImageUrl
    });

    if (code_barre_image_url !== currentImageUrl) {
      setCurrentImageUrl(code_barre_image_url || "");
      setImageError(false);
      
      // Démarrer le chargement seulement si on a une URL valide
      if (code_barre_image_url && code_barre_image_url.trim() !== "") {
        setImageLoading(true);
      } else {
        setImageLoading(false);
      }
      
      console.log("✅ useBarcodeImageState - URL MISE À JOUR:", {
        nouvelle_url: code_barre_image_url || "",
        imageLoading: !!(code_barre_image_url && code_barre_image_url.trim() !== ""),
        imageError: false
      });
    }
  }, [code_barre_image_url, currentImageUrl]);

  const handleImageLoad = () => {
    console.log("✅ useBarcodeImageState - Image chargée:", currentImageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error("❌ useBarcodeImageState - Erreur image:", {
      url: currentImageUrl,
      error: e,
      timestamp: new Date().toISOString()
    });
    setImageError(true);
    setImageLoading(false);
  };

  const retryImageLoad = () => {
    console.log("🔄 useBarcodeImageState - Retry chargement:", currentImageUrl);
    setImageError(false);
    setImageLoading(true);
    // Force un nouveau chargement avec timestamp pour éviter le cache
    const urlWithTimestamp = currentImageUrl + (currentImageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    setCurrentImageUrl(urlWithTimestamp);
  };

  const testImageUrl = () => {
    console.log("🔍 useBarcodeImageState - Test URL:", currentImageUrl);
    if (currentImageUrl) {
      window.open(currentImageUrl, '_blank');
    }
  };

  const hasValidImageUrl = !!(currentImageUrl && 
                             currentImageUrl.trim() !== "" && 
                             currentImageUrl !== "null" && 
                             currentImageUrl !== "undefined");

  console.log("📊 useBarcodeImageState - ÉTAT FINAL:", {
    currentImageUrl,
    hasValidImageUrl,
    imageLoading,
    imageError,
    showUpload
  });

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
