
import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage } from "@/utils/imageCompression";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";
import { useOCRRequest } from "@/hooks/useOCRRequest";
import { toast } from "sonner";

interface UseOCRScanningProps {}

export const useOCRScanning = (props?: UseOCRScanningProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();
  const { performOCR } = useOCRRequest();

  const scanForBarcodeAndPhone = async (
    file: File, 
    onResult: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    try {
      setIsScanning(true);
      console.log("📱 === DÉBUT SCAN CODE-BARRES AVEC HOOK CENTRALISÉ ===");

      // 1. Upload de l'image IMMÉDIATEMENT
      console.log("📤 ÉTAPE 1: Upload immédiat de l'image...");
      
      let barcodeImageUrl: string | null = null;
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;

      while (!barcodeImageUrl && uploadAttempts < maxUploadAttempts) {
        uploadAttempts++;
        console.log(`🔄 TENTATIVE UPLOAD ${uploadAttempts}/${maxUploadAttempts}`);

        barcodeImageUrl = await uploadBarcodeImage(file);
        
        if (barcodeImageUrl && typeof barcodeImageUrl === 'string' && barcodeImageUrl.trim() !== '') {
          console.log(`✅ UPLOAD RÉUSSI à la tentative ${uploadAttempts}:`, barcodeImageUrl);
          break;
        } else {
          console.warn(`⚠️ ÉCHEC UPLOAD tentative ${uploadAttempts}`);
          
          if (uploadAttempts < maxUploadAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!barcodeImageUrl || typeof barcodeImageUrl !== 'string' || barcodeImageUrl.trim() === '') {
        console.error("❌ ÉCHEC CRITIQUE: Impossible d'uploader l'image");
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "", "");
        return;
      }

      console.log("🎯 UPLOAD CONFIRMÉ:", barcodeImageUrl.substring(0, 50) + "...");

      // 2. Compression pour OCR
      console.log("🔄 ÉTAPE 2: Compression pour OCR...");
      const compressedFileForOCR = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800
      });

      // 3. Scan OCR avec hook centralisé et clé PRO par défaut
      console.log("🔄 ÉTAPE 3: Scan OCR avec hook centralisé...");
      const extractedText = await performOCR(compressedFileForOCR, 'helloworld');

      // 4. Extraction des données
      const phone = extractPhoneNumber(extractedText);
      const barcode = extractBarcode(extractedText, phone);

      console.log("🔍 EXTRACTION TERMINÉE:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté"
      });

      // 5. TRANSMISSION FINALE
      console.log("✅ APPEL onResult avec URL validée:", barcodeImageUrl);
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
      console.log("📱 === FIN SCAN CODE-BARRES ===");
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
