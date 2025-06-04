
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

      // 1. Upload de l'image IMMÉDIATEMENT avec logs détaillés
      console.log("🔥 ÉTAPE 1: Upload immédiat de l'image...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      console.log("🔥 RÉSULTAT UPLOAD - Analyse détaillée:", {
        url_retournée: barcodeImageUrl,
        url_type: typeof barcodeImageUrl,
        url_length: barcodeImageUrl?.length || 0,
        url_truthy: !!barcodeImageUrl,
        url_valide: barcodeImageUrl && barcodeImageUrl.trim() !== "",
        timestamp: new Date().toISOString()
      });
      
      if (!barcodeImageUrl) {
        console.error("❌ ÉCHEC CRITIQUE: Impossible d'uploader l'image", {
          file_info: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          url_retournée: barcodeImageUrl,
          timestamp: new Date().toISOString()
        });
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "", "");
        return;
      }
      
      console.log("✅ UPLOAD RÉUSSI - URL confirmée:", {
        url: barcodeImageUrl,
        longueur: barcodeImageUrl.length,
        type: typeof barcodeImageUrl,
        starts_with: barcodeImageUrl.substring(0, 50) + "...",
        url_complète_valide: "✅ URL UPLOADÉE AVEC SUCCÈS",
        timestamp: new Date().toISOString()
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

      // 5. TRANSMISSION FINALE avec URL GARANTIE - Logs ultra-détaillés
      console.log("🔥 TRANSMISSION FINALE - Préparation des données:", {
        barcode_extrait: barcode,
        phone_extrait: phone, 
        barcodeImageUrl_final: barcodeImageUrl,
        url_status: {
          existe: !!barcodeImageUrl,
          non_vide: barcodeImageUrl && barcodeImageUrl.trim() !== "",
          longueur: barcodeImageUrl?.length || 0,
          type: typeof barcodeImageUrl,
          preview: barcodeImageUrl ? barcodeImageUrl.substring(0, 100) + "..." : "AUCUNE"
        },
        timestamp: new Date().toISOString()
      });

      console.log("🔥 APPEL onResult - Paramètres exacts:", {
        param1_barcode: barcode,
        param2_phone: phone,
        param3_barcodeImageUrl: barcodeImageUrl,
        fonction_callback: "onResult appelée avec ces paramètres",
        timestamp: new Date().toISOString()
      });

      // APPEL DE LA FONCTION CALLBACK
      onResult(barcode, phone, barcodeImageUrl);

      console.log("✅ CALLBACK EXÉCUTÉE - onResult appelée avec succès", {
        url_transmise: barcodeImageUrl,
        verification_finale: "URL transmise au callback",
        timestamp: new Date().toISOString()
      });

      if (barcode || phone) {
        toast.success(`🎯 Scan réussi: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''} Image ✓`);
      }

    } catch (error) {
      console.error("❌ Erreur processus OCR:", error, {
        timestamp: new Date().toISOString(),
        context: "useOCRScanning.scanForBarcodeAndPhone"
      });
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
