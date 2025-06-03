
import { useState } from "react";
import { toast } from "sonner";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";
import { compressImage } from "@/utils/imageCompression";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [apiKey] = useState("K87783069388957");

  const extractBarcodeAndPhone = (text: string): { barcode?: string; phone?: string } => {
    console.log("Extracting barcode and phone from text:", text);
    
    const phone = extractPhoneNumber(text);
    const barcode = extractBarcode(text, phone);

    const result = { barcode, phone };
    console.log("Extracted data:", result);
    return result;
  };

  const scanForBarcodeAndPhone = async (file: File) => {
    setIsScanning(true);
    try {
      console.log("Scanning for barcode and phone number...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Barcode OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const extractedData = extractBarcodeAndPhone(parsedText);

      if (extractedData.barcode || extractedData.phone) {
        onBarcodeScanned(extractedData.barcode || "", extractedData.phone);
        toast.success(`Code-barres ${extractedData.barcode ? 'et numéro de téléphone ' : ''}extraits avec succès!`);
      } else {
        toast.warning("Aucun code-barres ou numéro de téléphone détecté dans l'image");
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      toast.error("Erreur lors du scan du code-barres");
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsCompressing(true);
      
      // Vérifier la taille du fichier original
      const originalSizeKB = file.size / 1024;
      console.log(`Taille originale: ${originalSizeKB.toFixed(1)} KB`);

      // Compresser l'image si nécessaire
      let processedFile = file;
      if (originalSizeKB > 800) { // Compresser si plus de 800KB pour être sûr de rester sous 1MB
        console.log("Compression de l'image nécessaire...");
        processedFile = await compressImage(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.8,
          maxSizeKB: 800
        });
        
        const compressedSizeKB = processedFile.size / 1024;
        const compressionRatio = ((file.size - processedFile.size) / file.size) * 100;
        
        console.log(`Image compressée: ${originalSizeKB.toFixed(1)}KB → ${compressedSizeKB.toFixed(1)}KB (-${compressionRatio.toFixed(0)}%)`);
        
        if (compressionRatio > 10) {
          toast.success(`Image compressée de ${compressionRatio.toFixed(0)}%`);
        }
      } else {
        console.log("Compression non nécessaire, taille acceptable");
      }

      setIsCompressing(false);

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
      };
      reader.readAsDataURL(processedFile);

      // Scan with OCR for barcode and phone
      await scanForBarcodeAndPhone(processedFile);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      toast.error("Erreur lors du traitement de l'image");
      setIsCompressing(false);
      
      // En cas d'erreur de compression, utiliser le fichier original
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
      };
      reader.readAsDataURL(file);
      
      await scanForBarcodeAndPhone(file);
    }
  };

  const resetScan = () => {
    setScannedImage(null);
  };

  return {
    isScanning,
    isCompressing,
    scannedImage,
    handleImageUpload,
    resetScan
  };
};
