
import { useState } from "react";
import { toast } from "sonner";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const extractBarcodeAndPhone = (text: string): { barcode?: string; phone?: string } => {
    console.log("Extracting barcode and phone from text:", text);
    
    const phone = extractPhoneNumber(text);
    const barcode = extractBarcode(text, phone);

    const result = { barcode, phone };
    console.log("Extracted data:", result);
    return result;
  };

  const compressImageSimple = async (file: File): Promise<File> => {
    const maxSize = 800 * 1024; // 800KB
    
    if (file.size <= maxSize) {
      return file;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxDimension = 1024;
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const scanForBarcodeAndPhone = async (file: File) => {
    setIsScanning(true);
    try {
      console.log("Scanning for barcode and phone number...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', 'K87783069388957');
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
        const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("OCR Error:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      const parsedText = result.ParsedResults?.[0]?.ParsedText || "";
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
    if (!file) {
      console.error("No file provided");
      return;
    }

    try {
      setIsCompressing(true);
      
      // Compress image if needed
      let processedFile = file;
      const originalSizeKB = file.size / 1024;
      
      if (originalSizeKB > 800) {
        console.log("Compressing image...");
        processedFile = await compressImageSimple(file);
        const compressedSizeKB = processedFile.size / 1024;
        console.log(`Image compressed: ${originalSizeKB.toFixed(1)}KB → ${compressedSizeKB.toFixed(1)}KB`);
      }

      setIsCompressing(false);

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setScannedImage(result);
        }
      };
      reader.readAsDataURL(processedFile);

      // Scan with OCR
      await scanForBarcodeAndPhone(processedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Erreur lors du traitement de l'image");
      setIsCompressing(false);
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
