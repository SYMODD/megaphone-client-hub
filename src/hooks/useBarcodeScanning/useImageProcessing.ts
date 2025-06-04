
import { useState } from "react";
import { useOCRScanning } from "./useOCRScanning";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage } from "@/utils/imageCompression";

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
      console.log("🔍 IMAGE PROCESSING - Début traitement avec compression");

      // 1. Compression de l'image AVANT traitement
      console.log("🗜️ Compression de l'image...");
      const compressedFile = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeKB: 500
      });
      
      console.log("✅ Image compressée:", {
        taille_originale: `${(file.size / 1024).toFixed(1)} KB`,
        taille_compressee: `${(compressedFile.size / 1024).toFixed(1)} KB`,
        reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%`
      });

      // 2. Créer preview de l'image compressée
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setScannedImage(result);
        console.log("✅ Aperçu image créé");
      };
      reader.readAsDataURL(compressedFile);

      // 3. Scanner pour extraire barcode et téléphone avec l'image compressée
      console.log("🔍 Scan OCR pour extraction données...");
      const extractedData = await scanImageForData(compressedFile);
      
      if (extractedData.barcode) {
        console.log("📊 Code-barres détecté:", extractedData.barcode);
        
        // 4. Upload automatique de l'image du code-barres compressée
        console.log("📤 Upload automatique image code-barres compressée...");
        const barcodeImageUrl = await uploadBarcodeImage(compressedFile);
        
        if (barcodeImageUrl) {
          console.log("✅ Image code-barres compressée uploadée:", barcodeImageUrl);
          
          // 5. Transmettre TOUTES les données avec l'URL
          onBarcodeScanned(
            extractedData.barcode, 
            extractedData.phone, 
            barcodeImageUrl
          );
          
          console.log("🎉 TRANSMISSION COMPLÈTE avec compression:", {
            barcode: extractedData.barcode,
            phone: extractedData.phone || "Non détecté",
            barcodeImageUrl: barcodeImageUrl,
            statut: "✅ SUCCÈS TOTAL AVEC COMPRESSION"
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
