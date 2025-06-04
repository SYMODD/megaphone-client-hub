
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
        setIsScanning(false);
        return;
      }

      console.log("✅ Image de code-barres uploadée avec succès:", barcodeImageUrl);

      // 2. Simulation du scan OCR (en attente de l'implémentation réelle de l'API OCR)
      console.log("🔍 Démarrage simulation du scan OCR...");
      
      // Réduire le délai et s'assurer que le processus se termine
      await new Promise(resolve => {
        setTimeout(() => {
          console.log("⏰ Timeout OCR terminé");
          resolve(true);
        }, 1500); // Réduit de 2000ms à 1500ms
      });
      
      // Simulation d'extraction de données (à remplacer par la vraie API OCR)
      const mockBarcode = `BC${Date.now().toString().slice(-6)}`;
      const mockPhone = file.name.includes('tel') ? '+212600000000' : undefined;
      
      console.log("📊 Données extraites (simulation):", {
        barcode: mockBarcode,
        phone: mockPhone,
        imageUrl: barcodeImageUrl,
        bucket: 'barcode-images'
      });

      // 3. S'assurer que l'état scanning est mis à false AVANT d'appeler le callback
      setIsScanning(false);
      
      console.log("🚀 Transmission des données au callback avec URL:", {
        barcode: mockBarcode,
        phone: mockPhone,
        barcodeImageUrl: barcodeImageUrl,
        url_non_nulle: barcodeImageUrl ? "✅ OUI" : "❌ NON"
      });

      // 4. Appeler le callback après avoir mis à jour l'état
      onBarcodeScanned(mockBarcode, mockPhone, barcodeImageUrl);
      
      console.log("✅ Scan OCR terminé avec succès - URL transmise");
      toast.success("Code-barres extrait avec succès !");
      
    } catch (error) {
      console.error("❌ Erreur lors du scan OCR:", error);
      toast.error("Erreur lors du scan de l'image");
      setIsScanning(false); // S'assurer que l'état est réinitialisé en cas d'erreur
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
