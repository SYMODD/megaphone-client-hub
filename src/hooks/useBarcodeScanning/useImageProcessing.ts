
import { useState } from "react";
import { useOCRScanning } from "./useOCRScanning";
import { compressImage } from "@/utils/imageCompression";

interface UseImageProcessingProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useImageProcessing = ({ onBarcodeScanned }: UseImageProcessingProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  const { scanForBarcodeAndPhone } = useOCRScanning();

  const handleImageUpload = async (file: File) => {
    try {
      setIsCompressing(true);
      console.log("🔍 IMAGE PROCESSING - Début traitement avec compression automatique");
      console.log("📄 Taille fichier original:", file.size, "bytes");

      // 1. Créer preview de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
        console.log("✅ Aperçu image créé");
      };
      reader.readAsDataURL(file);

      // 2. Compression automatique si nécessaire (limite OCR = 1024 KB)
      let processedFile = file;
      const maxSizeKB = 1000; // Garde une marge de sécurité sous 1024 KB
      
      if (file.size > maxSizeKB * 1024) {
        console.log("📦 COMPRESSION NÉCESSAIRE - Taille dépasse", maxSizeKB, "KB");
        
        try {
          const compressedFile = await compressImage(file, {
            maxSizeKB: maxSizeKB,
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200
          });
          
          processedFile = compressedFile;
          console.log("✅ Image compressée:", processedFile.size, "bytes");
        } catch (compressionError) {
          console.error("❌ Erreur compression:", compressionError);
          console.log("⚠️ Tentative sans compression...");
        }
      } else {
        console.log("✅ Taille fichier OK, pas de compression nécessaire");
      }

      // 3. Scanner pour extraire barcode et téléphone avec upload automatique
      console.log("🔍 Scan OCR pour extraction données avec fichier traité...");
      await scanForBarcodeAndPhone(processedFile, onBarcodeScanned);
      
    } catch (error) {
      console.error("❌ Erreur traitement image:", error);
      onBarcodeScanned("", "", "");
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
