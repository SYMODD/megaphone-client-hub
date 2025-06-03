
import { useState } from "react";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageCompression";
import { useOCRScanning } from "./useOCRScanning";

interface UseImageProcessingProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useImageProcessing = ({ onBarcodeScanned }: UseImageProcessingProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [barcodePreviewImage, setBarcodePreviewImage] = useState<string | null>(null);
  const { scanForBarcodeAndPhone } = useOCRScanning();

  const handleImageUpload = async (file: File) => {
    if (!file) {
      console.warn("No file provided to handleImageUpload");
      return;
    }

    console.log("=== DÉBUT TRAITEMENT IMAGE CODE-BARRES ===");
    console.log("Fichier pour scan code-barres:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      purpose: "SCAN CODE-BARRES UNIQUEMENT - PAS photo client"
    });

    try {
      setIsCompressing(true);
      
      const originalSizeKB = file.size / 1024;
      console.log(`Taille originale: ${originalSizeKB.toFixed(1)} KB`);

      let processedFile = file;
      if (originalSizeKB > 800) {
        console.log("Compression de l'image code-barres nécessaire...");
        processedFile = await compressImage(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.8,
          maxSizeKB: 800
        });
        
        const compressedSizeKB = processedFile.size / 1024;
        const compressionRatio = ((file.size - processedFile.size) / file.size) * 100;
        
        console.log(`Image code-barres compressée: ${originalSizeKB.toFixed(1)}KB → ${compressedSizeKB.toFixed(1)}KB (-${compressionRatio.toFixed(0)}%)`);
        
        if (compressionRatio > 10) {
          toast.success(`Image compressée de ${compressionRatio.toFixed(0)}%`);
        }
      } else {
        console.log("Compression non nécessaire, taille acceptable");
      }

      setIsCompressing(false);

      // Preview UNIQUEMENT pour le scanner de code-barres (PAS pour la photo client)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBarcodePreviewImage(result);
        console.log("✅ Image code-barres set pour PREVIEW SEULEMENT (pas pour photo client)");
      };
      reader.readAsDataURL(processedFile);

      // Lancer le scan pour code-barres UNIQUEMENT
      console.log("🚀 Lancement du scan OCR pour code-barres...");
      await scanForBarcodeAndPhone(processedFile, onBarcodeScanned);
    } catch (error) {
      console.error("❌ Erreur lors du traitement de l'image code-barres:", error);
      toast.error(`Erreur lors du traitement de l'image: ${error.message}`);
      setIsCompressing(false);
      
      // Afficher l'image même en cas d'erreur de compression
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBarcodePreviewImage(result);
      };
      reader.readAsDataURL(file);
      
      // Essayer le scan avec l'image originale
      await scanForBarcodeAndPhone(file, onBarcodeScanned);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset du scan de code-barres - NE TOUCHE PAS à la photo client");
    setBarcodePreviewImage(null);
  };

  return {
    isCompressing,
    scannedImage: barcodePreviewImage, // Renommé pour clarté mais garde la compatibilité
    handleImageUpload,
    resetScan
  };
};
