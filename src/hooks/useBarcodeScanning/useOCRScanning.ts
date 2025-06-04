
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
      console.log("🔍 OCR SCANNING - Début du scan avec upload automatique");

      // 1. Compression de l'image pour l'OCR (limite 1024 KB)
      console.log("🗜️ ÉTAPE 1: Compression de l'image pour OCR...");
      const compressedFileForOCR = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800 // Bien en dessous de la limite de 1024 KB
      });

      console.log("✅ Image compressée pour OCR:", {
        taille_originale: (file.size / 1024).toFixed(1) + " KB",
        taille_compressée: (compressedFileForOCR.size / 1024).toFixed(1) + " KB"
      });

      // 2. Upload de l'image vers barcode-images (utilise la compression interne)
      console.log("📤 ÉTAPE 2: Upload de l'image vers Supabase...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec upload image - abandon du processus");
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "");
        return;
      }
      
      console.log("✅ Image uploadée avec succès:", barcodeImageUrl);

      // 3. Scan OCR avec le fichier compressé
      console.log("🔍 ÉTAPE 3: Scan OCR avec le fichier compressé...");
      
      const formData = new FormData();
      formData.append('file', compressedFileForOCR); // 🔥 UTILISATION DU FICHIER COMPRESSÉ
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
      console.log("📄 Réponse OCR complète:", data);

      if (data.IsErroredOnProcessing) {
        console.error("❌ Erreur traitement OCR:", data.ErrorMessage);
        throw new Error(data.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      console.log("📝 Texte extrait:", extractedText);

      // 4. Extraction du code-barres et du téléphone avec les nouveaux extracteurs
      console.log("🔍 ÉTAPE 4: Extraction avec nouveaux extracteurs...");
      
      const phone = extractPhoneNumber(extractedText);
      const barcode = extractBarcode(extractedText, phone);

      console.log("🎯 Données extraites avec nouveaux extracteurs:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté",
        barcodeImageUrl: barcodeImageUrl
      });

      // 5. Message de succès pour l'extraction
      if (barcode || phone) {
        toast.success(`🎯 Données extraites avec succès: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''}`, {
          duration: 4000
        });
      }

      // 6. Retourner les résultats avec l'URL de l'image
      onResult(barcode, phone, barcodeImageUrl);

    } catch (error) {
      console.error("❌ Erreur processus OCR complet:", error);
      toast.error("❌ Erreur lors du scan du code-barres");
      onResult("", "");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
