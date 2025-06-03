
import { useState } from "react";
import { toast } from "sonner";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "./useImageUpload";

export const useOCRScanning = () => {
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();
  const [apiKey] = useState("K82173618788957");

  const scanForBarcodeAndPhone = async (file: File, onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
    console.log("=== DÉBUT SCAN BARCODE URGENT ===");
    let barcodeImageUrl: string | null = null;
    
    try {
      // 1. PRIORITÉ ABSOLUE: Sauvegarder l'image
      console.log("📸 SAUVEGARDE IMAGE PRIORITAIRE...");
      barcodeImageUrl = await uploadBarcodeImage(file);
      console.log("Image uploadée:", barcodeImageUrl);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        // Même si OCR échoue, on retourne l'image
        onBarcodeScanned("", undefined, barcodeImageUrl || undefined);
        toast.warning("OCR échoué mais image sauvegardée");
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      
      if (!parsedText.trim()) {
        onBarcodeScanned("", undefined, barcodeImageUrl || undefined);
        toast.warning("Aucun texte détecté mais image sauvegardée");
        return;
      }

      const extractedData = extractBarcodeAndPhone(parsedText);
      
      // CORRECTION CRITIQUE: Seul le téléphone du CODE-BARRES est retourné
      const phoneFromBarcode = extractedData.phone;
      
      console.log("✅ DONNÉES FINALES:", {
        barcode: extractedData.barcode || "",
        phone: phoneFromBarcode, 
        imageUrl: barcodeImageUrl
      });
      
      onBarcodeScanned(extractedData.barcode || "", phoneFromBarcode, barcodeImageUrl || undefined);
      
      const items = [];
      if (extractedData.barcode) items.push("code-barres");
      if (phoneFromBarcode) items.push("téléphone");
      if (barcodeImageUrl) items.push("image");
      
      toast.success(`Extraction réussie: ${items.join(", ")}`);
      
    } catch (error) {
      console.error("ERREUR SCAN:", error);
      // Même en cas d'erreur, retourner l'image si elle existe
      if (barcodeImageUrl) {
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.error("Erreur scan mais image sauvegardée");
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
