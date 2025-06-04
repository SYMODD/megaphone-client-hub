
import { useState } from "react";
import { useOCRScanning } from "./useOCRScanning";
import { useImageUpload } from "@/hooks/useImageUpload";

interface UseImageProcessingProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useImageProcessing = ({ onBarcodeScanned }: UseImageProcessingProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  const { scanForBarcodeAndPhone } = useOCRScanning();
  const { uploadBarcodeImage } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    try {
      setIsCompressing(true);
      console.log("🔍 IMAGE PROCESSING - Début traitement complet");

      // 1. Créer preview de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
        console.log("✅ Aperçu image créé");
      };
      reader.readAsDataURL(file);

      // 2. Scanner pour extraire barcode et téléphone avec upload automatique
      console.log("🔍 Scan OCR pour extraction données...");
      await scanForBarcodeAndPhone(file, onBarcodeScanned);
      
    } catch (error) {
      console.error("❌ Erreur traitement image:", error);
      onBarcodeScanned("", "");
    } finally {
      setIsCompressing(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan");
    setScannedImage(null);
  };

  return {
    isCompressing,
    scannedImage,
    handleImageUpload,
    resetScan
  };
};
