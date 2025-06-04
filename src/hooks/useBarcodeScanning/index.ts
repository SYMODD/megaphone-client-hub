
import { useState } from "react";
import { useImageProcessing } from "./useImageProcessing";
import { useDataExtraction } from "./useDataExtraction";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const { compressImage, isCompressing } = useImageProcessing();
  const { scanForBarcodeAndPhone, isScanning } = useDataExtraction();

  const handleImageUpload = async (file: File) => {
    try {
      console.log("📤 useBarcodeScanning - Début traitement image");
      
      // Compression de l'image pour l'aperçu
      const compressedImage = await compressImage(file);
      setScannedImage(compressedImage);

      // Scan OCR avec l'image originale (non compressée) pour de meilleurs résultats
      await scanForBarcodeAndPhone(file, (barcode: string, phone?: string, barcodeImageUrl?: string) => {
        console.log("📋 useBarcodeScanning - Résultats du scan reçus:", {
          barcode,
          phone, 
          barcodeImageUrl,
          url_transmise: barcodeImageUrl ? "✅ OUI" : "❌ NON"
        });

        // Transmettre au composant parent avec l'URL de l'image
        onBarcodeScanned(barcode, phone, barcodeImageUrl);
      });
      
    } catch (error) {
      console.error("❌ Erreur lors du traitement de l'image:", error);
      onBarcodeScanned("", "", ""); // Échec complet
    }
  };

  const resetScan = () => {
    console.log("🔄 Réinitialisation du scan");
    setScannedImage(null);
  };

  return {
    scannedImage,
    isScanning,
    isCompressing,
    handleImageUpload,
    resetScan
  };
};
