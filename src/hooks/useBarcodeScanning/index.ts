
import { useState } from "react";
import { useImageProcessing } from "./useImageProcessing";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const [isScanning, setIsScanning] = useState(false);
  
  const { isCompressing, scannedImage, handleImageUpload, resetScan } = useImageProcessing({
    onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => {
      setIsScanning(false);
      onBarcodeScanned(barcode, phone, barcodeImageUrl);
    }
  });

  const handleImageUploadWithScanning = async (file: File) => {
    setIsScanning(true);
    await handleImageUpload(file);
  };

  return {
    isScanning,
    isCompressing,
    scannedImage,
    handleImageUpload: handleImageUploadWithScanning,
    resetScan
  };
};
