
import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage } from "@/utils/imageCompression";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";
import { toast } from "sonner";

interface UseOCRScanningProps {}

export const useOCRScanning = (props?: UseOCRScanningProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();

  const scanForBarcodeAndPhone = async (
    file: File, 
    onResult: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    try {
      setIsScanning(true);
      console.log("🔥 OCR SCANNING - DÉBUT du processus complet");

      // 1. Upload de l'image IMMÉDIATEMENT
      console.log("🔥 ÉTAPE 1: Upload immédiat de l'image...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ ÉCHEC CRITIQUE: Impossible d'uploader l'image");
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "", "");
        return;
      }
      
      console.log("🔥 UPLOAD RÉUSSI - URL obtenue:", {
        url: barcodeImageUrl,
        longueur: barcodeImageUrl.length,
        type: typeof barcodeImageUrl
      });

      // 2. Compression pour OCR
      console.log("🔥 ÉTAPE 2: Compression pour OCR...");
      const compressedFileForOCR = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800
      });

      // 3. Scan OCR
      console.log("🔥 ÉTAPE 3: Scan OCR...");
      const formData = new FormData();
      formData.append('file', compressedFileForOCR);
      formData.append('apikey', 'K87899883388957');
      formData.append('language', 'fre');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'false');
      formData.append('scale', 'true');
      formData.append('isTable', 'false');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error("❌ Erreur API OCR:", response.status, response.statusText);
        throw new Error(`Erreur API OCR: ${response.status}`);
      }

      const data = await response.json();
      console.log("📄 Réponse OCR:", data);

      if (data.IsErroredOnProcessing) {
        console.error("❌ Erreur traitement OCR:", data.ErrorMessage);
        throw new Error(data.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      
      // 4. Extraction des données
      const phone = extractPhoneNumber(extractedText);
      const barcode = extractBarcode(extractedText, phone);

      console.log("🔥 EXTRACTION TERMINÉE:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté"
      });

      // 5. TRANSMISSION FINALE avec URL GARANTIE
      console.log("🔥 TRANSMISSION FINALE:", {
        barcode,
        phone, 
        barcodeImageUrl,
        url_garantie: "✅ URL UPLOADÉE AVEC SUCCÈS"
      });

      onResult(barcode, phone, barcodeImageUrl);

      if (barcode || phone) {
        toast.success(`🎯 Scan réussi: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''} Image ✓`);
      }

    } catch (error) {
      console.error("❌ Erreur processus OCR:", error);
      toast.error("❌ Erreur lors du scan");
      onResult("", "", "");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
