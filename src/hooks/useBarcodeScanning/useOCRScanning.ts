
import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
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

      // 1. Upload de l'image vers barcode-images AVANT le scan OCR (avec compression automatique)
      console.log("📤 ÉTAPE 1: Upload et compression de l'image code-barres...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec upload image - abandon du processus");
        toast.error("❌ Impossible d'uploader l'image du code-barres");
        onResult("", "");
        return;
      }
      
      console.log("✅ Image uploadée avec succès:", barcodeImageUrl);

      // 2. Scan OCR de l'image (avec le fichier original non compressé pour une meilleure qualité OCR)
      console.log("🔍 ÉTAPE 2: Scan OCR de l'image...");
      
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

      // 3. Extraction du code-barres et du téléphone
      const barcodeMatch = extractedText.match(/[A-Z]{1,2}\d{4,}\s*<*/);
      const phoneMatch = extractedText.match(/(?:\+212|0)[\s\-]?[5-7][\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}/);

      const barcode = barcodeMatch ? barcodeMatch[0].replace(/[<\s]/g, '') : "";
      const phone = phoneMatch ? phoneMatch[0].replace(/[\s\-]/g, '') : "";

      console.log("🎯 Données extraites:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté",
        barcodeImageUrl: barcodeImageUrl
      });

      // 4. Message de succès pour l'extraction
      if (barcode || phone) {
        toast.success(`🎯 Données extraites avec succès: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''}`, {
          duration: 4000
        });
      }

      // 5. Retourner les résultats avec l'URL de l'image
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
