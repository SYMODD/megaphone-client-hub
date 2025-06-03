
import { useState, useCallback } from "react";
import { useOCRScanning } from "./useOCRScanning";
import { useImageProcessing } from "./useImageProcessing";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "./useImageUpload";

interface UseBarcodeScanning {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
}

export const useBarcodeScanning = ({ onBarcodeScanned }: UseBarcodeScanning) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const { scanWithOCR } = useOCRScanning();
  const { compressImage } = useImageProcessing();
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();

  const handleImageUpload = useCallback(async (file: File) => {
    console.log("🔄 Début du traitement de l'image...");
    setIsCompressing(true);
    
    try {
      // Compression de l'image
      const compressedFile = await compressImage(file);
      if (!compressedFile) {
        console.error("❌ Échec de la compression");
        return;
      }

      // Créer une URL pour l'aperçu
      const imageUrl = URL.createObjectURL(compressedFile);
      setScannedImage(imageUrl);
      
      setIsCompressing(false);
      setIsScanning(true);

      // Upload de l'image vers Supabase Storage
      console.log("📤 Upload vers Supabase Storage...");
      const barcodeImageUrl = await uploadBarcodeImage(compressedFile);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec de l'upload de l'image");
        setIsScanning(false);
        return;
      }
      
      console.log("✅ Image uploadée avec succès:", barcodeImageUrl);

      // Analyse OCR
      const ocrResult = await scanWithOCR(compressedFile);
      
      if (ocrResult?.text) {
        console.log("📄 Texte OCR extrait:", ocrResult.text);
        
        // Extraction des données
        const { barcode, phone } = extractBarcodeAndPhone(ocrResult.text);
        
        console.log("📊 Données extraites:", { barcode, phone, barcodeImageUrl });
        
        // Transmission des données avec l'URL de l'image
        if (barcode || phone) {
          onBarcodeScanned(barcode || "", phone, barcodeImageUrl);
        } else {
          console.warn("⚠️ Aucune donnée extraite, mais image sauvegardée");
          // Même si aucune donnée n'est extraite, on transmet l'URL de l'image
          onBarcodeScanned("", "", barcodeImageUrl);
        }
      } else {
        console.warn("⚠️ Aucun texte détecté par OCR, mais image sauvegardée");
        // Même en cas d'échec OCR, on transmet l'URL de l'image
        onBarcodeScanned("", "", barcodeImageUrl);
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement:", error);
    } finally {
      setIsScanning(false);
    }
  }, [scanWithOCR, compressImage, extractBarcodeAndPhone, uploadBarcodeImage, onBarcodeScanned]);

  const resetScan = useCallback(() => {
    setScannedImage(null);
    setIsScanning(false);
    setIsCompressing(false);
  }, []);

  return {
    isScanning,
    isCompressing,
    scannedImage,
    handleImageUpload,
    resetScan
  };
};
