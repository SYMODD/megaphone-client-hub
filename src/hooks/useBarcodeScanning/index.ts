
import { useState } from "react";
import { useImageProcessing } from "./useImageProcessing";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const { 
    isCompressing, 
    scannedImage, 
    handleImageUpload: processImageUpload, 
    resetScan 
  } = useImageProcessing({ onBarcodeScanned });
  
  const [isScanning] = useState(false); // Keep for compatibility

  const handleImageUpload = async (file: File) => {
    console.log("📤 useBarcodeScanning - Début traitement image");
    await processImageUpload(file);
  };

  return {
    scannedImage,
    isScanning,
    isCompressing,
    handleImageUpload,
    resetScan
  };
};
