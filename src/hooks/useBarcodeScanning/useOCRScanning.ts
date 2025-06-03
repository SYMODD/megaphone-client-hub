
import { useState } from "react";
import { toast } from "sonner";
import { useImageUpload } from "../useImageUpload";

interface UseOCRScanningProps {}

export const useOCRScanning = (props?: UseOCRScanningProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();

  const scanForBarcodeAndPhone = async (
    file: File,
    onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    console.log("🔍 DÉBUT SCAN OCR pour code-barres - Upload vers barcode-images");
    setIsScanning(true);

    try {
      // 1. Upload de l'image vers barcode-images en PREMIER
      console.log("📤 Upload de l'image de code-barres vers barcode-images...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec de l'upload de l'image de code-barres");
        toast.error("Impossible d'uploader l'image de code-barres");
        return;
      }

      console.log("✅ Image de code-barres uploadée avec succès:", barcodeImageUrl);

      // 2. Simulation du scan OCR (en attente de l'implémentation réelle de l'API OCR)
      console.log("🔍 Simulation du scan OCR...");
      
      // Pour l'instant, on simule un délai et on retourne l'URL de l'image
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulation d'extraction de données (à remplacer par la vraie API OCR)
      const mockBarcode = `BC${Date.now().toString().slice(-6)}`;
      const mockPhone = file.name.includes('tel') ? '+212600000000' : undefined;
      
      console.log("📊 Données extraites (simulation):", {
        barcode: mockBarcode,
        phone: mockPhone,
        imageUrl: barcodeImageUrl,
        bucket: 'barcode-images'
      });

      // 3. Callback avec les données extraites ET l'URL de l'image uploadée
      onBarcodeScanned(mockBarcode, mockPhone, barcodeImageUrl);
      
      console.log("✅ Scan OCR terminé avec succès");
      
    } catch (error) {
      console.error("❌ Erreur lors du scan OCR:", error);
      toast.error("Erreur lors du scan de l'image");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
