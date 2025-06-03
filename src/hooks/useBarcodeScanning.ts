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
      console.log("Starting barcode and phone scan...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng+fre+ara');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      console.log("Sending request to OCR API for barcode extraction...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Barcode OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("OCR processing error:", errorMsg);
        toast.error(errorMsg);
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("Parsed text for barcode extraction:", parsedText);
      
      if (!parsedText.trim()) {
        toast.warning("Aucun texte détecté dans l'image");
        return;
      }

      const extractedData = extractBarcodeAndPhone(parsedText);

      if (extractedData.barcode || extractedData.phone) {
        const successItems = [];
        if (extractedData.barcode) successItems.push("code-barres");
        if (extractedData.phone) successItems.push("numéro de téléphone");
        
        onBarcodeScanned(extractedData.barcode || "", extractedData.phone);
        toast.success(`${successItems.join(" et ")} extraits avec succès!`);
      } else {
        toast.warning("Aucun code-barres ou numéro de téléphone détecté dans l'image");
        console.log("No barcode or phone number found in text:", parsedText);
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Timeout: Le scan a pris trop de temps");
      } else if (error.message.includes('Failed to fetch')) {
        toast.error("Erreur de connexion: Impossible de joindre le service OCR");
      } else {
        toast.error("Erreur lors du scan du code-barres");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsCompressing(true);
      
      const originalSizeKB = file.size / 1024;
      console.log(`Taille originale: ${originalSizeKB.toFixed(1)} KB`);

      let processedFile = file;
      if (originalSizeKB > 800) {
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

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
      };
      reader.readAsDataURL(processedFile);

      await scanForBarcodeAndPhone(processedFile);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      toast.error("Erreur lors du traitement de l'image");
      setIsCompressing(false);
      
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
