
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
      console.log("🔥 OCR SCANNING - DÉBUT du processus unifié");

      // 1. Compression pour OCR d'abord
      console.log("🔥 ÉTAPE 1: Compression pour OCR...");
      const compressedFileForOCR = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800
      });

      // 2. Scan OCR en parallèle de l'upload pour optimiser
      console.log("🔥 ÉTAPE 2: Scan OCR...");
      
      // Upload et OCR en parallèle
      const [uploadResult, ocrResult] = await Promise.all([
        uploadBarcodeImage(file),
        performOCR(compressedFileForOCR)
      ]);

      // 3. Vérification upload
      if (!uploadResult || typeof uploadResult !== 'string' || uploadResult.trim() === '') {
        console.error("❌ ÉCHEC UPLOAD:", uploadResult);
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "", "");
        return;
      }

      console.log("✅ UPLOAD CONFIRMÉ:", {
        url: uploadResult,
        longueur: uploadResult.length,
        validation: "URL garantie valide"
      });

      // 4. Traitement OCR
      if (!ocrResult.success) {
        console.error("❌ Erreur OCR:", ocrResult.error);
        toast.error(ocrResult.error || "❌ Erreur lors du traitement OCR");
        onResult("", "", uploadResult); // Transmettre l'URL même si OCR échoue
        return;
      }

      const extractedText = ocrResult.data || "";
      
      // 5. Extraction des données
      const phone = extractPhoneNumber(extractedText);
      const barcode = extractBarcode(extractedText, phone);

      console.log("🔥 RÉSULTATS FINAUX:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté",
        barcodeImageUrl: uploadResult,
        url_validation: "✅ URL GARANTIE TRANSMISE"
      });

      // 6. TRANSMISSION FINALE avec garantie absolue
      console.log("🔥 APPEL onResult avec URL GARANTIE:", {
        param1_barcode: barcode,
        param2_phone: phone,
        param3_barcodeImageUrl: uploadResult,
        url_status: "ABSOLUMENT GARANTIE"
      });

      onResult(barcode, phone, uploadResult);

      if (barcode || phone) {
        toast.success(`🎯 Scan réussi: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''} Image ✓`);
      } else {
        toast.success("📸 Image uploadée avec succès (données non détectées)");
      }

    } catch (error) {
      console.error("❌ Erreur processus OCR:", error);
      toast.error("❌ Erreur lors du scan");
      onResult("", "", "");
    } finally {
      setIsScanning(false);
    }
  };

  // Fonction OCR séparée pour simplifier
  const performOCR = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
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
        throw new Error(`Erreur API OCR: ${response.status}`);
      }

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      
      return {
        success: true,
        data: extractedText
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur OCR inconnue"
      };
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
