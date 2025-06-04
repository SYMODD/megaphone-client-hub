
import { useState } from "react";
import { useOCRScanning } from "./useOCRScanning";
import { useImageUpload } from "@/hooks/useImageUpload";

interface UseImageProcessingProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useImageProcessing = ({ onBarcodeScanned }: UseImageProcessingProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  const { scanImageForData } = useOCRScanning();
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

      // 2. Scanner pour extraire barcode et téléphone
      console.log("🔍 Scan OCR pour extraction données...");
      const extractedData = await scanImageForData(file);
      
      if (extractedData.barcode) {
        console.log("📊 Code-barres détecté:", extractedData.barcode);
        
        // 3. Upload automatique de l'image du code-barres
        console.log("📤 Upload automatique image code-barres...");
        const barcodeImageUrl = await uploadBarcodeImage(file);
        
        if (barcodeImageUrl) {
          console.log("✅ Image code-barres uploadée:", barcodeImageUrl);
          
          // 4. Transmettre TOUTES les données avec l'URL
          onBarcodeScanned(
            extractedData.barcode, 
            extractedData.phone, 
            barcodeImageUrl // 🎯 URL CRITIQUE
          );
          
          console.log("🎉 TRANSMISSION COMPLÈTE:", {
            barcode: extractedData.barcode,
            phone: extractedData.phone || "Non détecté",
            barcodeImageUrl: barcodeImageUrl,
            statut: "✅ SUCCÈS TOTAL"
          });
        } else {
          console.warn("⚠️ Échec upload image, transmission sans URL");
          onBarcodeScanned(extractedData.barcode, extractedData.phone);
        }
      } else {
        console.warn("⚠️ Aucun code-barres détecté dans l'image");
        onBarcodeScanned("", extractedData.phone);
      }
      
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
